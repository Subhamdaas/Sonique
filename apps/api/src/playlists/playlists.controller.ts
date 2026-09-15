import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PlaylistsService } from './playlists.service';
import {
  AddPlaylistTrackDto,
  CreatePlaylistDto,
  ReorderTracksDto,
  UpdatePlaylistDto,
} from './dto';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get()
  async getPublic(@Req() req: any) {
    const userId = req.user?.sub;
    return this.playlistsService.findAllPublic(userId);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMyPlaylists(@Req() req: any) {
    return this.playlistsService.findMyPlaylists(req.user.sub);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.playlistsService.findOne(id, userId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() dto: CreatePlaylistDto, @Req() req: any) {
    return this.playlistsService.create(dto, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlaylistDto,
    @Req() req: any,
  ) {
    return this.playlistsService.update(id, dto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.playlistsService.remove(id, req.user.sub);
  }

  @Post(':id/tracks')
  @UseGuards(AuthGuard)
  async addTrack(
    @Param('id') id: string,
    @Body() dto: AddPlaylistTrackDto,
    @Req() req: any,
  ) {
    return this.playlistsService.addTrack(id, dto, req.user.sub);
  }

  @Delete(':id/tracks/:trackId')
  @UseGuards(AuthGuard)
  async removeTrack(
    @Param('id') id: string,
    @Param('trackId') trackId: string,
    @Req() req: any,
  ) {
    return this.playlistsService.removeTrack(id, trackId, req.user.sub);
  }

  @Put(':id/tracks/reorder')
  @UseGuards(AuthGuard)
  async reorder(
    @Param('id') id: string,
    @Body() dto: ReorderTracksDto,
    @Req() req: any,
  ) {
    return this.playlistsService.reorderTracks(id, dto, req.user.sub);
  }
}
