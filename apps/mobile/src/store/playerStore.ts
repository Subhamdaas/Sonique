import { create } from 'zustand';
import { Audio } from 'expo-av';
import { Track } from '../types';
import { storage } from '../services/storage';
import { api } from '../services/api';

const STORAGE_PLAYBACK_KEY = 'sonique_mobile_playback_state';

interface PlayerState {
  current: Track | null;
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  isShuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  repeatMode: 'off' | 'all' | 'one';
  rpm: 33 | 45 | 78;
  pitch: number;
  isFullPlayerVisible: boolean;
  isQueueVisible: boolean;
  soundObject: Audio.Sound | null;

  // Transport Actions
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seek: (positionSeconds: number) => Promise<void>;
  next: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previous: () => Promise<void>;
  prevTrack: () => Promise<void>;
  setCurrent: (track: Track, newQueue?: Track[]) => Promise<void>;
  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setQueue: (tracks: Track[]) => void;

  // Controls & Modals
  setVolume: (vol: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setRpm: (rpm: 33 | 45 | 78) => void;
  setPitch: (pitch: number) => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  toggleQueue: () => void;
  hydrate: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  current: null,
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 1.0,
  isMuted: false,
  shuffle: false,
  isShuffle: false,
  repeat: 'off',
  repeatMode: 'off',
  rpm: 33,
  pitch: 0,
  isFullPlayerVisible: false,
  isQueueVisible: false,
  soundObject: null,

  play: async () => {
    const { soundObject, current } = get();
    if (!current) return;

    try {
      if (soundObject) {
        await soundObject.playAsync();
        set({ isPlaying: true });
      } else {
        await get().setCurrent(current);
      }
    } catch {
      set({ isPlaying: false });
    }
  },

  pause: async () => {
    const { soundObject } = get();
    try {
      if (soundObject) {
        await soundObject.pauseAsync();
      }
    } catch {}
    set({ isPlaying: false });
  },

  togglePlay: async () => {
    const { isPlaying } = get();
    if (isPlaying) {
      await get().pause();
    } else {
      await get().play();
    }
  },

  togglePlayPause: async () => {
    return get().togglePlay();
  },

  seek: async (positionSeconds: number) => {
    const { soundObject } = get();
    try {
      if (soundObject) {
        await soundObject.setPositionAsync(positionSeconds * 1000);
      }
      set({ progress: positionSeconds });
    } catch {}
  },

  next: async () => {
    const { queue, queueIndex, repeat, shuffle } = get();
    if (queue.length === 0) return;

    if (repeat === 'one') {
      await get().seek(0);
      await get().play();
      return;
    }

    let nextIndex = queueIndex + 1;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
      } else {
        await get().pause();
        return;
      }
    }

