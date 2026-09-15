import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string, type?: string) {
    const q = query?.trim();
    if (!q) {
      return {
        tracks: [],
        artists: [],
        albums: [],
        playlists: [],
        podcasts: [],
      };
    }

    const searchTracks = !type || type === 'all' || type === 'tracks';
    const searchArtists = !type || type === 'all' || type === 'artists';
    const searchAlbums = !type || type === 'all' || type === 'albums';
    const searchPlaylists = !type || type === 'all' || type === 'playlists';
    const searchPodcasts = !type || type === 'all' || type === 'podcasts';

    const [tracks, artists, albums, playlists, podcasts] = await Promise.all([
      searchTracks
        ? this.prisma.track.findMany({
            where: {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { artist: { contains: q, mode: 'insensitive' } },
                { genre: { contains: q, mode: 'insensitive' } },
              ],
            },
            take: 20,
            include: { artistRef: true, albumRef: true },
          })
        : [],
      searchArtists
        ? this.prisma.artist.findMany({
            where: {
              name: { contains: q, mode: 'insensitive' },
            },
            take: 10,
          })
        : [],
      searchAlbums
        ? this.prisma.album.findMany({
            where: {
              title: { contains: q, mode: 'insensitive' },
            },
            take: 10,
            include: { artist: true },
          })
        : [],
      searchPlaylists
        ? this.prisma.playlist.findMany({
            where: {
              isPublic: true,
              title: { contains: q, mode: 'insensitive' },
            },
            take: 10,
            include: {
              owner: { select: { id: true, name: true, avatarUrl: true } },
              _count: { select: { tracks: true } },
            },
          })
        : [],
      searchPodcasts
        ? this.prisma.podcastShow.findMany({
            where: {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { author: { contains: q, mode: 'insensitive' } },
                { category: { contains: q, mode: 'insensitive' } },
              ],
            },
            take: 10,
            include: {
              _count: { select: { episodes: true } },
            },
          })
        : [],
    ]);

    return {
      query: q,
      tracks,
      artists,
      albums,
      playlists,
      podcasts,
    };
  }
}
