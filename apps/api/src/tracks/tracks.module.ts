import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TracksController } from './tracks.controller';
import { TracksService } from './tracks.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  imports: [JwtModule],
  controllers: [TracksController],
  providers: [TracksService, PrismaService],
})
export class TracksModule {}