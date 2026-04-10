import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('watch_records')
export class WatchRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index('uk_user_episode')
  userId: number;

  @Column({ name: 'drama_id' })
  dramaId: number;

  @Column({ name: 'episode_id' })
  episodeId: number;

  @Column({ name: 'watch_duration' })
  watchDuration: number;

  @Column({ name: 'is_completed', type: 'tinyint', default: 0 })
  isCompleted: number;

  @Column({ name: 'has_interaction', type: 'tinyint', default: 0 })
  hasInteraction: number;

  @Column({ name: 'device_fingerprint', nullable: true, length: 64 })
  deviceFingerprint: string;

  @Column({ name: 'ip_address', nullable: true, length: 45 })
  ipAddress: string;

  @Column({ name: 'risk_score', default: 0 })
  riskScore: number;

  @Column({ name: 'last_watch_time', type: 'datetime' })
  @Index('uk_user_episode')
  lastWatchTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
