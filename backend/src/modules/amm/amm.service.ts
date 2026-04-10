import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import type IORedis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { AmmPool } from './entities/amm-pool.entity';
import { AmmSwap } from './entities/amm-swap.entity';

@Injectable()
export class AmmService {
  private readonly logger = new Logger(AmmService.name);
  private ammSwapScript: string;

  constructor(
    @InjectRedis() private readonly redis: any,
    @InjectRepository(AmmPool)
    private readonly ammPoolRepository: Repository<AmmPool>,
    @InjectRepository(AmmSwap)
    private readonly ammSwapRepository: Repository<AmmSwap>,
  ) {
    // 加载Lua脚本
    const scriptPath = path.join(__dirname, '../../lua/amm_swap.lua');
    this.ammSwapScript = fs.readFileSync(scriptPath, 'utf8');
  }

  /**
   * 获取AMM池信息
   */
  async getPool(poolId: number): Promise<AmmPool | null> {
    return this.ammPoolRepository.findOneBy({ id: poolId });
  }

  /**
   * 获取资产的AMM池
   */
  async getPoolByAsset(assetId: number, baseToken: string = 'USDT'): Promise<AmmPool | null> {
    return this.ammPoolRepository.findOneBy({ assetId, baseToken });
  }

  /**
   * 执行AMM兑换
   */
  async swap(
    poolId: number,
    direction: 'buy_ipt' | 'sell_ipt',
    amountIn: number,
    minOut: number,
    feeRate: number,
    txId: string,
    userId: number,
  ): Promise<any> {
    const poolKey = `amm:pool:${poolId}:reserves`;
    
    // 执行Lua脚本
    const result = await this.redis.eval(
      this.ammSwapScript,
      1,
      poolKey,
      direction,
      amountIn.toString(),
      minOut.toString(),
      feeRate.toString(),
      txId,
      userId.toString(),
    );

    if (typeof result === 'string') {
      try {
        const parsed = JSON.parse(result);
        if (parsed.status === 'ERROR') {
          return { success: false, error: parsed.error };
        }
        return {
          success: true,
          amountOut: parseFloat(parsed.amount_out),
          fee: parseFloat(parsed.fee),
          price: parseFloat(parsed.price),
          newReserveIpt: parseFloat(parsed.new_ipt),
          newReserveBase: parseFloat(parsed.new_base),
        };
      } catch (e) {
        this.logger.error('Failed to parse Lua result', e);
        return { success: false, error: 'PARSE_ERROR' };
      }
    }

    return { success: false, error: 'UNKNOWN_ERROR' };
  }

  /**
   * 同步数据库到Redis
   */
  async syncPoolToRedis(poolId: number): Promise<void> {
    const pool = await this.getPool(poolId);
    if (!pool) return;

    const poolKey = `amm:pool:${poolId}:reserves`;
    await this.redis.hset(poolKey, {
      ipt: pool.reserveIpt.toString(),
      base: pool.reserveBase.toString(),
      k: (pool.reserveIpt * pool.reserveBase).toString(),
    });
  }

  /**
   * 创建新池
   */
  async createPool(
    assetId: number,
    baseToken: string,
    reserveIpt: number,
    reserveBase: number,
    feeRate: number = 0.003,
  ): Promise<AmmPool> {
    const pool = this.ammPoolRepository.create({
      assetId,
      baseToken,
      reserveIpt,
      reserveBase,
      feeRate,
    });
    await this.ammPoolRepository.save(pool);
    await this.syncPoolToRedis(pool.id);
    return pool;
  }

  /**
   * 消费Redis Stream中的交易记录并持久化到数据库
   * 由后台Worker定时调用
   */
  async persistSwapRecords(count: number = 100): Promise<number> {
    const streamKey = 'amm:swap:queue';
    const result = await this.redis.xreadgroup(
      'GROUP',
      'persistence',
      'consumer-1',
      'COUNT',
      count,
      'BLOCK',
      0,
      'STREAMS',
      streamKey,
      '$',
    );

    if (!result || typeof result !== 'object' || (result as any).length === 0) {
      return 0;
    }

    let persisted = 0;

    for (const [stream, messages] of result as Array<[string, Array<[string, string[]]>]>) {
      for (const [id, fields] of messages) {
        const swap = this.parseSwapMessage(fields);
        await this.ammSwapRepository.save(swap);
        await this.redis.xack(streamKey, 'persistence', id);
        persisted++;
      }
    }

    return persisted;
  }

  private parseSwapMessage(fields: string[]): AmmSwap {
    const data: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      data[fields[i]] = fields[i + 1];
    }

    const direction = data.direction === 'buy_ipt' ? 1 : 2;

    const swap = new AmmSwap();
    swap.poolId = parseInt(data.pool_id);
    swap.userId = parseInt(data.user_id);
    swap.direction = direction;
    swap.amountIn = parseFloat(data.amount_in);
    swap.amountOut = parseFloat(data.amount_out);
    swap.price = parseFloat(data.price);
    swap.fee = parseFloat(data.fee);
    swap.slippage = 0;

    return swap;
  }

  /**
   * 计算输出数量（恒定乘积）
   */
  calculateOutput(
    reserveIn: number,
    reserveOut: number,
    amountIn: number,
    feeRate: number,
  ): number {
    const amountInWithFee = amountIn * (1 - feeRate);
    return (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);
  }
}
