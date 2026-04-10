import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChainSyncService } from './chain-sync.service';
import { BlockCheckpoint } from './entities/block-checkpoint.entity';
import { TokenTransaction } from '../tokens/entities/token-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlockCheckpoint, TokenTransaction])],
  providers: [ChainSyncService],
  exports: [ChainSyncService],
})
export class BlockchainModule implements OnModuleInit {
  constructor(private readonly chainSyncService: ChainSyncService) {}

  onModuleInit() {
    // 启动同步服务
    if (process.env.NODE_ENV === 'production') {
      this.chainSyncService.startSync();
    }
  }
}
