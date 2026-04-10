import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdPlacement } from './entities/ad-placement.entity';

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(AdPlacement)
    private readonly adPlacementRepository: Repository<AdPlacement>,
  ) {}

  async getAllPlacements() {
    return this.adPlacementRepository.find({ where: { status: 1 }, order: { priority: 'ASC' } });
  }
}
