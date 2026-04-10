import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('vip_orders')
export class VipOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index('idx_user_id')
  userId: number;

  @Column({ name: 'vip_level', type: 'tinyint' })
  vipLevel: number;

  @Column({ name: 'duration_type', type: 'tinyint', comment: '1:月 2:季 3:年 4:终身' })
  durationType: number;

  @Column({ name: 'duration_days' })
  durationDays: number;

  @Column({ name: 'price_fiat', type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceFiat: number;

  @Column({ name: 'price_token', type: 'decimal', precision: 20, scale: 8, nullable: true })
  priceToken: number;

  @Column({ name: 'payment_method', type: 'tinyint' })
  paymentMethod: number;

  @Column({ type: 'tinyint', default: 0 })
  status: number;

  @Column({ name: 'pay_time', type: 'datetime', nullable: true })
  payTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
