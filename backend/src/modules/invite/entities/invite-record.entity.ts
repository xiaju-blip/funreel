import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('invite_records')
export class InviteRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'inviter_id' })
  @Index('idx_inviter')
  inviterId: number;

  @Column({ name: 'invitee_id' })
  @Index('idx_invitee')
  inviteeId: number;

  @Column({ type: 'tinyint' })
  level: number; // 1:直接 2:间接

  @Column({ name: 'event_type', length: 50 })
  eventType: string; // register, kyc, first_invest, ad_watch

  @Column({ name: 'reward_points', default: 0 })
  rewardPoints: number;

  @Column({ name: 'reward_token', type: 'decimal', precision: 20, scale: 8, default: 0 })
  rewardToken: number;

  @Column({ type: 'tinyint', default: 0, comment: '0:待发放 1:已发放 2:已冻结' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
