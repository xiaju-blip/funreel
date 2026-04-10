import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ name: 'amount', type: 'decimal', precision: 20, scale: 8 })
  amount: number;

  @Column({ name: 'cost_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  costPrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
