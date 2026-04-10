import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceFingerprint } from './entities/device-fingerprint.entity';
import * as crypto from 'crypto';

@Injectable()
export class DeviceFingerprintService {
  constructor(
    @InjectRepository(DeviceFingerprint)
    private readonly deviceFingerprintRepository: Repository<DeviceFingerprint>,
  ) {}

  /**
   * 服务端二次签名生成最终设备指纹
   * 按照文档中的算法实现
   */
  generateServerFingerprint(
    clientHash: string,
    ipAddress: string,
    userAgent: string,
  ): string {
    // 只保留IP前缀，避免完整IP存储隐私问题
    const ipPrefix = this.getIpPrefix(ipAddress);
    const salt = "FunReelRWA_Secure_Salt_2026";
    const raw = `${clientHash}|${ipPrefix}|${userAgent}|${salt}`;
    
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * 获取IP前缀（只保留前两段，IPv4）
   */
  private getIpPrefix(ip: string): string {
    if (ip.includes(':')) {
      // IPv6 - 返回前4段
      return ip.split(':').slice(0, 4).join(':');
    }
    // IPv4 - 返回前两段
    return ip.split('.').slice(0, 2).join('.');
  }

  /**
   * 记录或更新设备指纹
   */
  async recordFingerprint(
    userId: number,
    fingerprint: string,
  ): Promise<DeviceFingerprint> {
    let record = await this.deviceFingerprintRepository.findOneBy({
      userId,
      fingerprintHash: fingerprint,
    });

    if (record) {
      record.lastSeen = new Date();
      return this.deviceFingerprintRepository.save(record);
    }

    record = this.deviceFingerprintRepository.create({
      userId,
      fingerprintHash: fingerprint,
      riskLevel: 0,
    });

    return this.deviceFingerprintRepository.save(record);
  }

  /**
   * 检查设备是否已在黑名单
   */
  async isBlacklisted(fingerprint: string): Promise<boolean> {
    const record = await this.deviceFingerprintRepository.findOneBy({
      fingerprintHash: fingerprint,
    });
    return record?.riskLevel >= 3 || false;
  }

  /**
   * 增加风险评分
   */
  async increaseRisk(userId: number, fingerprint: string, points: number): Promise<void> {
    const record = await this.deviceFingerprintRepository.findOneBy({
      fingerprintHash: fingerprint,
    });
    
    if (record) {
      record.riskLevel += points;
      await this.deviceFingerprintRepository.save(record);
    }
  }

  /**
   * 检查同一设备指纹注册多个账号
   */
  async checkMultipleAccounts(fingerprint: string): Promise<number> {
    // 返回该设备关联的不同用户数
    const count = await this.deviceFingerprintRepository
      .createQueryBuilder('df')
      .where('df.fingerprintHash = :fingerprint', { fingerprint })
      .select('COUNT(DISTINCT df.userId)', 'count')
      .getRawOne();
    
    return parseInt(count.count, 10);
  }
}
