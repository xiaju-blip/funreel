import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ad_revenue_logs')
export class AdRevenueLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @Column({ name: 'placement_id' })
  placementId: number;

  @Column({ name: 'impression_time', type: 'datetime', nullable: true })
  impressionTime: Date;

  @Column({ name: 'click_time', type: 'datetime', nullable: true })
  clickTime: Date;

  @Column({ name: 'estimated_revenue', type: 'decimal', precision: 10, scale: 6, nullable: true })
  estimatedRevenue: number;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  @Column({ name: 'sdk_response_data', type: 'json', nullable: true })
  sdkResponseData: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
