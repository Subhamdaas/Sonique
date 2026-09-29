import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PlaybackService } from './playback.service';
import { RecordPlaybackEventDto, UpdatePlaybackStateDto } from './dto';

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

  @Get('state')
  @UseGuards(AuthGuard)
  async getPlaybackState(@Req() req: any) {
    return this.playbackService.getPlaybackState(req.user.sub);
  }

  @Put('state')
  @UseGuards(AuthGuard)
  async updatePlaybackState(
    @Req() req: any,
    @Body() dto: UpdatePlaybackStateDto,
  ) {
    return this.playbackService.updatePlaybackState(req.user.sub, dto);
  }

  @Delete('state')
  @UseGuards(AuthGuard)
  async deletePlaybackState(@Req() req: any) {
    return this.playbackService.deletePlaybackState(req.user.sub);
  }
}
