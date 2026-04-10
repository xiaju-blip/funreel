import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { AdPlacement } from './entities/ad-placement.entity';
import { AdRevenueLog } from './entities/ad-revenue-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdPlacement, AdRevenueLog])],
  providers: [AdsService],
  controllers: [AdsController],
  exports: [AdsService],
})
export class AdsModule {}
