import { create } from 'zustand';
import { getSocket } from '../services/socket';
import { usePlayerStore } from './playerStore';
import { Track } from '../types';

export interface RoomMember {
  socketId: string;
  userId?: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
}

export interface RoomMessage {
  id: string;
  sender: string;
  avatarUrl?: string;
  text: string;
  timestamp: number;
  isHost?: boolean;
}

export interface RoomDetails {
  code: string;
  name: string;
  genre: string;
  isPublic: boolean;
  hostId: string;
  hostName: string;
  currentTrack: Track | null;
  isPlaying: boolean;
  seekTime: number;
  members: RoomMember[];
  queue: Track[];
  messages: RoomMessage[];
}

interface RoomState {
  activeRoom: RoomDetails | null;
  isHost: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  joinRoom: (code: string, user?: { id?: string; name: string; avatarUrl?: string }) => Promise<void>;
  leaveRoom: () => void;
  broadcastPlayback: (track: Track, isPlaying: boolean, seekTime: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  sendMessage: (text: string, user?: { name: string; avatarUrl?: string }) => void;
}

export const useRoomStore = create<RoomState>((set, get) => {
  return {
    activeRoom: null,
    isHost: false,
    isConnected: false,
    isLoading: false,
    error: null,

    joinRoom: async (code: string, user) => {
      set({ isLoading: true, error: null });
      const socket = getSocket();

      // Clean up previous listeners if any
      socket.off('room_member_joined');
      socket.off('room_member_left');
      socket.off('room_playback_synced');
      socket.off('room_queue_updated');
      socket.off('room_message_received');

      return new Promise<void>((resolve, reject) => {
        socket.emit(
          'join_room',
          {
            code,
            userId: user?.id,
            name: user?.name || 'Guest Listener',
            avatarUrl: user?.avatarUrl,
          },
          (res: any) => {
            if (res?.status === 'ok') {
              const room = res.room;
              const isHost = room.hostId === user?.id || (room.members.length > 0 && room.members[0].socketId === socket.id);

              set({
                activeRoom: room,
                isHost,
                isConnected: true,
                isLoading: false,
              });

              // Synchronize local audio player with room's initial track
              if (room.currentTrack) {
                const player = usePlayerStore.getState();
                player.setCurrent(room.currentTrack);
                if (room.seekTime > 0) {
                  player.seek(room.seekTime);
                }
                if (!room.isPlaying) {
                  player.pause();
                }
              }

              // Register Live Socket Listeners
              socket.on('room_member_joined', (data: { member: RoomMember; members: RoomMember[] }) => {
                const current = get().activeRoom;
                if (current) {
                  set({
                    activeRoom: {
                      ...current,
                      members: data.members,
                    },
                  });
                }
              });

              socket.on('room_member_left', (data: { member?: RoomMember; members: RoomMember[]; hostId: string; hostName: string }) => {
                const current = get().activeRoom;
                if (current) {
                  const isNowHost = data.hostId === user?.id || (data.members.length > 0 && data.members[0].socketId === socket.id);
                  set({
                    isHost: isNowHost,
                    activeRoom: {
                      ...current,
                      hostId: data.hostId,
                      hostName: data.hostName,
                      members: data.members,
                    },
                  });
                }
              });

              socket.on('room_playback_synced', (data: { track: Track; isPlaying: boolean; seekTime: number }) => {
                const player = usePlayerStore.getState();
                const currentRoom = get().activeRoom;

                if (currentRoom) {
                  set({
                    activeRoom: {
                      ...currentRoom,
                      currentTrack: data.track,
                      isPlaying: data.isPlaying,
                      seekTime: data.seekTime,
                    },
                  });
                }

                // If non-host, sync audio playback smoothly
                if (!get().isHost && data.track) {
                  if (player.current?.id !== data.track.id) {
                    player.setCurrent(data.track);
                  }
                  if (Math.abs(player.progress - data.seekTime) > 2) {
                    player.seek(data.seekTime);
                  }
                  if (data.isPlaying && !player.isPlaying) {
                    player.play();
                  } else if (!data.isPlaying && player.isPlaying) {
                    player.pause();
                  }
                }
              });

              socket.on('room_queue_updated', (data: { queue: Track[] }) => {
                const current = get().activeRoom;
                if (current) {
                  set({
                    activeRoom: {
                      ...current,
                      queue: data.queue,
                    },
                  });
                }
              });

              socket.on('room_message_received', (data: { message: RoomMessage }) => {
                const current = get().activeRoom;
                if (current) {
                  set({
                    activeRoom: {
                      ...current,
                      messages: [...current.messages, data.message],
                    },
                  });
                }
              });

              resolve();
            } else {
              set({ isLoading: false, error: res?.message || 'Failed to join room' });
              reject(new Error(res?.message || 'Failed to join room'));
            }
          }
        );
      });
    },

    leaveRoom: () => {
      const socket = getSocket();
      socket.off('room_member_joined');
      socket.off('room_member_left');
      socket.off('room_playback_synced');
      socket.off('room_queue_updated');
      socket.off('room_message_received');
      set({ activeRoom: null, isHost: false, isConnected: false });
    },

    broadcastPlayback: (track: Track, isPlaying: boolean, seekTime: number) => {
      const { activeRoom, isHost } = get();
      if (!activeRoom || !isHost) return;

      const socket = getSocket();
      socket.emit('sync_playback', {
        code: activeRoom.code,
        track,
        isPlaying,
        seekTime,
      });

      set({
        activeRoom: {
          ...activeRoom,
          currentTrack: track,
          isPlaying,
          seekTime,
        },
      });
    },

    addToQueue: (track: Track) => {
      const { activeRoom } = get();
      if (!activeRoom) return;

      const socket = getSocket();
      socket.emit('queue_add', {
        code: activeRoom.code,
        track,
      });
    },

    removeFromQueue: (index: number) => {
      const { activeRoom } = get();
      if (!activeRoom) return;

      const socket = getSocket();
      socket.emit('queue_remove', {
        code: activeRoom.code,
        index,
      });
    },

    sendMessage: (text: string, user) => {
      const { activeRoom, isHost } = get();
      if (!activeRoom || !text.trim()) return;

      const socket = getSocket();
      socket.emit('send_message', {
        code: activeRoom.code,
        sender: user?.name || 'Guest',
        avatarUrl: user?.avatarUrl,
        text: text.trim(),
        isHost,
      });
    },
  };
});
