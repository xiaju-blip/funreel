import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { UserPoints } from '../users/entities/user-points.entity';
import { PointsTransaction } from './entities/points-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPoints, PointsTransaction])],
  providers: [PointsService],
  controllers: [PointsController],
  exports: [PointsService],
})
export class PointsModule {}
