import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import IORedis from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPoints } from '../users/entities/user-points.entity';
import { PointsTransaction } from './entities/points-transaction.entity';

@Injectable()
export class PointsService {
  constructor(
    @InjectRedis() private readonly redis: IORedis,
    @InjectRepository(UserPoints)
    private readonly userPointsRepository: Repository<UserPoints>,
    @InjectRepository(PointsTransaction)
    private readonly pointsTransactionRepository: Repository<PointsTransaction>,
  ) {}

  /**
   * 获取用户积分余额
   */
  async getBalance(userId: number): Promise<number> {
    const record = await this.userPointsRepository.findOneBy({ userId });
    return record?.balance || 0;
  }

  /**
   * 增加用户积分
   */
  async addPoints(
    userId: number,
    amount: number,
    type: number,
    sourceId?: string,
  ): Promise<number> {
    let userPoints = await this.userPointsRepository.findOneBy({ userId });
    
    if (!userPoints) {
      userPoints = this.userPointsRepository.create({
        userId,
        balance: amount,
        totalEarned: amount,
        totalSpent: 0,
      });
    } else {
      userPoints.balance += amount;
      userPoints.totalEarned += amount;
    }

    const newBalance = userPoints.balance;
    await this.userPointsRepository.save(userPoints);

    // 记录交易
    const transaction = this.pointsTransactionRepository.create({
      userId,
      type,
      amount,
      balanceAfter: newBalance,
      sourceId,
    });
    await this.pointsTransactionRepository.save(transaction);

    return newBalance;
  }

  /**
   * 扣除用户积分
   */
  async deductPoints(
    userId: number,
    amount: number,
    type: number,
    sourceId?: string,
  ): Promise<{ success: boolean; newBalance: number }> {
    let userPoints = await this.userPointsRepository.findOneBy({ userId });
    
    if (!userPoints || userPoints.balance < amount) {
      return { success: false, newBalance: userPoints?.balance || 0 };
    }

    userPoints.balance -= amount;
    userPoints.totalSpent += amount;
    const newBalance = userPoints.balance;

    await this.userPointsRepository.save(userPoints);

    // 记录交易（负数表示扣除）
    const transaction = this.pointsTransactionRepository.create({
      userId,
      type,
      amount: -amount,
      balanceAfter: newBalance,
      sourceId,
    });
    await this.pointsTransactionRepository.save(transaction);

    return { success: true, newBalance };
  }

  /**
   * 获取今日已获得的积分（用于上限检查）
   */
  async getTodayPoints(userId: number): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `points:daily_cap:${userId}:${today}`;
    const value = await this.redis.get(key);
    return parseFloat(value || '0');
  }

  /**
   * 获取用户交易记录
   */
  async getTransactionHistory(userId: number, page: number = 1, limit: number = 20) {
    const query = this.pointsTransactionRepository
      .createQueryBuilder('pt')
      .where('pt.userId = :userId', { userId })
      .orderBy('pt.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await query.getManyAndCount();
    return { items, total };
  }
}
