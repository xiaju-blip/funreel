import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('api/users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(Request) {
    const user = await this.usersService.findById(Request.user.id);
    return {
      success: true,
      data: {
        id: user?.id,
        email: user?.email,
        nickname: user?.nickname,
        avatar: user?.avatar,
        kycLevel: user?.kycLevel,
        vipLevel: user?.vipLevel,
        language: user?.language,
        inviteCode: user?.inviteCode,
      },
    };
  }
}
