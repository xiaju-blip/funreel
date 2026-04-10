import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PointsService } from './points.service';

@Controller('api/points')
@UseGuards(AuthGuard('jwt'))
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('balance')
  async getBalance(@Request() req) {
    const balance = await this.pointsService.getBalance(req.user.id);
    return { success: true, balance };
  }

  @Get('history')
  async getHistory(@Request() req, @Query('page') page: string = '1') {
    const result = await this.pointsService.getTransactionHistory(
      req.user.id,
      parseInt(page),
    );
    return { success: true, ...result };
  }
}
