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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly roomsService: RoomsService) {}

  handleConnection(client: Socket) {
    // Client connected
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
    data: { code: string; userId?: string; name: string; avatarUrl?: string }
  ) {
    const roomCode = data.code?.toUpperCase();
    const result = this.roomsService.joinMember(roomCode, {
      socketId: client.id,
      userId: data.userId,
      name: data.name || 'Guest Listener',
      avatarUrl: data.avatarUrl,
    });

    if (!result) {
      return { status: 'error', message: 'Room not found' };
    }

    client.join(roomCode);

    const serialized = this.roomsService.serializeRoom(result.room);

    // Broadcast member joined to room
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
    data: { code: string; track?: any; isPlaying?: boolean; seekTime?: number }
  ) {
    const roomCode = data.code?.toUpperCase();
    const room = this.roomsService.syncPlayback(roomCode, {
      track: data.track,
      isPlaying: data.isPlaying,
      seekTime: data.seekTime,
    });

    if (!room) return { status: 'error' };

    // Broadcast playback synchronization to all room members
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
    @MessageBody() data: { code: string; track: any }
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
    @MessageBody() data: { code: string; index: number }
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
      sender: string;
      avatarUrl?: string;
      text: string;
      isHost?: boolean;
    }
  ) {
    const roomCode = data.code?.toUpperCase();
    const message = this.roomsService.addMessage(roomCode, data);
    if (!message) return { status: 'error' };

    this.server.to(roomCode).emit('room_message_received', { message });
    return { status: 'ok', message };
  }
}
