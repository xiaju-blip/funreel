import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('amm_swaps')
export class AmmSwap {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pool_id' })
  @Index('idx_pool')
  poolId: number;

  @Column({ name: 'user_id' })
  @Index('idx_user')
  userId: number;

  @Column({ type: 'tinyint', name: 'direction' })
  direction: number; // 1:买入IPT, 2:卖出IPT

  @Column({ name: 'amount_in', type: 'decimal', precision: 20, scale: 8 })
  amountIn: number;

  @Column({ name: 'amount_out', type: 'decimal', precision: 20, scale: 8 })
  amountOut: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  price: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  fee: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  slippage: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
