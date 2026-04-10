import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('user_points')
export class UserPoints {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @Column({ default: 0 })
  balance: number;

  @Column({ name: 'total_earned', default: 0 })
  totalEarned: number;

  @Column({ name: 'total_spent', default: 0 })
  totalSpent: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
