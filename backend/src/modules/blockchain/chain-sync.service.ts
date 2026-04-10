import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockCheckpoint } from './entities/block-checkpoint.entity';
import { TokenTransaction } from '../tokens/entities/token-transaction.entity';
import { ethers } from 'ethers';

@Injectable()
export class ChainSyncService {
  private readonly logger = new Logger(ChainSyncService.name);
  private provider: ethers.JsonRpcProvider;
  private requiredConfirmations = 12; // ETH需要12个区块确认

  constructor(
    @InjectRepository(BlockCheckpoint)
    private readonly blockCheckpointRepository: Repository<BlockCheckpoint>,
    @InjectRepository(TokenTransaction)
    private readonly tokenTransactionRepository: Repository<TokenTransaction>,
  ) {
    const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-key';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * 获取最新处理的检查点
   */
  async getCheckpoint(chainId: number): Promise<BlockCheckpoint | null> {
    return this.blockCheckpointRepository.findOneBy({ chainId });
  }

  /**
   * 更新检查点
   */
  async updateCheckpoint(chainId: number, blockNumber: number, blockHash: string): Promise<void> {
    let checkpoint = await this.getCheckpoint(chainId);
    if (!checkpoint) {
      checkpoint = this.blockCheckpointRepository.create({
        chainId,
        lastConfirmedHeight: blockNumber,
        blockHash,
      });
    } else {
      checkpoint.lastConfirmedHeight = blockNumber;
      checkpoint.blockHash = blockHash;
    }
    await this.blockCheckpointRepository.save(checkpoint);
  }

  /**
   * 检测区块重组
   */
  async isReorgDetected(currentBlockNumber: number, currentBlockHash: string): Promise<boolean> {
    const checkpoint = await this.getCheckpoint(1);
    if (!checkpoint) return false;

    // 如果当前块比检查点低，说明发生了重组
    if (currentBlockNumber < checkpoint.lastConfirmedHeight) {
      return true;
    }

    // 检查同一个高度的hash是否不同
    try {
      const block = await this.provider.getBlock(checkpoint.lastConfirmedHeight);
      if (block && block.hash !== checkpoint.blockHash) {
        return true;
      }
    } catch (e) {
      this.logger.error('Failed to check block hash for reorg detection', e);
    }

    return false;
  }

  /**
   * 回滚重组后的交易
   */
  async rollbackTransactionsAfter(blockNumber: number): Promise<void> {
    this.logger.log(`Rolling back transactions after block ${blockNumber}`);
    
    // 将所有大于blockNumber的交易标记为无效
    await this.tokenTransactionRepository
      .createQueryBuilder()
      .update(TokenTransaction)
      .set({ status: 0 }) // 0=无效
      .where('blockNumber > :blockNumber', { blockNumber })
      .execute();
  }

  /**
   * 处理新事件，按照文档中的可靠性设计
   */
  async processEvent(log: ethers.Log): Promise<boolean> {
    const blockNumber = log.blockNumber;
    const currentBlock = await this.provider.getBlockNumber();
    
    // 只处理已经足够确认的区块
    if (blockNumber > currentBlock - this.requiredConfirmations) {
      this.logger.debug(`Block ${blockNumber} not yet confirmed, skipping`);
      return false;
    }

    // 检查是否发生重组
    if (await this.isReorgDetected(blockNumber, log.blockHash)) {
      await this.rollbackTransactionsAfter(blockNumber - 12);
      this.logger.warn(`Block reorganization detected, rolled back after ${blockNumber - 12}`);
    }

    // 处理事件
    await this.saveTransaction(log);
    
    // 更新检查点
    await this.updateCheckpoint(1, blockNumber, log.blockHash);
    
    return true;
  }

  /**
   * 保存交易到数据库
   */
  private async saveTransaction(log: ethers.Log): Promise<void> {
    // 解析Transfer事件
    // 这里简化处理，实际需要根据ABI解析
    const tx = this.tokenTransactionRepository.create({
      blockNumber: log.blockNumber,
      txHash: log.transactionHash,
      from: log.topics[1],
      to: log.topics[2],
      value: log.data,
      status: 1, // 1=有效
    });
    await this.tokenTransactionRepository.save(tx);
    this.logger.log(`Processed transfer transaction ${log.transactionHash}`);
  }

  /**
   * 每日对账 - 比对链上事件和本地记录
   */
  async dailyReconciliation(): Promise<string[]> {
    const inconsistencies: string[] = [];
    // 获取所有今天处理的交易
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const localTransactions = await this.tokenTransactionRepository
      .createQueryBuilder()
      .where('createdAt >= :start', { start: startOfDay })
      .andWhere('status = 1')
      .getMany();

    // 比对每个交易在链上是否存在
    for (const tx of localTransactions) {
      try {
        const receipt = await this.provider.getTransactionReceipt(tx.txHash);
        if (!receipt || receipt.status !== 1) {
          inconsistencies.push(tx.txHash);
          tx.status = 0;
          await this.tokenTransactionRepository.save(tx);
        }
      } catch (e) {
        this.logger.error(`Failed to verify transaction ${tx.txHash}`, e);
      }
    }

    return inconsistencies;
  }

  /**
   * 启动监听循环
   */
  async startSync(): Promise<void> {
    this.logger.log('Starting chain sync service...');
    
    // 在生产环境中，应该使用定时任务或websocket订阅
    // 这里简化为轮询
    setInterval(async () => {
      try {
        await this.syncNewBlocks();
      } catch (e) {
        this.logger.error('Error syncing new blocks', e);
      }
    }, 15000); // 每15秒检查一次
  }

  private async syncNewBlocks(): Promise<void> {
    const checkpoint = await this.getCheckpoint(1);
    const currentBlock = await this.provider.getBlockNumber();
    const fromBlock = checkpoint ? checkpoint.lastConfirmedHeight + 1 : 0;
    const toBlock = currentBlock - this.requiredConfirmations;

    if (fromBlock > toBlock) {
      return; // 没有新的确认块
    }

    this.logger.log(`Syncing blocks from ${fromBlock} to ${toBlock}`);

    // 获取Transfer事件日志
    // 这里需要配置contract address和event topic
    const filter = {
      address: process.env.REEL_TOKEN_ADDRESS as string,
      topics: [ethers.id('Transfer(address,address,uint256)')],
      fromBlock,
      toBlock,
    };

    const logs = await this.provider.getLogs(filter);
    
    for (const log of logs) {
      await this.processEvent(log);
    }

    if (logs.length > 0) {
      this.logger.log(`Synced ${logs.length} new transfer events`);
    }
  }
}
