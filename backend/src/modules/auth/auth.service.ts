import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { InviteService } from '../invite/invite.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly inviteService: InviteService,
  ) {}

  /**
   * 用户注册
   */
  async register(
    email: string,
    password: string,
    phone?: string,
    inviteCode?: string,
  ): Promise<{ success: boolean; userId?: number; message?: string }> {
    // 检查邮箱是否已存在
    const existing = await this.userRepository.findOneBy({ email });
    if (existing) {
      return { success: false, message: 'Email already registered' };
    }

    // 生成密码哈希
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

    // 生成唯一邀请码
    const newInviteCode = this.generateInviteCode();

    // 创建用户
    const user = this.userRepository.create({
      email,
      phone,
      passwordHash,
      inviteCode: newInviteCode,
      inviterId: 0,
    });

    await this.userRepository.save(user);

    // 处理邀请绑定
    if (inviteCode) {
      await this.inviteService.bindInvite(user.id, inviteCode);
    }

    return { success: true, userId: user.id };
  }

  /**
   * 用户登录
   */
  async login(email: string, password: string): Promise<{
    success: boolean;
    token?: string;
    user?: Partial<User>;
    message?: string;
  }> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return { success: false, message: 'Invalid password' };
    }

    if (user.status !== 1) {
      return { success: false, message: 'Account disabled' };
    }

    // 生成JWT token
    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        kycLevel: user.kycLevel,
        vipLevel: user.vipLevel,
        language: user.language,
        inviteCode: user.inviteCode,
      },
    };
  }

  /**
   * 验证JWT payload中的用户
   */
  async validateUser(userId: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id: userId });
  }

  /**
   * 生成随机邀请码
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
