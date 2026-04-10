import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('shop_items')
export class ShopItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'tinyint', comment: '1:代币 2:VIP 3:补签卡 4:实物 5:抽奖券 6:道具' })
  type: number;

  @Column()
  points: number;

  @Column({ name: 'token_amount', type: 'decimal', precision: 20, scale: 8, nullable: true })
  tokenAmount: number;

  @Column({ name: 'vip_days', nullable: true })
  vipDays: number;

  @Column({ default: -1, comment: '-1 means unlimited' })
  stock: number;

  @Column({ name: 'daily_limit', default: 0 })
  dailyLimit: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
