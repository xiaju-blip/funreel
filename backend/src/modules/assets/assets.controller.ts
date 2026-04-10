import { Controller, Get, Param } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('api/assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  async getAllAssets() {
    const assets = await this.assetsService.getAllAssets();
    return { success: true, data: assets };
  }

  @Get(':id')
  async getAsset(@Param('id') id: string) {
    const asset = await this.assetsService.getAssetById(parseInt(id));
    return { success: true, data: asset };
  }
}
