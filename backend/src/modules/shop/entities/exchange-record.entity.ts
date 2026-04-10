import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('exchange_records')
export class ExchangeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index('idx_user_id')
  userId: number;

  @Column({ name: 'item_id' })
  itemId: number;

  @Column({ name: 'points_used' })
  pointsUsed: number;

  @Column()
  quantity: number;

  @Column({ type: 'tinyint', default: 0 })
  status: number;

  @Column({ name: 'token_sent', type: 'decimal', precision: 20, scale: 8, nullable: true })
  tokenSent: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
