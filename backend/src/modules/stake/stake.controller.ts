import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StakeService } from './stake.service';

@Controller('api/stake')
@UseGuards(AuthGuard('jwt'))
export class StakeController {
  constructor(private readonly stakeService: StakeService) {}

  @Get('pools')
  async getPools() {
    const pools = await this.stakeService.getPools();
    return { success: true, data: pools };
  }

  @Get('overview')
  async getOverview() {
    const overview = await this.stakeService.getOverview();
    return { success: true, data: overview };
  }

  @Get('my')
  async getMyStakes(@Request() req) {
    const stakes = await this.stakeService.getUserStakes(req.user.id);
    return { success: true, data: stakes };
  }

  @Post('deposit')
  async deposit(
    @Request() req,
    @Body() body: { poolId: number; amount: number; autoCompound?: boolean },
  ) {
    // 获取用户当前VIP等级
    const vipLevel = req.user.vipLevel || 0;
    const result = await this.stakeService.deposit(
      req.user.id,
      body.poolId,
      body.amount,
      vipLevel,
      body.autoCompound || false,
    );
    return result;
  }

  @Post('claim')
  async claim(@Request() req, @Body() body: { stakeId: number }) {
    const claimed = await this.stakeService.claim(body.stakeId, req.user.id);
    return { success: true, claimedAmount: claimed };
  }

  @Post('withdraw')
  async withdraw(@Request() req, @Body() body: { stakeId: number }) {
    const result = await this.stakeService.withdraw(body.stakeId, req.user.id);
    return result;
  }

  @Post('auto-compound')
  async setAutoCompound(@Request() req, @Body() body: { stakeId: number; enable: boolean }) {
    // 更新自动复投设置
    const stake = await this.stakeService['stakeRecordRepository'].findOne({
      where: { id: body.stakeId, userId: req.user.id },
    });
    if (stake) {
      stake.autoCompound = body.enable ? 1 : 0;
      await this.stakeService['stakeRecordRepository'].save(stake);
      return { success: true };
    }
    return { success: false, message: 'Stake not found' };
  }
}
