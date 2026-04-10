import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('block_checkpoint')
export class BlockCheckpoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chain_id', unique: true })
  chainId: number;

  @Column({ name: 'last_confirmed_height' })
  lastConfirmedHeight: number;

  @Column({ name: 'block_hash', nullable: true, length: 66 })
  blockHash: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
