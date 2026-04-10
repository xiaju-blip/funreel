import { Controller, Get } from '@nestjs/common';
import { AdsService } from './ads.service';

@Controller('api/ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get('placements')
  async getPlacements() {
    const placements = await this.adsService.getAllPlacements();
    return { success: true, data: placements };
  }
}
