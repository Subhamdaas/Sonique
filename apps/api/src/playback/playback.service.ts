import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RecordPlaybackEventDto, UpdatePlaybackStateDto } from './dto';

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

  async getPlaybackState(userId: string) {
    const state = await this.prisma.playbackState.findUnique({
      where: { userId },
    });
    if (!state) {
      return null;
    }
    let currentTrack = null;
    if (state.trackId) {
      currentTrack = await this.prisma.track.findUnique({
        where: { id: state.trackId },
        include: {
          artistRef: true,
          albumRef: true,
        },
      });
    }
    return {
      ...state,
      track: currentTrack,
    };
  }

  async updatePlaybackState(userId: string, dto: UpdatePlaybackStateDto) {
    const data: any = {
      updatedAt: new Date(),
    };
    if (dto.trackId !== undefined) data.trackId = dto.trackId;
    if (dto.positionSeconds !== undefined) data.positionSeconds = dto.positionSeconds;
    if (dto.queue !== undefined) data.queue = dto.queue;
    if (dto.queueIndex !== undefined) data.queueIndex = dto.queueIndex;
    if (dto.volume !== undefined) data.volume = dto.volume;
    if (dto.isMuted !== undefined) data.isMuted = dto.isMuted;
    if (dto.shuffle !== undefined) data.shuffle = dto.shuffle;
    if (dto.repeatMode !== undefined) data.repeatMode = dto.repeatMode;

    const state = await this.prisma.playbackState.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    return state;
  }

  async deletePlaybackState(userId: string) {
    await this.prisma.playbackState.deleteMany({
      where: { userId },
    });
    return { success: true };
  }
}
