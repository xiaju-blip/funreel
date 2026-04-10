import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index('idx_user_id')
  userId: number;

  @Column({ name: 'asset_id' })
  @Index('idx_asset_id')
  assetId: number;

  @Column({ type: 'tinyint', comment: '1:买入 2:卖出' })
  type: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  price: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount: number;

  @Column({ type: 'tinyint', default: 0 })
  status: number;

  @Column({ name: 'liquidity_source', type: 'tinyint', default: 1, comment: '1:C2C 2:AMM' })
  liquiditySource: number;

  @Column({ name: 'slippage_rate', type: 'decimal', precision: 5, scale: 4, nullable: true })
  slippageRate: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
