import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  AddPlaylistTrackDto,
  CreatePlaylistDto,
  ReorderTracksDto,
  UpdatePlaylistDto,
} from './dto';

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublic(userId?: string) {
    return this.prisma.playlist.findMany({
      where: userId
        ? {
            OR: [{ isPublic: true }, { ownerId: userId }],
          }
        : { isPublic: true },
      include: {
        owner: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
        _count: {
          select: { tracks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyPlaylists(userId: string) {
    return this.prisma.playlist.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: { tracks: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
        tracks: {
          include: {
            track: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (!playlist.isPublic && playlist.ownerId !== userId) {
      throw new ForbiddenException('This playlist is private');
    }

    return playlist;
  }

  async create(dto: CreatePlaylistDto, userId: string) {
    return this.prisma.playlist.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim(),
        coverUrl: dto.coverUrl,
        isPublic: dto.isPublic ?? true,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
      },
    });
  }

  async update(id: string, dto: UpdatePlaylistDto, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.ownerId !== userId) {
      throw new ForbiddenException('You cannot edit someone else\'s playlist');
    }

    return this.prisma.playlist.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.description !== undefined && { description: dto.description.trim() }),
        ...(dto.coverUrl !== undefined && { coverUrl: dto.coverUrl }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
    });
  }

  async remove(id: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.ownerId !== userId) {
      throw new ForbiddenException('You cannot delete someone else\'s playlist');
    }

    await this.prisma.playlist.delete({ where: { id } });
    return { message: 'Playlist deleted successfully', id };
  }

  async addTrack(playlistId: string, dto: AddPlaylistTrackDto, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { tracks: true },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.ownerId !== userId) {
      throw new ForbiddenException('You cannot modify someone else\'s playlist');
    }

    const track = await this.prisma.track.findUnique({ where: { id: dto.trackId } });
    if (!track) throw new NotFoundException('Track not found');

    const nextPosition = playlist.tracks.length;

    return this.prisma.playlistTrack.upsert({
      where: {
        playlistId_trackId: {
          playlistId,
          trackId: dto.trackId,
        },
      },
      update: { position: nextPosition },
      create: {
        playlistId,
        trackId: dto.trackId,
        position: nextPosition,
      },
      include: {
        track: true,
      },
    });
  }

  async removeTrack(playlistId: string, trackId: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.ownerId !== userId) {
      throw new ForbiddenException('You cannot modify someone else\'s playlist');
    }

    await this.prisma.playlistTrack.deleteMany({
      where: { playlistId, trackId },
    });

    return { message: 'Track removed from playlist', playlistId, trackId };
  }

  async reorderTracks(playlistId: string, dto: ReorderTracksDto, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.ownerId !== userId) {
      throw new ForbiddenException('You cannot modify someone else\'s playlist');
    }

    const updates = dto.positions.map((item) =>
      this.prisma.playlistTrack.updateMany({
        where: { playlistId, trackId: item.trackId },
        data: { position: item.position },
      }),
    );

    await this.prisma.$transaction(updates);
    return { message: 'Playlist track order updated successfully' };
  }
}
