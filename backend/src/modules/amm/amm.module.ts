import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmmService } from './amm.service';
import { AmmController } from './amm.controller';
import { AmmPool } from './entities/amm-pool.entity';
import { AmmSwap } from './entities/amm-swap.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AmmPool, AmmSwap])],
  providers: [AmmService],
  controllers: [AmmController],
  exports: [AmmService],
})
export class AmmModule {}
