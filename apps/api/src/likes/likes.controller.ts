import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { LikesService } from './likes.service';

@Controller('likes')
@UseGuards(AuthGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Get()
  async getMyLikedTracks(@Req() req: any) {
    return this.likesService.getUserLikedTracks(req.user.sub);
  }

  @Get(':trackId/status')
  async getLikeStatus(@Param('trackId') trackId: string, @Req() req: any) {
    const isLiked = await this.likesService.isTrackLiked(req.user.sub, trackId);
    return { trackId, liked: isLiked };
  }

  @Post(':trackId')
  async like(@Param('trackId') trackId: string, @Req() req: any) {
    return this.likesService.likeTrack(req.user.sub, trackId);
  }

  @Delete(':trackId')
  async unlike(@Param('trackId') trackId: string, @Req() req: any) {
    return this.likesService.unlikeTrack(req.user.sub, trackId);
  }
}
