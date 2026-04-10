import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopItem } from './entities/shop-item.entity';
import { ExchangeRecord } from './entities/exchange-record.entity';
import { PointsService } from '../points/points.service';
import { UserTokensService } from '../tokens/user-tokens.service';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(ShopItem)
    private readonly shopItemRepository: Repository<ShopItem>,
    @InjectRepository(ExchangeRecord)
    private readonly exchangeRecordRepository: Repository<ExchangeRecord>,
    private readonly pointsService: PointsService,
    private readonly userTokensService: UserTokensService,
  ) {}

  async getAllItems() {
    return this.shopItemRepository.find({
      where: { status: 1 },
      order: { sortOrder: 'ASC' },
    });
  }

  async exchange(userId: number, itemId: number, quantity: number) {
    const item = await this.shopItemRepository.findOneBy({ id: itemId });
    if (!item) {
      return { success: false, message: 'Item not found' };
    }

    if (item.stock !== -1 && item.stock < quantity) {
      return { success: false, message: 'Out of stock' };
    }

    const totalPoints = item.points * quantity;
    const balance = await this.pointsService.getBalance(userId);

    if (balance < totalPoints) {
      return { success: false, message: 'Insufficient points' };
    }

    // 扣除积分
    const deductResult = await this.pointsService.deductPoints(userId, totalPoints, 4, `exchange_${itemId}_${quantity}`);
    if (!deductResult.success) {
      return { success: false, message: 'Failed to deduct points' };
    }

    // 根据类型发放奖励
    if (item.tokenAmount && item.tokenAmount > 0) {
      await this.userTokensService.addReward(userId, item.tokenAmount * quantity, 'exchange', undefined);
    }

    // 记录兑换
    const record = this.exchangeRecordRepository.create({
      userId,
      itemId,
      pointsUsed: totalPoints,
      quantity,
      tokenSent: item.tokenAmount ? item.tokenAmount * quantity : 0,
    });
    await this.exchangeRecordRepository.save(record);

    // 更新库存
    if (item.stock !== -1) {
      item.stock -= quantity;
      await this.shopItemRepository.save(item);
    }

    return { success: true };
  }
}
