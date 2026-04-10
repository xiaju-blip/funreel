import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { InviteRecord } from './entities/invite-record.entity';
import { User } from '../users/entities/user.entity';
import { PointsModule } from '../points/points.module';
import { UserTokensModule } from '../tokens/user-tokens.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InviteRecord, User]),
    PointsModule,
    UserTokensModule,
  ],
  providers: [InviteService],
  controllers: [InviteController],
  exports: [InviteService],
})
export class InviteModule {}
