import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RecordPlaybackEventDto } from './dto';

@Injectable()
export class PlaybackService {
  constructor(private readonly prisma: PrismaService) {}

  async recordEvent(dto: RecordPlaybackEventDto, userId?: string) {
    const track = await this.prisma.track.findUnique({
      where: { id: dto.trackId },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    // Increment track play count atomically
    await this.prisma.track.update({
      where: { id: dto.trackId },
      data: {
        plays: { increment: 1 },
      },
    });

    // If authenticated user, record listening history
    if (userId) {
      await this.prisma.listeningHistory.create({
        data: {
          userId,
          trackId: dto.trackId,
          durationPlayed: dto.durationPlayed ?? 0,
        },
      });
    }

    return {
      success: true,
      trackId: dto.trackId,
      currentPlays: track.plays + 1,
    };
  }

  async getHistory(userId: string, limit = 20) {
    const history = await this.prisma.listeningHistory.findMany({
      where: { userId },
      take: limit,
      orderBy: { playedAt: 'desc' },
      include: {
        track: {
          include: {
            artistRef: true,
            albumRef: true,
          },
        },
      },
    });

    return history.map((h) => ({
      ...h.track,
      playedAt: h.playedAt,
      historyId: h.id,
    }));
  }

  async getTopTracks(limit = 10) {
    return this.prisma.track.findMany({
      take: limit,
      orderBy: { plays: 'desc' },
      include: {
        artistRef: true,
        albumRef: true,
      },
    });
  }
}
