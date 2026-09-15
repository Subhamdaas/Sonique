import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class PodcastsService {
  constructor(private readonly prisma: PrismaService) {}

  async getShows(category?: string) {
    return this.prisma.podcastShow.findMany({
      where: category ? { category } : undefined,
      include: {
        _count: { select: { episodes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getShowById(id: string) {
    const show = await this.prisma.podcastShow.findUnique({
      where: { id },
      include: {
        episodes: {
          orderBy: { publishedAt: 'desc' },
        },
      },
    });

    if (!show) throw new NotFoundException('Podcast show not found');
    return show;
  }

  async getEpisodeById(id: string) {
    const episode = await this.prisma.podcastEpisode.findUnique({
      where: { id },
      include: {
        show: true,
      },
    });

    if (!episode) throw new NotFoundException('Episode not found');
    return episode;
  }
}
