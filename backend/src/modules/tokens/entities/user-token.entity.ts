import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('user_tokens')
export class UserToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @Column({ name: 'balance', type: 'decimal', precision: 20, scale: 8, default: 0 })
  balance: number;

  @Column({ name: 'total_earned', type: 'decimal', precision: 20, scale: 8, default: 0 })
  totalEarned: number;

  @Column({ name: 'total_spent', type: 'decimal', precision: 20, scale: 8, default: 0 })
  totalSpent: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
