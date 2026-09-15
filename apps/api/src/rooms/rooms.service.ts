import { Injectable } from '@nestjs/common';

export interface RoomMember {
  socketId: string;
  userId?: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatarUrl?: string;
  text: string;
  timestamp: number;
  isHost?: boolean;
}

export interface Room {
  code: string;
  name: string;
  genre: string;
  isPublic: boolean;
  hostId: string;
  hostName: string;
  currentTrack: any | null;
  isPlaying: boolean;
  seekTime: number;
  lastSyncTimestamp: number;
  members: Map<string, RoomMember>;
  queue: any[];
  messages: ChatMessage[];
  createdAt: Date;
}

@Injectable()
export class RoomsService {
  private rooms: Map<string, Room> = new Map();

  constructor() {
    // Initialize a default public showcase room
    this.createRoom({
      name: 'Luminous Chill Lounge',
      genre: 'Chill / Electronic',
      isPublic: true,
      hostId: 'sonique-bot',
      hostName: 'Sonique Host',
    });
  }

  generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'SONIQUE-';
    for (let i = 0; i < 3; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom(data: {
    name: string;
    genre?: string;
    isPublic?: boolean;
    hostId: string;
    hostName: string;
  }): Room {
    let code = this.generateRoomCode();
    while (this.rooms.has(code)) {
      code = this.generateRoomCode();
    }

    const room: Room = {
      code,
      name: data.name || 'Vibe Session',
      genre: data.genre || 'All Genres',
      isPublic: data.isPublic !== false,
      hostId: data.hostId,
      hostName: data.hostName,
      currentTrack: {
        id: 's1',
        title: 'Starboy',
        artist: 'The Weeknd',
        duration: 230,
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
        coverUrl:
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80',
      },
      isPlaying: true,
      seekTime: 0,
      lastSyncTimestamp: Date.now(),
      members: new Map(),
      queue: [],
      messages: [
        {
          id: 'welcome',
          sender: 'Sonique Bot',
          text: 'Welcome to the room! Listen in sync, chat, and add songs to the queue.',
          timestamp: Date.now(),
          isHost: true,
        },
      ],
      createdAt: new Date(),
    };

    this.rooms.set(code, room);
    return room;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  getPublicRooms() {
    const list: any[] = [];
    for (const room of this.rooms.values()) {
      if (room.isPublic) {
        list.push({
          code: room.code,
          name: room.name,
          genre: room.genre,
          hostName: room.hostName,
          memberCount: room.members.size,
          currentTrack: room.currentTrack,
          isPlaying: room.isPlaying,
          createdAt: room.createdAt,
        });
      }
    }
    return list;
  }

  joinMember(
    code: string,
    member: { socketId: string; userId?: string; name: string; avatarUrl?: string }
  ): { room: Room; joinedMember: RoomMember } | null {
    const room = this.getRoom(code);
    if (!room) return null;

    const isHost = room.members.size === 0 || room.hostId === member.userId;
    const roomMember: RoomMember = {
      ...member,
      isHost,
    };

    if (isHost && member.userId) {
      room.hostId = member.userId;
      room.hostName = member.name;
    }

    room.members.set(member.socketId, roomMember);
    return { room, joinedMember: roomMember };
  }

  removeMember(socketId: string): { room: Room; leftMember?: RoomMember } | null {
    for (const room of this.rooms.values()) {
      if (room.members.has(socketId)) {
        const leftMember = room.members.get(socketId);
        room.members.delete(socketId);

        // If host left and other members exist, migrate host
        if (leftMember?.isHost && room.members.size > 0) {
          const nextMember = room.members.values().next().value;
          if (nextMember) {
            nextMember.isHost = true;
            room.hostId = nextMember.userId || nextMember.socketId;
            room.hostName = nextMember.name;
          }
        }

        return { room, leftMember };
      }
    }
    return null;
  }

  syncPlayback(
    code: string,
    data: { track?: any; isPlaying?: boolean; seekTime?: number }
  ): Room | null {
    const room = this.getRoom(code);
    if (!room) return null;

    if (data.track !== undefined) room.currentTrack = data.track;
    if (data.isPlaying !== undefined) room.isPlaying = data.isPlaying;
    if (data.seekTime !== undefined) room.seekTime = data.seekTime;
    room.lastSyncTimestamp = Date.now();

    return room;
  }

  addToQueue(code: string, track: any): Room | null {
    const room = this.getRoom(code);
    if (!room) return null;
    room.queue.push(track);
    return room;
  }

  removeFromQueue(code: string, index: number): Room | null {
    const room = this.getRoom(code);
    if (!room) return null;
    if (index >= 0 && index < room.queue.length) {
      room.queue.splice(index, 1);
    }
    return room;
  }

  addMessage(
    code: string,
    msg: { sender: string; avatarUrl?: string; text: string; isHost?: boolean }
  ): ChatMessage | null {
    const room = this.getRoom(code);
    if (!room) return null;

    const chatMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: msg.sender,
      avatarUrl: msg.avatarUrl,
      text: msg.text,
      timestamp: Date.now(),
      isHost: msg.isHost,
    };

    room.messages.push(chatMsg);
    if (room.messages.length > 100) {
      room.messages.shift();
    }
    return chatMsg;
  }

  serializeRoom(room: Room) {
    // Current computed seek position considering elapsed playback time
    let computedSeek = room.seekTime;
    if (room.isPlaying && room.lastSyncTimestamp) {
      const elapsed = (Date.now() - room.lastSyncTimestamp) / 1000;
      computedSeek += elapsed;
    }

    return {
      code: room.code,
      name: room.name,
      genre: room.genre,
      isPublic: room.isPublic,
      hostId: room.hostId,
      hostName: room.hostName,
      currentTrack: room.currentTrack,
      isPlaying: room.isPlaying,
      seekTime: Math.max(0, Math.floor(computedSeek)),
      members: Array.from(room.members.values()),
      queue: room.queue,
      messages: room.messages,
      createdAt: room.createdAt,
    };
  }
}
