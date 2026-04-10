import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('stake_earnings_periods')
export class StakeEarningsPeriod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'stake_id' })
  @Index('idx_stake_id')
  stakeId: number;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime' })
  endTime: Date;

  @Column({ name: 'applied_vip_level', type: 'tinyint', nullable: true })
  appliedVipLevel: number;

  @Column({ name: 'applied_apy', type: 'decimal', precision: 5, scale: 2 })
  appliedApy: number;

  @Column({ name: 'earned_amount', type: 'decimal', precision: 20, scale: 8 })
  earnedAmount: number;

  @Column({ name: 'is_settled', type: 'tinyint', default: 0 })
  @Index('idx_settled')
  isSettled: number;

  @Column({ name: 'event_trigger', length: 20, nullable: true })
  eventTrigger: string; // VIP_CHANGE / DEPOSIT / WITHDRAW

  @Column({ name: 'settled_at', type: 'datetime', nullable: true })
  settledAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
