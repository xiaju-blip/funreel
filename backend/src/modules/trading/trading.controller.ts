import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TradingService } from './trading.service';

@Controller('api/orders')
@UseGuards(AuthGuard('jwt'))
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Get('my')
  async getMyOrders(Request) {
    const orders = await this.tradingService.getUserOrders(Request.user.id);
    return { success: true, data: orders };
  }
}
