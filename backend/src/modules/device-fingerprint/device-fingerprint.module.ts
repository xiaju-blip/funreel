import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceFingerprintService } from './device-fingerprint.service';
import { DeviceFingerprint } from './entities/device-fingerprint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceFingerprint])],
  providers: [DeviceFingerprintService],
  exports: [DeviceFingerprintService],
})
export class DeviceFingerprintModule {}
