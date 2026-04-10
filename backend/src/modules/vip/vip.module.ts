import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VipService } from './vip.service';
import { VipController } from './vip.controller';
import { VipUser } from './entities/vip-user.entity';
import { VipOrder } from './entities/vip-order.entity';
import { UserTokensModule } from '../tokens/user-tokens.module';
import { StakeModule } from '../stake/stake.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VipUser, VipOrder]),
    UserTokensModule,
    StakeModule,
  ],
  providers: [VipService],
  controllers: [VipController],
  exports: [VipService],
})
export class VipModule {}
