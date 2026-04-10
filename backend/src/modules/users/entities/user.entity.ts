import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true, length: 100 })
  email: string;

  @Column({ name: 'password_hash', nullable: true, length: 255 })
  passwordHash: string;

  @Column({ nullable: true, length: 100, name: 'wallet_address' })
  walletAddress: string;

  @Column({ nullable: true, length: 50 })
  nickname: string;

  @Column({ nullable: true, length: 255 })
  avatar: string;

  @Column({ name: 'kyc_level', type: 'tinyint', default: 0 })
  kycLevel: number;

  @Column({ name: 'vip_level', type: 'tinyint', default: 0 })
  vipLevel: number;

  @Column({ name: 'invite_code', unique: true, length: 20 })
  inviteCode: string;

  @Column({ name: 'inviter_id', default: 0 })
  inviterId: number;

  @Column({ length: 10, default: 'en' })
  language: string;

  @Column({ name: 'timezone', length: 50, default: 'UTC' })
  timezone: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
