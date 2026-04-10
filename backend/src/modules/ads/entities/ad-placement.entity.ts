import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ad_placements')
export class AdPlacement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'sdk_provider', length: 50 })
  sdkProvider: string;

  @Column({ name: 'placement_id', length: 100 })
  placementId: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'frequency_cap', default: 1 })
  frequencyCap: number;

  @Column({ default: 0 })
  priority: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
