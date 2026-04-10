import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('device_fingerprints')
export class DeviceFingerprint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index('idx_user_id')
  userId: number;

  @Column({ name: 'fingerprint_hash', length: 64 })
  @Index('idx_fingerprint')
  fingerprintHash: string;

  @Column({ name: 'first_seen', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  firstSeen: Date;

  @Column({ name: 'last_seen', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @UpdateDateColumn()
  lastSeen: Date;

  @Column({ name: 'risk_level', type: 'tinyint', default: 0 })
  riskLevel: number; // 0:正常 1:低风险 2:中风险 3:高风险(黑名单)
}
