import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  getRooms() {
    return this.roomsService.getPublicRooms();
  }

  @Post()
  createRoom(
    @Body()
    body: {
      name: string;
      genre?: string;
      isPublic?: boolean;
      hostId?: string;
      hostName?: string;
    }
  ) {
    const room = this.roomsService.createRoom({
      name: body.name || 'Vibe Session',
      genre: body.genre || 'All Genres',
      isPublic: body.isPublic !== false,
      hostId: body.hostId || 'guest-host',
      hostName: body.hostName || 'Host',
    });
    return this.roomsService.serializeRoom(room);
  }

  @Get(':code')
  getRoom(@Param('code') code: string) {
    const room = this.roomsService.getRoom(code);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return this.roomsService.serializeRoom(room);
  }
}
