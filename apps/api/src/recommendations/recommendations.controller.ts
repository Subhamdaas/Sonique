import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recService: RecommendationsService) {}

  @Get('personalized')
  getPersonalized(@Query('userId') userId?: string) {
    return this.recService.getPersonalized(userId);
  }

  @Get('similar/:trackId')
  getSimilar(@Param('trackId') trackId: string) {
    return this.recService.getSimilarTracks(trackId);
  }
}
