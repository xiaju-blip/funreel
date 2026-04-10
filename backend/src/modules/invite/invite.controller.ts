import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InviteService } from './invite.service';

@Controller('api/invite')
@UseGuards(AuthGuard('jwt'))
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Get('code')
  async getInviteCode(Request) {
    const user = Request.user;
    // 用户的邀请码在user表中
    return { success: true, code: user.inviteCode };
  }

  @Get('stats')
  async getStats(Request) {
    const stats = await this.inviteService.getMyStats(Request.user.id);
    return { success: true, ...stats };
  }

  @Get('records')
  async getRecords(Request, @Query('page') page: string = '1') {
    const result = await this.inviteService.getMyRecords(Request.user.id, parseInt(page));
    return { success: true, ...result };
  }
}
