import { create } from 'zustand';
import type { Playable, Track } from '../types';
import { initialSongs } from '../data/mockData';
import { audioEngine } from '../services/audioEngine';

interface PlayerState {
  current: Playable | null;
  queue: Playable[];
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  error: string | null;
  activePlaylistId: string | null;

  selectTrack: (item: Playable, shouldPlay?: boolean, playlistId?: string | null) => void;
  setCurrent: (item: Playable, newQueue?: Playable[]) => void;
  playPlaylist: (playlistId: string, track: Playable, playlistTracks?: Playable[]) => void;
  setQueue: (queue: Playable[]) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  const defaultTrack = initialSongs[0];
  if (defaultTrack && defaultTrack.audioUrl) {
    audioEngine.loadTrack(defaultTrack.audioUrl, 0);
  }

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
    current: defaultTrack,
    queue: initialSongs,
    isPlaying: false,
    progress: 0,
    duration: defaultTrack.duration || 215,
    volume: 0.8,
    shuffle: false,
    repeat: 'off',
    error: null,
    activePlaylistId: null,

    selectTrack: (item: Playable, shouldPlay?: boolean, playlistId?: string | null) => {
      const willPlay = shouldPlay !== undefined ? shouldPlay : true;
      const currentQueue = get().queue.length > 0 ? get().queue : initialSongs;
      const updatedQueue = currentQueue.some((q) => q.id === item.id)
        ? currentQueue
        : [...currentQueue, item];

      set({
        current: item,
        queue: updatedQueue,
        progress: 0,
        duration: item.duration || 215,
        isPlaying: willPlay,
        activePlaylistId: playlistId !== undefined ? playlistId : get().activePlaylistId,
      });

      if (item.audioUrl) {
        if (willPlay) {
          audioEngine.play(item.audioUrl, 0);
        } else {
          audioEngine.loadTrack(item.audioUrl, 0);
        }
      }
    },

    setCurrent: (item: Playable, newQueue?: Playable[]) => {
      if (newQueue && newQueue.length > 0) {
        set({ queue: newQueue });
      }
      get().selectTrack(item, true, null);
    },

    playPlaylist: (playlistId: string, track: Playable, playlistTracks?: Playable[]) => {
      if (playlistTracks && playlistTracks.length > 0) {
        set({ queue: playlistTracks });
      }
      get().selectTrack(track, true, playlistId);
    },

    setQueue: (queue: Playable[]) => set({ queue }),

    play: () => {
      const { current, progress } = get();
      if (!current) return;
      if (current.audioUrl) {
        audioEngine.play(current.audioUrl, progress || 0);
      }
      set({ isPlaying: true });
    },

    pause: () => {
      audioEngine.pause();
      set({ isPlaying: false });
    },

    toggle: () => {
      const { isPlaying, play, pause } = get();
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    },

    next: () => {
      const { current, queue, shuffle, selectTrack } = get();
      const pool = queue.length > 0 ? queue : initialSongs;
      if (!pool.length) return;

      if (shuffle && pool.length > 1) {
        const remaining = pool.filter((x) => x.id !== current?.id);
        const randomIndex = Math.floor(Math.random() * remaining.length);
        selectTrack(remaining[randomIndex], true);
        return;
      }

      const currentIndex = current ? pool.findIndex((x) => x.id === current.id) : -1;
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % pool.length;
      selectTrack(pool[nextIndex], true);
    },

    previous: () => {
      const { current, queue, selectTrack } = get();
      const pool = queue.length > 0 ? queue : initialSongs;
      if (!pool.length) return;

      const currentIndex = current ? pool.findIndex((x) => x.id === current.id) : -1;
      const prevIndex = currentIndex <= 0 ? pool.length - 1 : currentIndex - 1;
      selectTrack(pool[prevIndex], true);
    },

    seek: (seconds: number) => {
      audioEngine.seek(seconds);
      set({ progress: seconds });
    },

    setVolume: (volume: number) => {
      const clamped = Math.max(0, Math.min(1, volume));
      audioEngine.setVolume(clamped);
      set({ volume: clamped });
    },

    toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

    cycleRepeat: () =>
      set((s) => ({
        repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off',
      })),
  };
});
