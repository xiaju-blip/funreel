import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'tinyint', comment: '1:新手 2:每日 3:每周 4:成就 5:限时' })
  type: number;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ name: 'condition_type', length: 50 })
  conditionType: string;

  @Column({ name: 'condition_value', type: 'text', nullable: true })
  conditionValue: string;

  @Column({ name: 'reward_points' })
  rewardPoints: number;

  @Column({ name: 'reward_token', type: 'decimal', precision: 20, scale: 8, default: 0 })
  rewardToken: number;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'start_time', type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
