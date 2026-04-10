import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('token_transactions')
export class TokenTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index('idx_user_id')
  userId: number;

  @Column({ type: 'tinyint', comment: '1:积分兑换 2:VIP 购买 3:质押收益 4:提现 5:空投' })
  type: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 20, scale: 8 })
  balanceAfter: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 0=invalid 1=valid

  @Column({ name: 'tx_hash', length: 100, nullable: true })
  txHash: string;

  @Column({ name: 'block_number', nullable: true })
  blockNumber: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
