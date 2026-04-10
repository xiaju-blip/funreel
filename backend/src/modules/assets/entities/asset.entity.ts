import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true, length: 255 })
  cover: string;

  @Column({ nullable: true, length: 500 })
  video: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'target_amount', type: 'decimal', precision: 20, scale: 8, nullable: true })
  targetAmount: number;

  @Column({ name: 'raised_amount', type: 'decimal', precision: 20, scale: 8, default: 0 })
  raisedAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  apy: number;

  @Column({ name: 'duration_days', nullable: true })
  durationDays: number;

  @Column({ type: 'tinyint', default: 0 })
  status: number; // 0:Draft 1:Open 2:Closed 3:Settled

  @Column({ default: 0, comment: 'Optimistic lock version' })
  version: number;

  @Column({ name: 'start_time', type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
