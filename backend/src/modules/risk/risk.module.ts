import { Module } from '@nestjs/common';
import { RiskService } from './risk.service';
import { DeviceFingerprintModule } from '../device-fingerprint/device-fingerprint.module';

@Module({
  imports: [DeviceFingerprintModule],
  providers: [RiskService],
  exports: [RiskService],
})
export class RiskModule {}
