import { create } from 'zustand';
import type { Playable, Track } from '../types';
import { audioEngine } from '../services/audioEngine';
import { api } from '../services/api';

export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export interface PlayerState {
  current: Playable | null;
  queue: Playable[];
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  error: string | null;
  activePlaylistId: string | null;

  setCurrent: (item: Playable, newQueue?: Playable[]) => void;
  selectTrack: (item: Playable, shouldPlay?: boolean, playlistId?: string | null) => void;
  playPlaylist: (playlistId: string, track: Playable, playlistTracks?: Playable[]) => void;
  setQueue: (queue: Playable[]) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  clearQueue: () => void;
  removeFromQueue: (index: number) => void;
}

let lastRecordedTrackId: string | null = null;
let playbackTimer: any = null;

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Wire up audio engine events
  audioEngine.onTimeUpdate = (currentTime: number) => {
    set({ progress: Math.floor(currentTime) });
  };

  audioEngine.onDurationChange = (duration: number) => {
    if (!isNaN(duration) && duration > 0) {
      set({ duration: Math.floor(duration) });
    }
  };

  audioEngine.onEnded = () => {
    const { repeat, next, current } = get();
    if (repeat === 'one' && current) {
      audioEngine.seek(0);
      audioEngine.play(current.audioUrl, 0);
    } else {
      next();
    }
  };

  audioEngine.onPlayStateChange = (isPlaying: boolean) => {
    set({ isPlaying });
  };

  return {
    current: null,
    queue: [],
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    shuffle: false,
    repeat: 'off',
    error: null,
    activePlaylistId: null,

    setCurrent: (item: Playable, newQueue?: Playable[]) => {
      if (!item) return;

      const currentQueue = newQueue || (get().queue.length ? get().queue : [item]);
      const inQueue = currentQueue.some((q) => q.id === item.id);
      const updatedQueue = inQueue ? currentQueue : [...currentQueue, item];

      set({
        current: item,
        queue: updatedQueue,
        progress: 0,
        duration: item.duration || 0,
        isPlaying: true,
        error: null,
      });

      if (item.audioUrl) {
        audioEngine.play(item.audioUrl, 0);
      }

      // Record playback event to backend API telemetry
      if (item.id && item.id !== lastRecordedTrackId) {
        lastRecordedTrackId = item.id;
        if (playbackTimer) clearTimeout(playbackTimer);
        // Record event after 5 seconds of active playback
        playbackTimer = setTimeout(() => {
          api.recordPlaybackEvent(item.id).catch(() => {});
        }, 5000);
      }
    },

    selectTrack: (item: Playable, shouldPlay = true, playlistId = null) => {
      if (!item) return;
      const { queue } = get();
      const inQueue = queue.some((q) => q.id === item.id);
      const updatedQueue = inQueue ? queue : [...queue, item];

      set({
        current: item,
        queue: updatedQueue,
        activePlaylistId: playlistId,
        progress: 0,
        duration: item.duration || 0,
        isPlaying: shouldPlay,
      });

      if (item.audioUrl) {
        if (shouldPlay) {
          audioEngine.play(item.audioUrl, 0);
        } else {
          audioEngine.loadTrack(item.audioUrl, 0);
        }
      }
    },

    playPlaylist: (playlistId: string, track: Playable, playlistTracks?: Playable[]) => {
      const queueTracks = playlistTracks && playlistTracks.length > 0 ? playlistTracks : [track];
      set({
        current: track,
        queue: queueTracks,
        activePlaylistId: playlistId,
        progress: 0,
        duration: track.duration || 0,
        isPlaying: true,
      });

      if (track.audioUrl) {
        audioEngine.play(track.audioUrl, 0);
      }
    },

    setQueue: (queue: Playable[]) => {
      set({ queue });
    },

    clearQueue: () => {
      set({ queue: [] });
    },

    removeFromQueue: (index: number) => {
      const { queue } = get();
      if (index >= 0 && index < queue.length) {
        const next = [...queue];
        next.splice(index, 1);
        set({ queue: next });
      }
    },

    play: () => {
      const { current, progress } = get();
      if (current && current.audioUrl) {
        audioEngine.play(current.audioUrl, progress);
        set({ isPlaying: true });
      }
    },

    pause: () => {
      audioEngine.pause();
      set({ isPlaying: false });
    },

    toggle: () => {
      const { isPlaying, current, play, pause } = get();
      if (!current) return;
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    },

    next: () => {
      const { queue, current, shuffle, repeat, setCurrent } = get();
      if (queue.length === 0) return;

      if (shuffle && queue.length > 1) {
        const randomIndex = Math.floor(Math.random() * queue.length);
        setCurrent(queue[randomIndex], queue);
        return;
      }

      const currentIndex = queue.findIndex((t) => t.id === current?.id);
      if (currentIndex === -1 || currentIndex === queue.length - 1) {
        if (repeat === 'all' && queue.length > 0) {
          setCurrent(queue[0], queue);
        } else {
          audioEngine.pause();
          set({ isPlaying: false, progress: 0 });
        }
      } else {
        setCurrent(queue[currentIndex + 1], queue);
      }
    },

    previous: () => {
      const { queue, current, progress, seek, setCurrent } = get();
      if (progress > 3) {
        seek(0);
        return;
      }

      if (queue.length === 0) return;
      const currentIndex = queue.findIndex((t) => t.id === current?.id);
      if (currentIndex > 0) {
        setCurrent(queue[currentIndex - 1], queue);
      } else {
        seek(0);
      }
    },

    seek: (seconds: number) => {
      const { duration } = get();
      const clamped = Math.max(0, Math.min(seconds, duration || seconds));
      audioEngine.seek(clamped);
      set({ progress: Math.floor(clamped) });
    },

    setVolume: (vol: number) => {
      const clamped = Math.max(0, Math.min(1, vol));
      audioEngine.setVolume(clamped);
      set({ volume: clamped, isMuted: clamped === 0 });
    },

    toggleMute: () => {
      const { isMuted, volume } = get();
      if (isMuted) {
        audioEngine.setVolume(volume || 0.8);
        set({ isMuted: false });
      } else {
        audioEngine.setVolume(0);
        set({ isMuted: true });
      }
    },

    toggleShuffle: () => {
      set((state) => ({ shuffle: !state.shuffle }));
    },

    cycleRepeat: () => {
      const { repeat } = get();
      const order: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
      const nextIndex = (order.indexOf(repeat) + 1) % order.length;
      set({ repeat: order[nextIndex] });
    },
  };
});
