import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPersonalized(userId?: string) {
    // If user provided, check their listening history or liked tracks to identify favorite genres
    let preferredGenres: string[] = [];

    if (userId) {
      const likes = await this.prisma.like.findMany({
        where: { userId },
        include: { track: true },
        take: 10,
      });

      const history = await this.prisma.listeningHistory.findMany({
        where: { userId },
        include: { track: true },
        take: 10,
      });

      const genresSet = new Set<string>();
      likes.forEach((l) => {
        if (l.track?.genre) genresSet.add(l.track.genre);
      });
      history.forEach((h) => {
        if (h.track?.genre) genresSet.add(h.track.genre);
      });

      preferredGenres = Array.from(genresSet);
    }

    // Default fallback genres if new user
    if (preferredGenres.length === 0) {
      preferredGenres = ['Electronic', 'Synthwave', 'Dream Pop', 'Chill', 'Lofi'];
    }

    const recommendedTracks = await this.prisma.track.findMany({
      where: {
        genre: {
          in: preferredGenres,
        },
      },
      include: {
        artistRef: true,
        albumRef: true,
      },
      orderBy: {
        plays: 'desc',
      },
      take: 8,
    });

    const discoverWeekly = await this.prisma.track.findMany({
      include: {
        artistRef: true,
        albumRef: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
    });

    return {
      genres: preferredGenres,
      recommendedTracks: recommendedTracks.length ? recommendedTracks : discoverWeekly,
      discoverWeekly,
    };
  }

  async getSimilarTracks(trackId: string) {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      return [];
    }

    return this.prisma.track.findMany({
      where: {
        id: { not: trackId },
        OR: [
          { genre: track.genre || undefined },
          { artist: track.artist },
        ],
      },
      include: {
        artistRef: true,
        albumRef: true,
      },
      take: 6,
    });
  }
}
