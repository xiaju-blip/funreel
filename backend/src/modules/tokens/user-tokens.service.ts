import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserToken } from './entities/user-token.entity';
import { TokenTransaction } from './entities/token-transaction.entity';

@Injectable()
export class UserTokensService {
  constructor(
    @InjectRepository(UserToken)
    private readonly userTokenRepository: Repository<UserToken>,
    @InjectRepository(TokenTransaction)
    private readonly tokenTransactionRepository: Repository<TokenTransaction>,
  ) {}

  /**
   * 获取用户余额
   */
  async getBalance(userId: number): Promise<number> {
    const record = await this.userTokenRepository.findOneBy({ userId });
    return record?.balance || 0;
  }

  /**
   * 添加奖励
   */
  async addReward(
    userId: number,
    amount: number,
    type: string,
    txHash?: string,
  ): Promise<number> {
    let userToken = await this.userTokenRepository.findOneBy({ userId });
    
    if (!userToken) {
      userToken = this.userTokenRepository.create({
        userId,
        balance: amount,
        totalEarned: amount,
        totalSpent: 0,
      });
    } else {
      userToken.balance += amount;
      userToken.totalEarned += amount;
    }

    const newBalance = userToken.balance;
    await this.userTokenRepository.save(userToken);

    // 记录交易
    const transaction = this.tokenTransactionRepository.create({
      userId,
      type: this.getTypeCode(type),
      amount,
      balanceAfter: newBalance,
      txHash,
      status: 1,
    });
    await this.tokenTransactionRepository.save(transaction);

    return newBalance;
  }

  /**
   * 扣减余额
   */
  async deduct(
    userId: number,
    amount: number,
    type: string,
    txHash?: string,
  ): Promise<{ success: boolean; newBalance: number }> {
    let userToken = await this.userTokenRepository.findOneBy({ userId });
    
    if (!userToken || userToken.balance < amount) {
      return { success: false, newBalance: userToken?.balance || 0 };
    }

    userToken.balance -= amount;
    userToken.totalSpent += amount;
    const newBalance = userToken.balance;

    await this.userTokenRepository.save(userToken);

    // 记录交易
    const transaction = this.tokenTransactionRepository.create({
      userId,
      type: this.getTypeCode(type),
      amount: -amount,
      balanceAfter: newBalance,
      txHash,
      status: 1,
    });
    await this.tokenTransactionRepository.save(transaction);

    return { success: true, newBalance };
  }

  private getTypeCode(type: string): number {
    const map: Record<string, number> = {
      'poe': 1,
      'invite': 2,
      'staking': 3,
      'withdraw': 4,
      'exchange': 1,
      'vip_buy': 2,
    };
    return map[type] || 0;
  }

  /**
   * 获取交易历史
   */
  async getTransactionHistory(userId: number, page: number = 1, limit: number = 20) {
    const query = this.tokenTransactionRepository
      .createQueryBuilder('tt')
      .where('tt.userId = :userId', { userId })
      .orderBy('tt.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await query.getManyAndCount();
    return { items, total };
  }
}
