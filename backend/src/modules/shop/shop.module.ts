import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { ShopItem } from './entities/shop-item.entity';
import { ExchangeRecord } from './entities/exchange-record.entity';
import { PointsModule } from '../points/points.module';
import { UserTokensModule } from '../tokens/user-tokens.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShopItem, ExchangeRecord]),
    PointsModule,
    UserTokensModule,
  ],
  providers: [ShopService],
  controllers: [ShopController],
  exports: [ShopService],
})
export class ShopModule {}
