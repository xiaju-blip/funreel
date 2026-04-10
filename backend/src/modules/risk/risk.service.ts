import { Injectable } from '@nestjs/common';
import { DeviceFingerprintService } from '../device-fingerprint/device-fingerprint.service';

@Injectable()
export class RiskService {
  constructor(
    private readonly deviceFingerprintService: DeviceFingerprintService,
  ) {}

  /**
   * 计算用户提现风险评分
   * 按照文档中的评分规则实现
   */
  async calculateWithdrawRiskScore(
    userId: number,
    amount: number,
    averageAmount: number,
    is异地登录: boolean,
    deviceFingerprint: string,
    isSimulatorOrRoot: boolean,
    recentWithdrawCount: number,
  ): Promise<number> {
    let score = 0;

    // 设备环境风险：模拟器/ROOT 加 30 分
    if (isSimulatorOrRoot) {
      score += 30;
    }

    // 地域突变：异地登录加 20 分
    if (is异地登录) {
      score += 20;
    }

    // 近期大额提现频率：近7天超过3次加25分
    if (recentWithdrawCount > 3) {
      score += 25;
    }

    // 金额风险：超过历史平均3倍加25分
    if (amount > averageAmount * 3 && averageAmount > 0) {
      score += 25;
    }

    // 设备指纹风险：同一设备多个账号
    const accountCount = await this.deviceFingerprintService.checkMultipleAccounts(deviceFingerprint);
    if (accountCount > 3) {
      score += 15;
    }

    return score;
  }

  /**
   * 根据风险评分获取处理策略
   */
  getRiskAction(score: number): 'auto_approve' | 'require_face_verify' | 'manual_review' {
    if (score < 30) {
      return 'auto_approve';
    } else if (score <= 70) {
      return 'require_face_verify';
    } else {
      return 'manual_review';
    }
  }

  /**
   * 检测观看行为是否是脚本模式
   * 按照文档中的行为时序分析算法
   */
  detectScriptPattern(
    recentEvents: string[],
    currentDuration: number,
  ): boolean {
    if (recentEvents.length < 3) {
      return false;
    }

    const durations: number[] = [];
    const timestamps: number[] = [];

    for (const event of recentEvents) {
      const parts = event.split(':');
      timestamps.push(parseFloat(parts[0]));
      durations.push(parseFloat(parts[2]));
    }

    // 检测1：时长方差极小，说明是脚本固定时长操作
    const variance = this.calculateVariance(durations);
    if (variance < 0.5) {
      return true;
    }

    // 检测2：间隔过短，说明自动化操作没有人的反应时间
    const intervals: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }

    const avgInterval = this.calculateMean(intervals);
    if (avgInterval < 10) {
      return true;
    }

    // 检测3：当前时长与历史完全重复，脚本模式
    if (durations.includes(currentDuration)) {
      return true;
    }

    return false;
  }

  /**
   * 检测是否是人形观看时长
   * 精确到整分钟且多次出现精确值，可能是脚本
   */
  isHumanLikeWatch(minutes: number, userExactCount: number): boolean {
    const fractional = minutes - Math.floor(minutes);
    if (fractional < 0.01 && userExactCount > 2) {
      return false;
    }
    return true;
  }

  private calculateMean(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateVariance(values: number[]): number {
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return this.calculateMean(squaredDiffs);
  }
}
