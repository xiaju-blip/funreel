import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('stake_records')
export class StakeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index('idx_user_id')
  userId: number;

  @Column({ name: 'pool_id' })
  poolId: number;

  @Column({ name: 'amount', type: 'decimal', precision: 20, scale: 8 })
  amount: number;

  @Column({ name: 'vip_level_at_stake', type: 'tinyint', nullable: true })
  vipLevelAtStake: number;

  @Column({ name: 'lock_end_time', type: 'datetime', nullable: true })
  lockEndTime: Date;

  @Column({ name: 'total_earned', type: 'decimal', precision: 20, scale: 8, default: 0 })
  totalEarned: number;

  @Column({ name: 'pending_earned', type: 'decimal', precision: 20, scale: 8, default: 0 })
  pendingEarned: number;

  @Column({ name: 'auto_compound', type: 'tinyint', default: 0 })
  autoCompound: number;

  @Column({ type: 'tinyint', default: 1 })
  @Index('idx_status')
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
