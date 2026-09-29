import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, totalTracks, totalPlaylists, totalPlaysResult, activeTodayCount] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.track.count(),
        this.prisma.playlist.count(),
        this.prisma.track.aggregate({
          _sum: { plays: true },
        }),
        this.prisma.listeningHistory.groupBy({
          by: ['userId'],
          where: { playedAt: { gte: today } },
        }),
      ]);

    const topTracks = await this.prisma.track.findMany({
      orderBy: { plays: 'desc' },
      take: 5,
      include: {
        artistRef: {
          select: { id: true, name: true, imageUrl: true },
        },
      },
    });

    // Sanitize user info: do not leak email, passwordHash, or private user details
    const recentStreamEvents = await this.prisma.listeningHistory.findMany({
      orderBy: { playedAt: 'desc' },
      take: 10,
      include: {
        track: {
          select: { id: true, title: true, artist: true, coverUrl: true },
        },
        user: {
          select: { id: true, name: true, username: true },
        },
      },
    });

    return {
      stats: {
        totalStreams: totalPlaysResult._sum.plays || 0,
        totalUsers,
        totalTracks,
        totalPlaylists,
        dailyActiveListeners: activeTodayCount.length,
      },
      topTracks,
      recentStreamEvents,
    };
  }

  async getArtistMetrics(artistId: string) {
    const artist = await this.prisma.artist.findUnique({
      where: { id: artistId },
      include: {
        tracks: {
          orderBy: { plays: 'desc' },
        },
        albums: true,
      },
    });

    if (!artist) {
      return null;
    }

    const totalArtistPlays = artist.tracks.reduce(
      (sum, t) => sum + (t.plays || 0),
      0,
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trackIds = artist.tracks.map((t) => t.id);

    // Calculate real monthly listeners from listening history
    const monthlyListenersGroups = trackIds.length
      ? await this.prisma.listeningHistory.groupBy({
          by: ['userId'],
          where: {
            trackId: { in: trackIds },
            playedAt: { gte: thirtyDaysAgo },
          },
        })
      : [];

    // Calculate real track likes across artist's tracks
    const totalLikes = trackIds.length
      ? await this.prisma.like.count({
          where: { trackId: { in: trackIds } },
        })
      : 0;

    return {
      artist: {
        id: artist.id,
        name: artist.name,
        imageUrl: artist.imageUrl,
        genres: artist.genres,
      },
      metrics: {
        totalStreams: totalArtistPlays,
        monthlyListeners: monthlyListenersGroups.length,
        followers: totalLikes,
      },
      topTracks: artist.tracks.slice(0, 5),
      discography: artist.albums,
    };
  }
}
