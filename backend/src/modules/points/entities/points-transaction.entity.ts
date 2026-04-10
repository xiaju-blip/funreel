import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('points_transactions')
export class PointsTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index('idx_user_id')
  userId: number;

  @Column({
    type: 'tinyint',
    comment: '1:观看视频 2:签到 3:广告 4:兑换 5:补签 6:任务奖励 7:活动奖励',
  })
  type: number;

  @Column()
  amount: number;

  @Column({ name: 'balance_after' })
  balanceAfter: number;

  @Column({ name: 'source_id', nullable: true, length: 64 })
  sourceId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
