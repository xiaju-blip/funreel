import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StakeService } from './stake.service';
import { StakeController } from './stake.controller';
import { StakePool } from './entities/stake-pool.entity';
import { StakeRecord } from './entities/stake-record.entity';
import { StakeEarningsPeriod } from './entities/stake-earnings-period.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StakePool, StakeRecord, StakeEarningsPeriod]),
  ],
  providers: [StakeService],
  controllers: [StakeController],
  exports: [StakeService],
})
export class StakeModule {}
