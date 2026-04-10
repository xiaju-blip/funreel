import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('dramas')
export class Drama {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json', nullable: false })
  title: { zh: string; en: string };

  @Column({ type: 'json', nullable: true })
  description: { zh: string; en: string };

  @Column({ type: 'json', nullable: true })
  tags: { zh: string[]; en: string[] };

  @Column({ name: 'cover_image', length: 255 })
  coverImage: string;

  @Column({ name: 'category_id', nullable: true })
  @Index('idx_category')
  categoryId: number;

  @Column({ name: 'total_episodes', default: 0 })
  totalEpisodes: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'vip_level', type: 'tinyint', default: 0 })
  vipLevel: number;

  @Column({ name: 'release_date', type: 'date', nullable: true })
  releaseDate: Date;

  @Column({ name: 'release_time', type: 'datetime', nullable: true })
  releaseTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
