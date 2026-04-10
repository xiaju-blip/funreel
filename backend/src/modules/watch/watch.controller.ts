import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WatchService } from './watch.service';

@Controller('api/watch')
@UseGuards(AuthGuard('jwt'))
export class WatchController {
  constructor(private readonly watchService: WatchService) {}

  @Post('event')
  async processWatchEvent(
    @Request() req,
    @Body() body: {
      dramaId: number;
      episodeId: number;
      watchDurationSec: number;
      isCompleted: boolean;
      deviceFingerprint: string;
    },
  ) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';

    const result = await this.watchService.processWatchEvent(
      req.user.id,
      body.dramaId,
      body.episodeId,
      body.watchDurationSec,
      body.isCompleted,
      body.deviceFingerprint,
      ip,
      userAgent,
    );

    if (result.blocked) {
      return {
        success: false,
        points: 0,
        error: result.reason,
      };
    }

    return {
      success: true,
      points: result.points,
    };
  }

  @Get('check-limit')
  async checkDailyLimit(@Request() req) {
    const result = await this.watchService.checkDailyWatchLimit(req.user.id);
    return {
      success: true,
      ...result,
    };
  }
}
