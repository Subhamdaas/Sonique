import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserLikedTracks(userId: string) {
    const likes = await this.prisma.like.findMany({
      where: { userId },
      include: {
        track: {
          include: {
            artistRef: true,
            albumRef: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return likes.map((l) => ({
      ...l.track,
      likedAt: l.createdAt,
    }));
  }

  async isTrackLiked(userId: string, trackId: string): Promise<boolean> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_trackId: {
          userId,
          trackId,
        },
      },
    });

    return !!like;
  }

  async likeTrack(userId: string, trackId: string) {
    const track = await this.prisma.track.findUnique({ where: { id: trackId } });
    if (!track) throw new NotFoundException('Track not found');

    const existing = await this.prisma.like.findUnique({
      where: {
        userId_trackId: {
          userId,
          trackId,
        },
      },
    });

    if (existing) {
      return { message: 'Track already liked', liked: true, trackId };
    }

    await this.prisma.like.create({
      data: {
        userId,
        trackId,
      },
    });

    return { message: 'Track added to liked songs', liked: true, trackId };
  }

  async unlikeTrack(userId: string, trackId: string) {
    await this.prisma.like.deleteMany({
      where: {
        userId,
        trackId,
      },
    });

    return { message: 'Track removed from liked songs', liked: false, trackId };
  }
}
