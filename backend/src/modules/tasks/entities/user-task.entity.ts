import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('user_tasks')
export class UserTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index('idx_user_id')
  userId: number;

  @Column({ name: 'task_id' })
  @Index('uk_user_task')
  taskId: number;

  @Column({ default: 0 })
  progress: number;

  @Column({ nullable: true })
  target: number;

  @Column({ type: 'tinyint', default: 0 })
  @Index('idx_status')
  status: number; // 0:未开始 1:进行中 2:可领取 3:已完成 4:已过期

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date;

  @Column({ name: 'claimed_at', type: 'datetime', nullable: true })
  claimedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
