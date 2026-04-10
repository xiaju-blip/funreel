import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('token_burns')
export class TokenBurns {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount: number;

  @Column({ length: 50, nullable: true })
  source: string;

  @Column({ length: 100, nullable: true })
  txHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
