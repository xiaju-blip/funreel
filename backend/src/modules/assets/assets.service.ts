import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  async getAllAssets() {
    return this.assetRepository.find({
    where: { status: 1 },
    order: { createdAt: 'DESC' },
  });
  }

  async getAssetById(id: number) {
    return this.assetRepository.findOneBy({ id });
  }
}
