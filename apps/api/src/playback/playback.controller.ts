import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PlaybackService } from './playback.service';
import { RecordPlaybackEventDto } from './dto';

@Controller('playback')
export class PlaybackController {
  constructor(private readonly playbackService: PlaybackService) {}

  @Post('events')
  async recordEvent(@Body() dto: RecordPlaybackEventDto, @Req() req: any) {
    const userId = req.user?.sub;
    return this.playbackService.recordEvent(dto, userId);
  }

  @Get('history')
  @UseGuards(AuthGuard)
  async getHistory(@Req() req: any, @Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 20;
    return this.playbackService.getHistory(req.user.sub, lim);
  }

  @Get('top')
  async getTopTracks(@Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 10;
    return this.playbackService.getTopTracks(lim);
  }
}
