import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('amm_pools')
export class AmmPool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ name: 'base_token', length: 20 })
  baseToken: string;

  @Column({ name: 'reserve_ipt', type: 'decimal', precision: 20, scale: 8 })
  reserveIpt: number;

  @Column({ name: 'reserve_base', type: 'decimal', precision: 20, scale: 8 })
  reserveBase: number;

  @Column({ name: 'fee_rate', type: 'decimal', precision: 5, scale: 4, default: 0.003 })
  feeRate: number;

  @Column({ name: 'k_value', type: 'decimal', precision: 40, scale: 8, insert: false })
  kValue: number;

  @Column({ name: 'total_lp_tokens', type: 'decimal', precision: 20, scale: 8, default: 0 })
  totalLpTokens: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
