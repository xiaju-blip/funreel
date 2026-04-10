import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('stake_pools')
export class StakePool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ name: 'lock_days' })
  lockDays: number;

  @Column({ name: 'base_apy', type: 'decimal', precision: 5, scale: 2 })
  baseApy: number;

  @Column({ name: 'max_stake', type: 'decimal', precision: 20, scale: 8, nullable: true })
  maxStake: number;

  @Column({ name: 'min_stake', type: 'decimal', precision: 20, scale: 8, default: 100 })
  minStake: number;

  @Column({ name: 'penalty_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  penaltyRate: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
