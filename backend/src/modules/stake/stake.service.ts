import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { StakePool } from './entities/stake-pool.entity';
import { StakeRecord } from './entities/stake-record.entity';
import { StakeEarningsPeriod } from './entities/stake-earnings-period.entity';

@Injectable()
export class StakeService {
  constructor(
    @InjectRepository(StakePool)
    private readonly stakePoolRepository: Repository<StakePool>,
    @InjectRepository(StakeRecord)
    private readonly stakeRecordRepository: Repository<StakeRecord>,
    @InjectRepository(StakeEarningsPeriod)
    private readonly earningsPeriodRepository: Repository<StakeEarningsPeriod>,
  ) {}

  /**
   * 获取所有质押池列表
   */
  async getPools() {
    return this.stakePoolRepository.find({ where: { status: 1 }, order: { sortOrder: 'ASC' } });
  }

  /**
   * 获取用户的质押记录
   */
  async getUserStakes(userId: number) {
    return this.stakeRecordRepository.find({
      where: { userId, status: 1 },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取池子总览
   */
  async getOverview() {
    const pools = await this.stakePoolRepository.find({ where: { status: 1 } });
    let totalStaked = 0;
    for (const pool of pools) {
      const total = await this.stakeRecordRepository
        .createQueryBuilder('sr')
        .where('sr.poolId = :poolId AND sr.status = 1', { poolId: pool.id })
        .select('SUM(sr.amount)', 'total')
        .getRawOne();
      totalStaked += parseFloat(total.total || '0');
    }
    return {
      totalStaked,
      pools,
    };
  }

  /**
   * 计算实际年化（包含 VIP 加成）
   */
  calculateEffectiveApy(baseApy: number, vipLevel: number): number {
    // VIP 加成：每级 +0.5% 定期 / +1% 活期
    if (baseApy === 5) { // 活期
      return baseApy + (vipLevel * 1);
    }
    return baseApy + (vipLevel * 0.5);
  }

  /**
   * 执行质押 - 分段计息开始
   */
  async deposit(
    userId: number,
    poolId: number,
    amount: number,
    vipLevel: number,
    autoCompound: boolean = false,
  ): Promise<{ success: boolean; message?: string; expectedEarn?: number }> {
    const pool = await this.stakePoolRepository.findOneBy({ id: poolId });
    if (!pool) {
      return { success: false, message: 'Pool not found' };
    }

    // 检查最小最大金额
    if (amount < pool.minStake) {
      return { success: false, message: `Minimum stake is ${pool.minStake}` };
    }

    // 检查池子额度
    const totalStaked = await this.getTotalStaked(poolId);
    if (pool.maxStake && totalStaked + amount > pool.maxStake) {
      return { success: false, message: 'Pool capacity exceeded' };
    }

    // 如果已有未到期质押，先结算当前周期
    const existing = await this.stakeRecordRepository.findOne({
      where: { userId, poolId, status: 1 },
    });

    if (existing) {
      // 结算当前周期
      await this.closePeriod(existing.id, 'DEPOSIT');
      existing.amount += amount;
      existing.autoCompound = autoCompound ? 1 : 0;
      await this.stakeRecordRepository.save(existing);
    } else {
      // 创建新质押记录
      const lockEndTime = pool.lockDays > 0
        ? new Date(Date.now() + pool.lockDays * 24 * 60 * 60 * 1000)
        : null;

      const effectiveApy = this.calculateEffectiveApy(pool.baseApy, vipLevel);
      
      const stake = this.stakeRecordRepository.create({
        userId,
        poolId,
        amount,
        vipLevelAtStake: vipLevel,
        lockEndTime,
        autoCompound: autoCompound ? 1 : 0,
        totalEarned: 0,
        pendingEarned: 0,
        status: 1,
      });

      await this.stakeRecordRepository.save(stake);

      // 开启第一个计息周期
      await this.openPeriod(stake.id, pool.baseApy, effectiveApy, vipLevel, 'DEPOSIT');
    }

    // 计算预期收益
    const effectiveApy = this.calculateEffectiveApy(pool.baseApy, vipLevel);
    const expectedEarn = amount * effectiveApy / 100 * (pool.lockDays || 365) / 365;

    return { success: true, expectedEarn };
  }

  /**
   * 开启新的计息周期
   */
  private async openPeriod(
    stakeId: number,
    baseApy: number,
    effectiveApy: number,
    vipLevel: number,
    trigger: string,
  ): Promise<void> {
    const period = this.earningsPeriodRepository.create({
      stakeId,
      startTime: new Date(),
      appliedVipLevel: vipLevel,
      appliedApy: effectiveApy,
      eventTrigger: trigger,
      earnedAmount: 0,
      isSettled: 0,
    });
    await this.earningsPeriodRepository.save(period);
  }

  /**
   * 关闭当前计息周期并计算收益
   */
  private async closePeriod(stakeId: number, trigger: string): Promise<number> {
    const openPeriod = await this.earningsPeriodRepository.findOne({
      where: { stakeId, isSettled: 0 },
      order: { startTime: 'DESC' },
    });

    if (!openPeriod) return 0;

    openPeriod.endTime = new Date();
    openPeriod.isSettled = 1;
    openPeriod.eventTrigger = trigger;
    openPeriod.settledAt = new Date();

    // 计算这个周期的收益
    const msInYear = 365 * 24 * 60 * 60 * 1000;
    const durationMs = openPeriod.endTime.getTime() - openPeriod.startTime.getTime();
    const durationYears = durationMs / msInYear;
    
    // 获取质押金额
    const stake = await this.stakeRecordRepository.findOneBy({ id: stakeId });
    if (!stake) return 0;

    const earned = stake.amount * (openPeriod.appliedApy / 100) * durationYears;
    openPeriod.earnedAmount = earned;

    await this.earningsPeriodRepository.save(openPeriod);

    // 更新质押记录的待领取收益
    stake.pendingEarned += earned;
    await this.stakeRecordRepository.save(stake);

    return earned;
  }

  /**
   * VIP 等级变化 - 触发分段结算
   * 按照文档要求：1小时内多次变化仅首次触发
   */
  async onVipLevelChanged(userId: number, newVipLevel: number): Promise<void> {
    // 检查最近是否已经处理过（1小时冷却）
    const lastPeriod = await this.earningsPeriodRepository
      .createQueryBuilder('ep')
      .innerJoin('stake_record', 'sr', 'sr.id = ep.stakeId')
      .where('sr.userId = :userId', { userId })
      .andWhere('ep.startTime > :oneHourAgo', {
        oneHourAgo: new Date(Date.now() - 60 * 60 * 1000),
      })
      .getOne();

    if (lastPeriod) {
      // 已经在1小时内处理过，跳过
      return;
    }

    // 获取所有活跃质押
    const activeStakes = await this.stakeRecordRepository.find({
      where: { userId, status: 1 },
    });

    for (const stake of activeStakes) {
      if (stake.vipLevelAtStake !== newVipLevel) {
        // 关闭当前周期
        await this.closePeriod(stake.id, 'VIP_CHANGE');
        // 获取池子信息计算新安化
        const pool = await this.stakePoolRepository.findOneBy({ id: stake.poolId });
        if (pool) {
          const effectiveApy = this.calculateEffectiveApy(pool.baseApy, newVipLevel);
          await this.openPeriod(stake.id, pool.baseApy, effectiveApy, newVipLevel, 'VIP_CHANGE');
        }
        // 更新质押记录的VIP等级
        stake.vipLevelAtStake = newVipLevel;
        await this.stakeRecordRepository.save(stake);
      }
    }
  }

  /**
   * 领取收益
   */
  async claim(stakeId: number, userId: number): Promise<number> {
    const stake = await this.stakeRecordRepository.findOne({
      where: { id: stakeId, userId },
    });

    if (!stake || stake.pendingEarned <= 0) {
      return 0;
    }

    const claimed = stake.pendingEarned;
    stake.totalEarned += claimed;
    stake.pendingEarned = 0;
    await this.stakeRecordRepository.save(stake);

    return claimed;
  }

  /**
   * 赎回质押
   */
  async withdraw(stakeId: number, userId: number): Promise<{
    success: boolean;
    withdrawAmount: number;
    penalty: number;
    claimedEarnings: number;
  }> {
    const stake = await this.stakeRecordRepository.findOne({
      where: { id: stakeId, userId },
    });

    if (!stake || stake.status !== 1) {
      return { success: false, withdrawAmount: 0, penalty: 0, claimedEarnings: 0 };
    }

    const pool = await this.stakePoolRepository.findOneBy({ id: stake.poolId });
    if (!pool) {
      return { success: false, withdrawAmount: 0, penalty: 0, claimedEarnings: 0 };
    }

    // 结算最后一个周期
    await this.closePeriod(stake.id, 'WITHDRAW');
    const claimedEarnings = stake.pendingEarned;
    const totalEarnings = stake.totalEarned + stake.pendingEarned;

    // 计算提前赎回罚息
    let penalty = 0;
    const now = new Date();
    if (pool.lockDays > 0 && stake.lockEndTime && now < stake.lockEndTime) {
      // 罚息按照已获得收益的百分比扣除
      penalty = totalEarnings * (pool.penaltyRate / 100);
    }

    stake.status = 0;
    await this.stakeRecordRepository.save(stake);

    const withdrawAmount = stake.amount + (claimedEarnings - penalty);

    return {
      success: true,
      withdrawAmount,
      penalty,
      claimedEarnings,
    };
  }

  private async getTotalStaked(poolId: number): Promise<number> {
    const result = await this.stakeRecordRepository
      .createQueryBuilder('sr')
      .where('sr.poolId = :poolId AND sr.status = 1', { poolId })
      .select('SUM(sr.amount)', 'total')
      .getRawOne();
    return parseFloat(result.total || '0');
  }
}
