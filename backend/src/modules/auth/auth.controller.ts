import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: {
    email: string;
    password: string;
    phone?: string;
    inviteCode?: string;
  }) {
    return this.authService.register(body.email, body.password, body.phone, body.inviteCode);
  }

  @Post('login/email')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
