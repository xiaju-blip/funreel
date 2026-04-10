import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradingService } from './trading.service';
import { TradingController } from './trading.controller';
import { Order } from '../assets/entities/order.entity';
import { AmmModule } from '../amm/amm.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), AmmModule],
  providers: [TradingService],
  controllers: [TradingController],
  exports: [TradingService],
})
export class TradingModule {}
