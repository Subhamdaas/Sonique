import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTrackDto } from './create-track.dto';
import { UpdateTrackDto } from './update-track.dto';


@Injectable()
export class TracksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.track.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const track = await this.prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    return track;
  }

  async create(dto: CreateTrackDto, userId: string) {
    return this.prisma.track.create({
      data: {
        title: dto.title.trim(),
        artist: dto.artist.trim(),
        album: dto.album?.trim(),
        duration: dto.duration,
        audioUrl: dto.audioUrl,
        coverUrl: dto.coverUrl,
        genre: dto.genre?.trim(),
        uploadedById: userId,
      },
    });
  }
  async update(id: string, dto: UpdateTrackDto, userId: string) {
    const track = await this.prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    if (track.uploadedById !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this track',
      );
    }

    return this.prisma.track.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.artist !== undefined && { artist: dto.artist.trim() }),
        ...(dto.album !== undefined && { album: dto.album.trim() }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.audioUrl !== undefined && { audioUrl: dto.audioUrl }),
        ...(dto.coverUrl !== undefined && { coverUrl: dto.coverUrl }),
        ...(dto.genre !== undefined && { genre: dto.genre.trim() }),
      },
    });
  }

  async remove(id: string) {
    const track = await this.prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    await this.prisma.track.delete({
      where: { id },
    });

    return {
      message: 'Track deleted successfully',
      id,
    };
  }
}