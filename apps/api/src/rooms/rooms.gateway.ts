import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';
import { JwtService } from '@nestjs/jwt';
import { env } from '../config/env';

@WebSocketGateway({
  cors: {
    origin: (process.env.FRONTEND_URL || 'http://localhost:5173,http://127.0.0.1:5173')
      .split(',')
      .map((s) => s.trim()),
    credentials: true,
  },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly roomsService: RoomsService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    // Authenticate socket user if token provided in auth or query or headers
    try {
      const rawToken =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '') ||
        (client.handshake.query?.token as string);

      if (rawToken) {
        const payload = this.jwtService.verify(rawToken, {
          secret: env.jwtSecret,
        });
        (client as any).authenticatedUser = payload;
      }
    } catch {
      // Unauthenticated / guest connection
      (client as any).authenticatedUser = null;
    }
  }

  handleDisconnect(client: Socket) {
    const res = this.roomsService.removeMember(client.id);
    if (res) {
      const { room, leftMember } = res;
      this.server.to(room.code).emit('room_member_left', {
        member: leftMember,
        members: Array.from(room.members.values()),
        hostId: room.hostId,
        hostName: room.hostName,
      });
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { code: string; userId?: string; name: string; avatarUrl?: string },
  ) {
    const roomCode = data.code?.toUpperCase();

    // Prefer verified authenticated identity over client-supplied userId
    const authUser = (client as any).authenticatedUser;
    const verifiedUserId = authUser?.sub || data.userId;
    const displayName =
      authUser?.name || authUser?.username || data.name || 'Guest Listener';

    const result = this.roomsService.joinMember(roomCode, {
      socketId: client.id,
      userId: verifiedUserId,
      name: displayName,
      avatarUrl: data.avatarUrl,
    });

    if (!result) {
      return { status: 'error', message: 'Room not found' };
    }

    client.join(roomCode);

    const serialized = this.roomsService.serializeRoom(result.room);

    this.server.to(roomCode).emit('room_member_joined', {
      member: result.joinedMember,
      members: serialized.members,
    });

    return { status: 'ok', room: serialized };
  }

  @SubscribeMessage('sync_playback')
  handleSyncPlayback(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { code: string; track?: any; isPlaying?: boolean; seekTime?: number },
  ) {
    const roomCode = data.code?.toUpperCase();
    const room = this.roomsService.syncPlayback(roomCode, client.id, {
      track: data.track,
      isPlaying: data.isPlaying,
      seekTime: data.seekTime,
    });

    if (!room) {
      return { status: 'error', message: 'Unauthorized or room not found' };
    }

    client.to(roomCode).emit('room_playback_synced', {
      track: room.currentTrack,
      isPlaying: room.isPlaying,
      seekTime: room.seekTime,
      timestamp: room.lastSyncTimestamp,
    });

    return { status: 'ok' };
  }

  @SubscribeMessage('queue_add')
  handleQueueAdd(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { code: string; track: any },
  ) {
    const roomCode = data.code?.toUpperCase();
    const room = this.roomsService.addToQueue(roomCode, data.track);
    if (!room) return { status: 'error' };

    this.server.to(roomCode).emit('room_queue_updated', {
      queue: room.queue,
    });

    return { status: 'ok', queue: room.queue };
  }

  @SubscribeMessage('queue_remove')
  handleQueueRemove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { code: string; index: number },
  ) {
    const roomCode = data.code?.toUpperCase();
    const room = this.roomsService.removeFromQueue(roomCode, data.index);
    if (!room) return { status: 'error' };

    this.server.to(roomCode).emit('room_queue_updated', {
      queue: room.queue,
    });

    return { status: 'ok', queue: room.queue };
  }

  @SubscribeMessage('send_message')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      code: string;
      text: string;
      avatarUrl?: string;
    },
  ) {
    const roomCode = data.code?.toUpperCase();
    const message = this.roomsService.addMessage(roomCode, client.id, {
      text: data.text,
      avatarUrl: data.avatarUrl,
    });
    if (!message) return { status: 'error', message: 'Not a member of room' };

    this.server.to(roomCode).emit('room_message_received', { message });
    return { status: 'ok', message };
  }
}
