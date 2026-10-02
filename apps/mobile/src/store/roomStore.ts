import { create } from 'zustand';
import { getSocket, disconnectSocket } from '../services/socket';
import { usePlayerStore } from './playerStore';
import { api } from '../services/api';
import { ChatMessage, Room, RoomMember, Track } from '../types';

interface RoomState {
  currentRoom: Room | null;
  activeRooms: Room[];
  isConnected: boolean;
  isHost: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  members: RoomMember[];
  reactions: { id: string; emoji: string; userName: string }[];
  error: string | null;

  fetchRooms: () => Promise<void>;
  createRoom: (name: string, isPublic?: boolean) => Promise<Room>;
  joinRoom: (roomCode: string, user?: { id: string; name: string; avatarUrl?: string }) => void;
  leaveRoom: () => void;
  sendChat: (content: string) => void;
  sendMessage: (content: string) => void;
  sendReaction: (emoji: string) => void;
  syncPlayback: (action: 'play' | 'pause' | 'change_track', track?: Track, position?: number) => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  currentRoom: null,
  activeRooms: [],
  isConnected: false,
  isHost: false,
  isLoading: false,
  messages: [],
  members: [],
  reactions: [],
  error: null,

  fetchRooms: async () => {
    set({ isLoading: true });
    try {
      const rooms = await api.getRooms();
      set({ activeRooms: rooms || [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createRoom: async (name: string, isPublic = true) => {
    try {
      const room = await api.createRoom({ name, isPublic });
      set((state) => ({
        activeRooms: [room, ...state.activeRooms],
        currentRoom: room,
      }));
      return room;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create room');
    }
  },

  joinRoom: (roomCode, user) => {
    const socket = getSocket();

    socket.on('connect', () => {
      set({ isConnected: true, error: null });
      socket.emit('joinRoom', { roomCode, user });
    });

    socket.on('roomState', (room: Room) => {
      const isHost = user?.id ? room.hostId === user.id : false;
      set({
        currentRoom: room,
        isHost,
        members: room.members || [],
        messages: room.chat || [],
      });

      // Synchronize player with room state if listener
      if (!isHost && room.currentTrack) {
        usePlayerStore.getState().setCurrent(room.currentTrack);
        if (room.playbackPosition) {
          usePlayerStore.getState().seek(room.playbackPosition);
        }
        if (room.isPlaying) {
          usePlayerStore.getState().play();
        } else {
          usePlayerStore.getState().pause();
        }
      }
    });

    socket.on('userJoined', (member: RoomMember) => {
      set((state) => ({
        members: [...state.members.filter((m) => m.id !== member.id), member],
      }));
    });

    socket.on('userLeft', ({ userId }: { userId: string }) => {
      set((state) => ({
        members: state.members.filter((m) => m.id !== userId),
      }));
    });

    socket.on(
      'playbackUpdated',
      ({
        action,
        track,
        position,
      }: {
        action: string;
        track?: Track;
        position?: number;
      }) => {
        const { isHost } = get();
        if (isHost) return; // Host controls playback

        const player = usePlayerStore.getState();
        if (action === 'change_track' && track) {
          player.setCurrent(track);
        } else if (action === 'play') {
          player.play();
        } else if (action === 'pause') {
          player.pause();
        }
        if (typeof position === 'number') {
          player.seek(position);
        }
      },
    );

    socket.on('chatMessage', (message: ChatMessage) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    });

    socket.on('reactionReceived', (reaction: { id: string; emoji: string; userName: string }) => {
      set((state) => ({
        reactions: [...state.reactions.slice(-10), reaction],
      }));
    });

    socket.on('error', ({ message }: { message: string }) => {
      set({ error: message });
    });

    if (socket.connected) {
      socket.emit('joinRoom', { roomCode, user });
    }
  },

  leaveRoom: () => {
    const socket = getSocket();
    const { currentRoom } = get();
    if (currentRoom) {
      socket.emit('leaveRoom', { roomId: currentRoom.id });
    }
    set({
      currentRoom: null,
      isHost: false,
      messages: [],
      members: [],
      reactions: [],
      error: null,
    });
    disconnectSocket();
  },

  sendChat: (content: string) => {
    const socket = getSocket();
    const { currentRoom } = get();
    if (currentRoom && content.trim()) {
      socket.emit('chatMessage', { roomId: currentRoom.id, content: content.trim() });
    }
  },

  sendMessage: (content: string) => {
    get().sendChat(content);
  },

  sendReaction: (emoji: string) => {
    const socket = getSocket();
    const { currentRoom } = get();
    if (currentRoom) {
      socket.emit('sendReaction', { roomId: currentRoom.id, emoji });
    }
  },

  syncPlayback: (action, track, position) => {
    const { isHost, currentRoom } = get();
    if (!isHost || !currentRoom) return;

    const socket = getSocket();
    socket.emit('syncPlayback', {
      roomId: currentRoom.id,
      action,
      track,
      position,
    });
  },
}));
