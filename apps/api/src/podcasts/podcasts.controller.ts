import { Controller, Get, Param, Query } from '@nestjs/common';
import { PodcastsService } from './podcasts.service';

@Controller('podcasts')
export class PodcastsController {
  constructor(private readonly podcastsService: PodcastsService) {}

  @Get('shows')
  async getShows(@Query('category') category?: string) {
    return this.podcastsService.getShows(category);
  }

  @Get('shows/:id')
  async getShow(@Param('id') id: string) {
    return this.podcastsService.getShowById(id);
  }

  @Get('episodes/:id')
  async getEpisode(@Param('id') id: string) {
    return this.podcastsService.getEpisodeById(id);
  }
}
