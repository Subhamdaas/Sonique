import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('artist/:id')
  async getArtistMetrics(@Param('id') id: string) {
    const data = await this.analyticsService.getArtistMetrics(id);
    if (!data) {
      throw new NotFoundException('Artist not found');
    }
    return data;
  }
}
