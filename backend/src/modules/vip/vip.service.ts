import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VipUser } from './entities/vip-user.entity';
import { VipOrder } from './entities/vip-order.entity';
import { UserTokensService } from '../tokens/user-tokens.service';
import { TokenBurns } from '../tokens/entities/token-burn.entity';

@Injectable()
export class VipService {
  constructor(
    @InjectRepository(VipUser)
    private readonly vipUserRepository: Repository<VipUser>,
    @InjectRepository(VipOrder)
    private readonly vipOrderRepository: Repository<VipOrder>,
    @InjectRepository(TokenBurns)
    private readonly tokenBurnsRepository: Repository<TokenBurns>,
    private readonly userTokensService: UserTokensService,
  ) {}

  async getUserVip(userId: number): Promise<VipUser | null> {
    return this.vipUserRepository.findOneBy({ userId });
  }

  async createOrder(
    userId: number,
    vipLevel: number,
    durationType: number,
    durationDays: number,
    priceFiat: number,
    priceToken: number,
    paymentMethod: number,
  ): Promise<VipOrder> {
    const order = this.vipOrderRepository.create({
      userId,
      vipLevel,
      durationType,
      durationDays,
      priceFiat,
      priceToken,
      paymentMethod,
      status: 0,
    });
    await this.vipOrderRepository.save(order);
    return order;
  }

  /**
   * 按照文档要求：VIP 购买使用 REEL 支付，50% 销毁，50% 进入质押奖池
   */
  async processTokenPayment(userId: number, amount: number): Promise<void> {
    const burnAmount = amount * 0.5;
    const poolAmount = amount * 0.5;

    // 销毁
    const burn = this.tokenBurnsRepository.create({
      amount: burnAmount,
      source: 'vip_purchase',
    });
    await this.tokenBurnsRepository.save(burn);

    // 注入质押池
    // 实际实现需要增加 reward pool balance
  }
}
