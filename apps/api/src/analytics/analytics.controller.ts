import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  getOverview(@Req() req: any) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Admin privileges required to view platform analytics');
    }
    return this.analyticsService.getOverview();
  }

  @Get('artist/:id')
  @UseGuards(JwtAuthGuard)
  async getArtistMetrics(@Param('id') id: string) {
    const data = await this.analyticsService.getArtistMetrics(id);
    if (!data) {
      throw new NotFoundException('Artist not found');
    }
    return data;
  }
}
