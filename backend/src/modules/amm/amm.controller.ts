import { Controller, Get, Post, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AmmService } from './amm.service';

@Controller('api/amm')
@UseGuards(AuthGuard('jwt'))
export class AmmController {
  constructor(private readonly ammService: AmmService) {}

  @Get('pool/:id')
  async getPool(@Param('id') id: string) {
    const pool = await this.ammService.getPool(parseInt(id));
    return { success: true, data: pool };
  }

  @Get('pool-by-asset/:assetId')
  async getPoolByAsset(@Param('assetId') assetId: string, @Query('baseToken') baseToken: string = 'USDT') {
    const pool = await this.ammService.getPoolByAsset(parseInt(assetId), baseToken);
    return { success: true, data: pool };
  }

  @Post('swap')
  async swap(
    @Request() req,
    @Body() body: {
      poolId: number;
      direction: 'buy_ipt' | 'sell_ipt';
      amountIn: number;
      minOut: number;
    },
  ) {
    const { poolId, direction, amountIn, minOut } = body;
    const pool = await this.ammService.getPool(poolId);
    if (!pool) {
      return { success: false, error: 'Pool not found' };
    }

    const txId = `${Date.now()}-${req.user.id}-${Math.random().toString(36).substr(2, 9)}`;
    const result = await this.ammService.swap(
      poolId,
      direction,
      amountIn,
      minOut,
      pool.feeRate,
      txId,
      req.user.id,
    );

    return result;
  }
}
