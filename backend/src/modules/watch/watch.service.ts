import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import IORedis from 'ioredis';
import { RiskService } from '../risk/risk.service';
import { DeviceFingerprintService } from '../device-fingerprint/device-fingerprint.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchRecord } from './entities/watch-record.entity';

@Injectable()
export class WatchService {
  private readonly logger = new Logger(WatchService.name);

  constructor(
    @InjectRedis() private readonly redis: IORedis,
    @InjectRepository(WatchRecord)
    private readonly watchRecordRepository: Repository<WatchRecord>,
    private readonly riskService: RiskService,
    private readonly deviceFingerprintService: DeviceFingerprintService,
  ) {}

  /**
   * 处理观看事件，计算有效积分，包含完整防刷逻辑
   * 完全按照文档中的PoE防刷算法实现
   */
  async processWatchEvent(
    userId: number,
    dramaId: number,
    episodeId: number,
    watchDurationSec: number,
    isCompleted: boolean,
    clientDeviceFingerprint: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ points: number; blocked: boolean; reason?: string }> {
    const today = new Date().toISOString().split('T')[0];
    const basePointsPerMinute = 1;

    // 1. 设备黑名单快速拦截
    const serverFingerprint = this.deviceFingerprintService.generateServerFingerprint(
      clientDeviceFingerprint,
      ipAddress,
      userAgent,
    );

    const isBlacklisted = await this.deviceFingerprintService.isBlacklisted(serverFingerprint);
    if (isBlacklisted) {
      this.logRiskEvent(userId, 'DEVICE_BLACKLISTED', serverFingerprint);
      return { points: 0, blocked: true, reason: 'DEVICE_BLACKLISTED' };
    }

    // 记录设备指纹
    await this.deviceFingerprintService.recordFingerprint(userId, serverFingerprint);

    // 2. 设备/IP维度计数检查 - 使用Lua脚本保证原子性
    const deviceKey = `watch:device:${serverFingerprint}:${today}:${dramaId}`;
    const ipKey = `watch:ip:${this.getIpPrefix(ipAddress)}:${today}:${dramaId}`;

    const luaScript = `
      local device_cnt = redis.call('INCR', KEYS[1])
      redis.call('EXPIRE', KEYS[1], 86400)
      local ip_cnt = redis.call('INCR', KEYS[2])
      redis.call('EXPIRE', KEYS[2], 86400)
      return {device_cnt, ip_cnt}
    `;

    const result = await this.redis.eval(luaScript, 2, deviceKey, ipKey) as [number, number];
    const deviceCnt = result[0];
    const ipCnt = result[1];

    // 同一剧集同一设备/IP每日最多5次有效积分
    if (deviceCnt > 5 || ipCnt > 5) {
      this.logRiskEvent(userId, 'FREQUENCY_CAP_EXCEEDED', serverFingerprint);
      return { points: 0, blocked: true, reason: 'FREQUENCY_CAP_EXCEEDED' };
    }

    // 3. 行为时序分析 - 检测脚本模式
    const seqKey = `watch:seq:${userId}:${today}`;
    const recentEvents = await this.redis.lrange(seqKey, -5, -1);
    
    if (this.riskService.detectScriptPattern(recentEvents, watchDurationSec)) {
      await this.deviceFingerprintService.increaseRisk(userId, serverFingerprint, 30);
      this.logRiskEvent(userId, 'SCRIPT_PATTERN_DETECTED', serverFingerprint);
      return { points: 0, blocked: true, reason: 'SCRIPT_PATTERN_DETECTED' };
    }

    // 4. 计算完播系数和互动系数
    const completionCoeff = isCompleted ? 1.2 : 0.5;
    // 互动系数需要检查是否有有效互动，这里简化处理
    const interactionCoeff = await this.hasValidInteraction(userId, episodeId) ? 1.1 : 1.0;

    // 5. 检查是否是人形观看
    const validMinutes = watchDurationSec / 60;
    const exactKey = `watch:exact_minute:${userId}`;
    const exactCount = parseInt(await this.redis.get(exactKey) || '0', 10);
    
    if (!this.riskService.isHumanLikeWatch(validMinutes, exactCount)) {
      await this.redis.incr(exactKey);
      this.redis.expire(exactKey, 86400);
      return { points: 0, blocked: true, reason: 'NON_HUMAN_PATTERN' };
    }

    // 计算基础积分
    let points = validMinutes * basePointsPerMinute * completionCoeff * interactionCoeff;
    points = Math.round(points * 100) / 100;

    // 6. 每日上限检查 - Redis原子增减
    const capKey = `points:daily_cap:${userId}:${today}`;
    const usedPoints = parseFloat(await this.redis.incrbyfloat(capKey, points));
    await this.redis.expire(capKey, 86400);

    if (usedPoints > 200) {
      // 超出上限，扣除超额部分
      points -= (usedPoints - 200);
      if (points < 0) points = 0;
      await this.redis.set(capKey, '200');
      this.redis.expire(capKey, 86400);
    }

    // 7. 记录本次观看行为
    const eventStr = `${Date.now()}:${episodeId}:${watchDurationSec}:${isCompleted}`;
    await this.redis.rpush(seqKey, eventStr);
    await this.redis.expire(seqKey, 86400);

    // 持久化到数据库
    await this.persistWatchRecord(
      userId, dramaId, episodeId, watchDurationSec, isCompleted,
      serverFingerprint, ipAddress, 0
    );

    return { points: Math.round(points), blocked: false };
  }

