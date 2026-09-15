import { Module } from '@nestjs/common';
import { PodcastsController } from './podcasts.controller';
import { PodcastsService } from './podcasts.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [PodcastsController],
  providers: [PodcastsService, PrismaService],
  exports: [PodcastsService],
})
export class PodcastsModule {}
