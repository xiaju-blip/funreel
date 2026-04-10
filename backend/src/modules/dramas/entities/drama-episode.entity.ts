import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('drama_episodes')
export class DramaEpisode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'drama_id' })
  @Index('idx_drama_id')
  dramaId: number;

  @Column({ name: 'episode_num' })
  episodeNum: number;

  @Column({ type: 'json' })
  title: { zh: string; en: string };

  @Column({ name: 'video_url_encrypted', length: 500 })
  videoUrlEncrypted: string;

  @Column({ name: 'drm_key_id', length: 100, nullable: true })
  drmKeyId: string;

  @Column({ type: 'json', nullable: true })
  subtitles: { [lang: string]: string };

  @Column({ name: 'ad_break_points', type: 'json', nullable: true })
  adBreakPoints: Array<{ time: number; placementId: number }>;

  @Column()
  duration: number;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