    const nTrack = queue[nextIndex];
    if (nTrack) {
      set({ queueIndex: nextIndex });
      await get().setCurrent(nTrack);
    }
  },

  nextTrack: async () => {
    return get().next();
  },

  previous: async () => {
    const { queue, queueIndex, progress } = get();
    if (queue.length === 0) return;

    if (progress > 3) {
      await get().seek(0);
      return;
    }

    const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    const pTrack = queue[prevIndex];
    if (pTrack) {
      set({ queueIndex: prevIndex });
      await get().setCurrent(pTrack);
    }
  },

  prevTrack: async () => {
    return get().previous();
  },

  setCurrent: async (track: Track, newQueue?: Track[]) => {
    const { soundObject: existingSound, volume, isMuted } = get();

    // Unload existing audio instance
    if (existingSound) {
      try {
        await existingSound.unloadAsync();
      } catch {}
    }

    let updatedQueue = newQueue || get().queue;
    if (newQueue && newQueue.length > 0) {
      updatedQueue = newQueue;
    } else if (!updatedQueue.some((t) => t.id === track.id)) {
      updatedQueue = [track, ...updatedQueue];
    }

    const targetIndex = updatedQueue.findIndex((t) => t.id === track.id);

    set({
      current: track,
      currentTrack: track,
      queue: updatedQueue,
      queueIndex: targetIndex >= 0 ? targetIndex : 0,
      duration: track.duration || 180,
      progress: 0,
      isPlaying: true,
      soundObject: null,
    });

    // Save playback position state
    storage.setItem(
      STORAGE_PLAYBACK_KEY,
      JSON.stringify({
        track,
        queue: updatedQueue.slice(0, 50),
        progress: 0,
      }),
    );

    // Record playback analytics telemetry
    api.recordPlaybackEvent(track.id).catch(() => {});

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        {
          shouldPlay: true,
          volume: isMuted ? 0 : volume,
          progressUpdateIntervalMillis: 500,
        },
        (status) => {
          if (status.isLoaded) {
            set({
              progress: status.positionMillis / 1000,
              duration: (status.durationMillis || (track.duration * 1000)) / 1000,
              isPlaying: status.isPlaying,
            });

            if (status.didJustFinish) {
              get().next();
            }
          }
        },
      );

      set({ soundObject: sound });
    } catch {
      set({ isPlaying: false });
    }
  },

  playTrack: async (track: Track, newQueue?: Track[]) => {
    return get().setCurrent(track, newQueue);
  },

  addToQueue: (track: Track) => {
    set((state) => ({
      queue: [...state.queue, track],
    }));
  },

  removeFromQueue: (trackId: string) => {
    set((state) => ({
      queue: state.queue.filter((t) => t.id !== trackId),
    }));
  },

  clearQueue: () => {
    set({ queue: [], queueIndex: 0 });
  },

  setQueue: (tracks: Track[]) => {
    set({ queue: tracks });
  },

  setVolume: async (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    const { soundObject, isMuted } = get();
    try {
      if (soundObject && !isMuted) {
        await soundObject.setVolumeAsync(clamped);
      }
    } catch {}
    set({ volume: clamped });
  },

  toggleMute: async () => {
    const { isMuted, volume, soundObject } = get();
    const nextMuted = !isMuted;
    try {
      if (soundObject) {
        await soundObject.setVolumeAsync(nextMuted ? 0 : volume);
      }
    } catch {}
    set({ isMuted: nextMuted });
  },

  toggleShuffle: () => {
    const nextVal = !get().shuffle;
    set({ shuffle: nextVal, isShuffle: nextVal });
  },

  toggleRepeat: () =>
    set((state) => {
      const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
      const nextIdx = (modes.indexOf(state.repeat) + 1) % modes.length;
      const nextVal = modes[nextIdx];
      return { repeat: nextVal, repeatMode: nextVal };
    }),

  setRpm: (rpm) => set({ rpm }),
  setPitch: (pitch) => set({ pitch }),

  openFullPlayer: () => set({ isFullPlayerVisible: true }),
  closeFullPlayer: () => set({ isFullPlayerVisible: false }),
  toggleQueue: () => set((state) => ({ isQueueVisible: !state.isQueueVisible })),

  hydrate: async () => {
    try {
      const stored = await storage.getItem(STORAGE_PLAYBACK_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.track) {
          set({
            current: parsed.track,
            currentTrack: parsed.track,
            queue: parsed.queue || [parsed.track],
            progress: parsed.progress || 0,
            duration: parsed.track.duration || 180,
            isPlaying: false,
          });
          return;
        }
      }

      // Default featured track initialization
      const featured = await api.getFeatured();
      if (featured?.featuredTracks && featured.featuredTracks.length > 0) {
        const first = featured.featuredTracks[0];
        set({
          current: first,
          currentTrack: first,
          queue: featured.featuredTracks,
          queueIndex: 0,
          duration: first.duration || 180,
          progress: 0,
          isPlaying: false,
        });
      }
    } catch {}
  },
}));
