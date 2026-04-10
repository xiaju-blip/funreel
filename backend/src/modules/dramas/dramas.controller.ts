import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DramasService } from './dramas.service';

@Controller('api/dramas')
export class DramasController {
  constructor(private readonly dramasService: DramasService) {}

  @Get('hot')
  async getHotDramas(@Query('limit') limit: string = '10') {
    const dramas = await this.dramasService.getHotDramas(parseInt(limit));
    return { success: true, data: dramas };
  }

  @Get()
  async getAllDramas() {
    const dramas = await this.dramasService.getAllDramas();
    return { success: true, data: dramas };
  }

  @Get(':id')
  async getDramaDetail(@Param('id') id: string) {
    const drama = await this.dramasService.getDramaDetail(parseInt(id));
    return { success: true, data: drama };
  }

  @Get(':id/episodes')
  async getEpisodes(@Param('id') id: string) {
    const episodes = await this.dramasService.getEpisodes(parseInt(id));
    return { success: true, data: episodes };
  }
}

@Controller('admin/dramas')
@UseGuards(AuthGuard('jwt'))
export class AdminDramasController {
  constructor(private readonly dramasService: DramasService) {}

  @Get()
  async getAllDramas() {
    const dramas = await this.dramasService.getAllDramas();
    return { success: true, data: dramas };
  }
}
