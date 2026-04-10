import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InviteRecord } from './entities/invite-record.entity';
import { User } from '../users/entities/user.entity';
import { PointsService } from '../points/points.service';
import { UserTokensService } from '../tokens/user-tokens.service';

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(InviteRecord)
    private readonly inviteRecordRepository: Repository<InviteRecord>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly pointsService: PointsService,
    private readonly userTokensService: UserTokensService,
  ) {}

  /**
   * 绑定邀请关系
   */
  async bindInvite(newUserId: number, inviteCode: string): Promise<boolean> {
    const inviter = await this.userRepository.findOneBy({ inviteCode });
    if (!inviter) return false;

    // 更新新用户的邀请人ID
    await this.userRepository.update(newUserId, { inviterId: inviter.id });

    // 记录直接邀请奖励，注册完成立即发放
    await this.recordInviteReward(inviter.id, newUserId, 1, 'register', 50, 10);

    // 如果有上级邀请人（二级）
    if (inviter.inviterId && inviter.inviterId > 0) {
      await this.recordInviteReward(inviter.inviterId, newUserId, 2, 'register', 50, 0);
    }

    return true;
  }

  /**
   * KYC完成后发放奖励
   */
  async processKycReward(inviteeId: number): Promise<void> {
    const invitee = await this.userRepository.findOneBy({ id: inviteeId });
    if (!invitee || invitee.inviterId === 0) return;

    // 直接邀请人奖励
    await this.recordInviteReward(invitee.inviterId, inviteeId, 1, 'kyc', 100, 50);

    // 二级奖励发放在注册已经处理
  }

  /**
   * 首次投资完成后发放奖励
   */
  async processFirstInvestReward(inviteeId: number, amount: number): Promise<void> {
    const invitee = await this.userRepository.findOneBy({ id: inviteeId });
    if (!invitee || invitee.inviterId === 0) return;

    if (amount >= 100) {
      await this.recordInviteReward(invitee.inviterId, inviteeId, 1, 'first_invest', 0, 50);
    }
  }

  /**
   * 记录邀请奖励
   */
  private async recordInviteReward(
    inviterId: number, inviteeId: number, level: number, eventType: string, points: number, token: number,
  ) {
    const record = this.inviteRecordRepository.create({
      inviterId,
      inviteeId,
      level,
      eventType,
      rewardPoints: points,
      rewardToken: token,
      status: 1, // 立即发放注册奖励
    });
    await this.inviteRecordRepository.save(record);

    // 发放奖励
    if (points > 0) {
      await this.pointsService.addPoints(inviterId, points, 6, `invite_${eventType}_${inviteeId}`);
    }
    if (token > 0) {
      await this.userTokensService.addReward(inviterId, token, 'invite', undefined);
    }
  }

  /**
   * 获取我的邀请统计
   */
  async getMyStats(userId: number) {
    const directCount = await this.inviteRecordRepository
      .createQueryBuilder()
      .where('inviterId = :userId AND level = 1', { userId })
      .getCount();

    const indirectCount = await this.inviteRecordRepository
      .createQueryBuilder()
      .where('inviterId = :userId AND level = 2', { userId })
      .getCount();

    const totalPoints = await this.inviteRecordRepository
      .createQueryBuilder()
      .where('inviterId = :userId', { userId })
      .select('SUM(rewardPoints)', 'total')
      .getRawOne();

    const totalToken = await this.inviteRecordRepository
      .createQueryBuilder()
      .where('inviterId = :userId', { userId })
      .select('SUM(rewardToken)', 'total')
      .getRawOne();

    return {
      directCount,
      indirectCount,
      totalPoints: parseInt(totalPoints.total || '0', 10),
      totalToken: parseFloat(totalToken.total || '0'),
    };
  }

  /**
   * 获取我的邀请明细
   */
  async getMyRecords(userId: number, page: number = 1, limit: number = 20) {
    const query = this.inviteRecordRepository
      .createQueryBuilder()
      .where('inviterId = :userId', { userId })
      .orderBy('createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [records, total] = await query.getManyAndCount();
    return { records, total };
  }
}
