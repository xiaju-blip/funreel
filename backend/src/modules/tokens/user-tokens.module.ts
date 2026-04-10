import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTokensService } from './user-tokens.service';
import { UserToken } from './entities/user-token.entity';
import { TokenTransaction } from './entities/token-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserToken, TokenTransaction])],
  providers: [UserTokensService],
  exports: [UserTokensService],
})
export class UserTokensModule {}
