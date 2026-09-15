import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getArtists() {
    return this.prisma.artist.findMany({
      include: {
        _count: {
          select: { tracks: true, albums: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getArtistById(id: string) {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
      include: {
        albums: {
          include: {
            _count: { select: { tracks: true } },
          },
        },
        tracks: {
          orderBy: { plays: 'desc' },
          take: 20,
        },
      },
    });

    if (!artist) throw new NotFoundException('Artist not found');
    return artist;
  }

  async getAlbums() {
    return this.prisma.album.findMany({
      include: {
        artist: { select: { id: true, name: true, imageUrl: true } },
        _count: { select: { tracks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAlbumById(id: string) {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        tracks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!album) throw new NotFoundException('Album not found');
    return album;
  }

  async getFeatured() {
    const [featuredTracks, topPlaylists, newReleases, popularArtists] = await Promise.all([
      this.prisma.track.findMany({
        take: 24,
        orderBy: { plays: 'desc' },
        include: { artistRef: true, albumRef: true },
      }),
      this.prisma.playlist.findMany({
        where: { isPublic: true },
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { tracks: true } },
        },
      }),
      this.prisma.album.findMany({
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: { artist: true },
      }),
      this.prisma.artist.findMany({
        take: 18,
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      featuredTracks,
      topPlaylists,
      newReleases,
      popularArtists,
    };
  }

  async getGenres() {
    const tracks = await this.prisma.track.findMany({
      where: { genre: { not: null } },
      select: { genre: true },
      distinct: ['genre'],
    });

    const standardGenres = [
      'Pop',
      'Electronic',
      'Indie',
      'Rock',
      'Chill',
      'R&B',
      'Hip-Hop',
      'Classical',
      'Jazz',
      'Ambient',
    ];

    const found = tracks.map((t) => t.genre as string).filter(Boolean);
    const combined = Array.from(new Set([...standardGenres, ...found]));

    return combined.map((g) => ({
      name: g,
      coverUrl: `https://images.unsplash.com/photo-${g === 'Electronic' ? '1516280440614-37939bbacd81' : g === 'Rock' ? '1498038432885-c6f3f1b912ee' : '1511671782779-c97d3d27a1d4'}?auto=format&fit=crop&w=600&q=80`,
    }));
  }
}
