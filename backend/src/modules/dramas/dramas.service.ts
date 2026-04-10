import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drama } from './entities/drama.entity';
import { DramaEpisode } from './entities/drama-episode.entity';

@Injectable()
export class DramasService {
  constructor(
    @InjectRepository(Drama)
    private readonly dramaRepository: Repository<Drama>,
    @InjectRepository(DramaEpisode)
    private readonly dramaEpisodeRepository: Repository<DramaEpisode>,
  ) {}

  /**
   * 获取热门短剧列表
   */
  async getHotDramas(limit: number = 10): Promise<Drama[]> {
    return this.dramaRepository
      .createQueryBuilder('d')
      .where('d.status = 1')
      .orderBy('d.releaseTime', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * 获取所有短剧列表
   */
  async getAllDramas(): Promise<Drama[]> {
    return this.dramaRepository.find({
      where: { status: 1 },
      order: { releaseTime: 'DESC' },
    });
  }

  /**
   * 获取短剧详情
   */
  async getDramaDetail(id: number): Promise<Drama | null> {
    return this.dramaRepository.findOneBy({ id });
  }

  /**
   * 获取短剧的所有剧集
   */
  async getEpisodes(dramaId: number): Promise<DramaEpisode[]> {
    return this.dramaEpisodeRepository.find({
      where: { dramaId },
      order: { sortOrder: 'ASC' },
    });
  }

  /**
   * 获取单个剧集
   */
  async getEpisode(dramaId: number, episodeId: number): Promise<DramaEpisode | null> {
    return this.dramaEpisodeRepository.findOne({
      where: { dramaId, id: episodeId },
    });
  }

  /**
   * 创建短剧
   */
  async createDrama(data: Partial<Drama>): Promise<Drama> {
    const drama = this.dramaRepository.create(data);
    return this.dramaRepository.save(drama);
  }

  /**
   * 更新短剧
   */
  async updateDrama(id: number, data: Partial<Drama>): Promise<Drama | null> {
    await this.dramaRepository.update(id, data);
    return this.dramaRepository.findOneBy({ id });
  }
}
