import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ShopService } from './shop.service';

@Controller('api/shop')
@UseGuards(AuthGuard('jwt'))
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('items')
  async getItems() {
    const items = await this.shopService.getAllItems();
    return { success: true, data: items };
  }

  @Post('exchange')
  async exchange(Request, @Body() body: { itemId: number; quantity: number }) {
    const result = await this.shopService.exchange(Request.user.id, body.itemId, body.quantity);
    return result;
  }
}