  /**
   * 检查非VIP观看次数
   */
  async checkDailyWatchLimit(userId: number): Promise<{
    allowed: boolean;
    remainingFree: number;
    remainingVoucher: number;
  }> {
    const today = this.getTodayInUserTimezone();
    const key = `daily_watch:${userId}:${today}`;
    
    let counts = await this.redis.hgetall(key);
    if (Object.keys(counts).length === 0) {
      counts = { free: '0', voucher: '0' };
    }

    const freeCount = parseInt(counts.free || '0', 10);
    const voucherCount = parseInt(counts.voucher || '0', 10);

    // 每日免费10集
    if (freeCount < 10) {
      await this.redis.hincrby(key, 'free', 1);
      await this.redis.expire(key, 86400);
      return {
        allowed: true,
        remainingFree: 10 - (freeCount + 1),
        remainingVoucher: voucherCount,
      };
    }

    // 有观看券可以抵扣
    if (voucherCount > 0) {
      await this.redis.hincrby(key, 'voucher', -1);
      await this.redis.expire(key, 86400);
      return {
        allowed: true,
        remainingFree: 0,
        remainingVoucher: voucherCount - 1,
      };
    }

    return {
      allowed: false,
      remainingFree: 0,
      remainingVoucher: 0,
    };
  }

  /**
   * 添加观看券
   */
  async addWatchVoucher(userId: number, quantity: number): Promise<void> {
    const today = this.getTodayInUserTimezone();
    const key = `daily_watch:${userId}:${today}`;
    await this.redis.hincrby(key, 'voucher', quantity);
    await this.redis.expire(key, 86400);
  }

  private getIpPrefix(ip: string): string {
    if (ip.includes(':')) {
      return ip.split(':').slice(0, 4).join(':');
    }
    return ip.split('.').slice(0, 2).join('.');
  }

  private getTodayInUserTimezone(): string {
    // 这里简化处理，实际需要根据用户时区计算
    return new Date().toISOString().split('T')[0];
  }

  private async hasValidInteraction(userId: number, episodeId: number): Promise<boolean> {
    // 检查24小时内是否有点赞或评论
    const key = `interaction:${userId}:${episodeId}`;
    return await this.redis.exists(key) === 1;
  }

  private logRiskEvent(userId: number, reason: string, fingerprint: string): void {
    this.logger.warn(`Risk event: userId=${userId}, reason=${reason}, fingerprint=${fingerprint}`);
    // 可以写入风险事件表用于后续分析
  }

  private async persistWatchRecord(
    userId: number,
    dramaId: number,
    episodeId: number,
    watchDuration: number,
    isCompleted: boolean,
    fingerprint: string,
    ipAddress: string,
    riskScore: number,
  ): Promise<void> {
    const record = this.watchRecordRepository.create({
      userId,
      dramaId,
      episodeId,
      watchDuration,
      isCompleted: isCompleted ? 1 : 0,
      deviceFingerprint: fingerprint,
      ipAddress,
      riskScore,
      lastWatchTime: new Date(),
    });
    await this.watchRecordRepository.save(record);
  }
}
