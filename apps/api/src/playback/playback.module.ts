import { Module } from '@nestjs/common';
import { PlaybackController } from './playback.controller';
import { PlaybackService } from './playback.service';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [PlaybackController],
  providers: [PlaybackService, PrismaService, JwtService],
  exports: [PlaybackService],
})
export class PlaybackModule {}
