import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DramasService } from './dramas.service';
import { DramasController, AdminDramasController } from './dramas.controller';
import { Drama } from './entities/drama.entity';
import { DramaEpisode } from './entities/drama-episode.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Drama, DramaEpisode])],
  providers: [DramasService],
  controllers: [DramasController, AdminDramasController],
  exports: [DramasService],
})
export class DramasModule {}
