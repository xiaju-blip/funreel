import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchService } from './watch.service';
import { WatchController } from './watch.controller';
import { WatchRecord } from './entities/watch-record.entity';
import { RiskModule } from '../risk/risk.module';
import { DeviceFingerprintModule } from '../device-fingerprint/device-fingerprint.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WatchRecord]),
    RiskModule,
    DeviceFingerprintModule,
  ],
  providers: [WatchService],
  controllers: [WatchController],
  exports: [WatchService],
})
export class WatchModule {}
