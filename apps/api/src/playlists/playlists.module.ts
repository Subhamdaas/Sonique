import { Module } from '@nestjs/common';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [PlaylistsController],
  providers: [PlaylistsService, PrismaService, JwtService],
  exports: [PlaylistsService],
})
export class PlaylistsModule {}
