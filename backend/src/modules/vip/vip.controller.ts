import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VipService } from './vip.service';

@Controller('api/vip')
@UseGuards(AuthGuard('jwt'))
export class VipController {
  constructor(private readonly vipService: VipService) {}

  @Get('my')
  async getMyVip(Request) {
    const vip = await this.vipService.getUserVip(Request.user.id);
    return { success: true, data: vip };
  }
}
