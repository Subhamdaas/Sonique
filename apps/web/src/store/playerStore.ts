import { create } from 'zustand';
import type { Playable, Track } from '../types';
import { audioEngine } from '../services/audioEngine';
import { api } from '../services/api';

export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

const STORAGE_KEY = 'sonique_playback_state_v1';
const MAX_SESSION_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

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
  playbackSpeed: number;
  error: string | null;
  activePlaylistId: string | null;
  isAutoplayBlocked: boolean;
  isExpanded: boolean;
  sleepTimerMinutes: number | null;
  sleepTimerEndTime: number | null;
  smartQueueEnabled: boolean;
  smartQueueTracks: Playable[];
  crossfade: number;

  // Queue actions
  setCurrent: (item: Playable, newQueue?: Playable[]) => void;
  selectTrack: (item: Playable, shouldPlay?: boolean, playlistId?: string | null) => void;
  playPlaylist: (playlistId: string, track: Playable, playlistTracks?: Playable[]) => void;
  setQueue: (queue: Playable[]) => void;
  addToQueue: (items: Playable | Playable[]) => void;
  playNext: (item: Playable) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleSmartQueue: () => void;
  loadSmartQueueSuggestions: (trackId?: string) => Promise<void>;

  // Playback control actions
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  setCrossfade: (seconds: number) => void;
  toggleExpanded: () => void;
  resumeAutoplay: () => Promise<void>;

  // Persistence & Sync
  hydratePlayback: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
}

let lastRecordedTrackId: string | null = null;
let telemetryTimer: any = null;
let localSaveTimer: any = null;
let backendSyncTimer: any = null;
let sleepIntervalTimer: any = null;

// Helper: Save state to localStorage immediately or throttled
function persistToLocal(state: Partial<PlayerState>, immediate = false) {
  const doSave = () => {
    try {
      const payload = {
        current: state.current || null,
        progress: state.progress || 0,
        duration: state.duration || 0,
        queue: state.queue || [],
        volume: state.volume ?? 0.8,
        isMuted: state.isMuted ?? false,
        shuffle: state.shuffle ?? false,
        repeat: state.repeat ?? 'off',
        playbackSpeed: state.playbackSpeed ?? 1.0,
        isExpanded: state.isExpanded ?? false,
        smartQueueEnabled: state.smartQueueEnabled ?? true,
        crossfade: state.crossfade ?? 0,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save playback state to localStorage:', e);
    }
  };

  if (immediate) {
    if (localSaveTimer) clearTimeout(localSaveTimer);
    doSave();
  } else {
    if (!localSaveTimer) {
      localSaveTimer = setTimeout(() => {
        localSaveTimer = null;
        doSave();
      }, 1500); // 1.5s throttle while playing
    }
  }
}

// Helper: Sync to backend server for authenticated users
function syncToBackendServer(state: PlayerState) {
  if (backendSyncTimer) clearTimeout(backendSyncTimer);
  backendSyncTimer = setTimeout(async () => {
    try {
      const token = localStorage.getItem('sonique_access_token');
      if (!token) return;

      const queueIds = state.queue.map((q) => q.id);
      const queueIndex = state.current ? state.queue.findIndex((q) => q.id === state.current?.id) : 0;

      await api.updatePlaybackState({
        trackId: state.current?.id,
        positionSeconds: state.progress,
        queue: queueIds,
        queueIndex: Math.max(0, queueIndex),
        volume: state.volume,
        isMuted: state.isMuted,
        shuffle: state.shuffle,
        repeatMode: state.repeat,
      });
    } catch (err) {
      // Background sync failures should not disrupt user experience
    }
  }, 3000);
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Wire up audio engine events
  audioEngine.onTimeUpdate = (currentTime: number) => {
    const progress = Math.floor(currentTime);
    set({ progress });
    persistToLocal({ ...get(), progress }, false);

    // Sleep timer countdown check
    const { sleepTimerEndTime, pause, setSleepTimer } = get();
    if (sleepTimerEndTime && Date.now() >= sleepTimerEndTime) {
      pause();
      setSleepTimer(null);
    }
  };

  audioEngine.onDurationChange = (duration: number) => {
    if (!isNaN(duration) && duration > 0) {
      const dur = Math.floor(duration);
      set({ duration: dur });
      persistToLocal({ ...get(), duration: dur }, true);
    }
  };

  audioEngine.onEnded = () => {
    const { repeat, next, current, queue, smartQueueEnabled, smartQueueTracks, setCurrent } = get();
    if (repeat === 'one' && current) {
      audioEngine.seek(0);
      audioEngine.play(current.audioUrl, 0).catch(() => {});
    } else {
      const currentIndex = queue.findIndex((t) => t.id === current?.id);
      const isLastInManualQueue = currentIndex === -1 || currentIndex === queue.length - 1;

      if (isLastInManualQueue && smartQueueEnabled && smartQueueTracks.length > 0) {
        // Auto-advance into smart queue suggestions
        const nextSmartTrack = smartQueueTracks[0];
        const remainingSmart = smartQueueTracks.slice(1);
        set({
          smartQueueTracks: remainingSmart,
          queue: [...queue, nextSmartTrack],
        });
        setCurrent(nextSmartTrack, [...queue, nextSmartTrack]);
        // Trigger fetch for more suggestions
        get().loadSmartQueueSuggestions(nextSmartTrack.id);
      } else {
        next();
      }
    }
  };

  audioEngine.onPlayStateChange = (isPlaying: boolean) => {
    set({ isPlaying, isAutoplayBlocked: false });
    persistToLocal(get(), true);
    syncToBackendServer(get());
  };

  // Attach global page unload & visibility listeners for instant state persistence
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      persistToLocal(get(), true);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        persistToLocal(get(), true);
      }
    });
  }

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
    playbackSpeed: 1.0,
    error: null,
    activePlaylistId: null,
    isAutoplayBlocked: false,
    isExpanded: false,
    sleepTimerMinutes: null,
    sleepTimerEndTime: null,
    smartQueueEnabled: true,
    smartQueueTracks: [],
    crossfade: 0,

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
        isAutoplayBlocked: false,
        error: null,
      });

      if (item.audioUrl) {
        audioEngine.play(item.audioUrl, 0).catch((err: any) => {
          if (err?.name === 'NotAllowedError') {
            set({ isPlaying: false, isAutoplayBlocked: true });
          }
        });
      }

      persistToLocal(get(), true);
      syncToBackendServer(get());
      get().loadSmartQueueSuggestions(item.id);

      // Record playback event to backend API telemetry
      if (item.id && item.id !== lastRecordedTrackId) {
        lastRecordedTrackId = item.id;
        if (telemetryTimer) clearTimeout(telemetryTimer);
        telemetryTimer = setTimeout(() => {
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
        isAutoplayBlocked: false,
      });

      if (item.audioUrl) {
        if (shouldPlay) {
          audioEngine.play(item.audioUrl, 0).catch((err: any) => {
            if (err?.name === 'NotAllowedError') {
              set({ isPlaying: false, isAutoplayBlocked: true });
            }
          });
        } else {
          audioEngine.loadTrack(item.audioUrl, 0);
        }
      }

      persistToLocal(get(), true);
      syncToBackendServer(get());
      get().loadSmartQueueSuggestions(item.id);
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
        isAutoplayBlocked: false,
      });

      if (track.audioUrl) {
        audioEngine.play(track.audioUrl, 0).catch((err: any) => {
          if (err?.name === 'NotAllowedError') {
            set({ isPlaying: false, isAutoplayBlocked: true });
          }
        });
      }

      persistToLocal(get(), true);
      syncToBackendServer(get());
      get().loadSmartQueueSuggestions(track.id);
    },

    setQueue: (queue: Playable[]) => {
      set({ queue });
      persistToLocal(get(), true);
      syncToBackendServer(get());
    },

    addToQueue: (items: Playable | Playable[]) => {
      const toAdd = Array.isArray(items) ? items : [items];
      if (toAdd.length === 0) return;

      const { queue, current, setCurrent } = get();
      const updated = [...queue];

      for (const item of toAdd) {
        if (!updated.some((t) => t.id === item.id)) {
          updated.push(item);
        }
      }

      set({ queue: updated });
      if (!current && updated.length > 0) {
        setCurrent(updated[0], updated);
      } else {
        persistToLocal(get(), true);
        syncToBackendServer(get());
      }
    },

    playNext: (item: Playable) => {
      if (!item) return;
      const { queue, current, setCurrent } = get();
      if (!current) {
        setCurrent(item, [item]);
        return;
      }

      const filtered = queue.filter((t) => t.id !== item.id);
      const currentIndex = filtered.findIndex((t) => t.id === current.id);
      const insertAt = currentIndex >= 0 ? currentIndex + 1 : 0;
      filtered.splice(insertAt, 0, item);

      set({ queue: filtered });
      persistToLocal(get(), true);
      syncToBackendServer(get());
    },

    reorderQueue: (startIndex: number, endIndex: number) => {
      const { queue } = get();
      if (
        startIndex < 0 ||
        startIndex >= queue.length ||
        endIndex < 0 ||
        endIndex >= queue.length
      ) {
        return;
      }

      const next = [...queue];
      const [removed] = next.splice(startIndex, 1);
      next.splice(endIndex, 0, removed);

      set({ queue: next });
      persistToLocal(get(), true);
      syncToBackendServer(get());
    },

    clearQueue: () => {
      const { current } = get();
      set({ queue: current ? [current] : [] });
      persistToLocal(get(), true);
      syncToBackendServer(get());
    },

    removeFromQueue: (index: number) => {
      const { queue } = get();
      if (index >= 0 && index < queue.length) {
        const next = [...queue];
        next.splice(index, 1);
        set({ queue: next });
        persistToLocal(get(), true);
        syncToBackendServer(get());
      }
    },

    toggleSmartQueue: () => {
      set((s) => ({ smartQueueEnabled: !s.smartQueueEnabled }));
      persistToLocal(get(), true);
    },

    loadSmartQueueSuggestions: async (trackId?: string) => {
      const id = trackId || get().current?.id;
      if (!id) return;
      try {
        const similar = await api.getSimilarTracks(id);
        if (similar && similar.length > 0) {
          const { queue, current } = get();
          const existingIds = new Set(queue.map((t) => t.id));
          if (current) existingIds.add(current.id);
          const filtered = similar.filter((t: any) => !existingIds.has(t.id));
          set({ smartQueueTracks: filtered });
        }
      } catch (e) {}
    },

    play: async () => {
      const { current, progress } = get();
      if (current && current.audioUrl) {
        try {
          await audioEngine.play(current.audioUrl, progress);
          set({ isPlaying: true, isAutoplayBlocked: false });
        } catch (err: any) {
          if (err?.name === 'NotAllowedError') {
            set({ isPlaying: false, isAutoplayBlocked: true });
          }
        }
        persistToLocal(get(), true);
        syncToBackendServer(get());
      }
    },

    resumeAutoplay: async () => {
      const { current, progress } = get();
      if (current && current.audioUrl) {
        try {
          await audioEngine.play(current.audioUrl, progress);
          set({ isPlaying: true, isAutoplayBlocked: false });
        } catch (e) {}
        persistToLocal(get(), true);
        syncToBackendServer(get());
      }
    },

    pause: () => {
      audioEngine.pause();
      set({ isPlaying: false });
      persistToLocal(get(), true);
      syncToBackendServer(get());
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
        const otherTracks = queue.filter((t) => t.id !== current?.id);
        const randomTrack = otherTracks[Math.floor(Math.random() * otherTracks.length)] || queue[0];
        setCurrent(randomTrack, queue);
        return;
      }

      const currentIndex = queue.findIndex((t) => t.id === current?.id);
      if (currentIndex === -1 || currentIndex === queue.length - 1) {
        if (repeat === 'all' && queue.length > 0) {
          setCurrent(queue[0], queue);
        } else {
          audioEngine.pause();
          set({ isPlaying: false, progress: 0 });
          persistToLocal(get(), true);
          syncToBackendServer(get());
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
      persistToLocal({ ...get(), progress: Math.floor(clamped) }, true);
      syncToBackendServer({ ...get(), progress: Math.floor(clamped) });
    },

    setVolume: (vol: number) => {
      const clamped = Math.max(0, Math.min(1, vol));
      audioEngine.setVolume(clamped);
      set({ volume: clamped, isMuted: clamped === 0 });
      persistToLocal(get(), true);
      syncToBackendServer(get());
    },

    toggleMute: () => {
      const { isMuted, volume } = get();
      if (isMuted) {
        const restored = volume > 0 ? volume : 0.8;
        audioEngine.setVolume(restored);
        set({ isMuted: false, volume: restored });
      } else {
        audioEngine.setVolume(0);
        set({ isMuted: true });
      }
      persistToLocal(get(), true);
      syncToBackendServer(get());
    },

    toggleShuffle: () => {
      set((state) => ({ shuffle: !state.shuffle }));
      persistToLocal(get(), true);
      syncToBackendServer(get());
    },

    cycleRepeat: () => {
      const { repeat } = get();
      const order: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
      const nextIndex = (order.indexOf(repeat) + 1) % order.length;
      set({ repeat: order[nextIndex] });
      persistToLocal(get(), true);
      syncToBackendServer(get());
    },

    setPlaybackSpeed: (speed: number) => {
      const clamped = Math.max(0.5, Math.min(2.0, speed));
      audioEngine.setPlaybackRate(clamped);
      set({ playbackSpeed: clamped });
      persistToLocal(get(), true);
    },

    setSleepTimer: (minutes: number | null) => {
      if (sleepIntervalTimer) {
        clearInterval(sleepIntervalTimer);
        sleepIntervalTimer = null;
      }

      if (!minutes) {
        set({ sleepTimerMinutes: null, sleepTimerEndTime: null });
        return;
      }

      const endTime = Date.now() + minutes * 60 * 1000;
      set({ sleepTimerMinutes: minutes, sleepTimerEndTime: endTime });

      sleepIntervalTimer = setInterval(() => {
        const { sleepTimerEndTime, pause, setSleepTimer } = get();
        if (sleepTimerEndTime && Date.now() >= sleepTimerEndTime) {
          pause();
          setSleepTimer(null);
        }
      }, 5000);
    },

    setCrossfade: (seconds: number) => {
      const clamped = Math.max(0, Math.min(12, seconds));
      set({ crossfade: clamped });
      persistToLocal(get(), true);
    },

    toggleExpanded: () => {
      set((s) => ({ isExpanded: !s.isExpanded }));
      persistToLocal(get(), true);
    },

    hydratePlayback: async () => {
      // 1. Local state restoration for instant UI render
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          const age = Date.now() - (saved.savedAt || 0);

          if (age < MAX_SESSION_AGE_MS && saved.current) {
            let restoredProgress = saved.progress || 0;
            const restoredDuration = saved.duration || saved.current.duration || 0;

            // If user left near the end (>95% or <3s remaining), restart track from 0
            if (restoredDuration > 0 && (restoredProgress >= restoredDuration * 0.95 || restoredDuration - restoredProgress < 3)) {
              restoredProgress = 0;
            }

            const speed = saved.playbackSpeed || 1.0;
            const vol = saved.volume !== undefined ? saved.volume : 0.8;
            const isMuted = Boolean(saved.isMuted);

            set({
              current: saved.current,
              queue: saved.queue || [saved.current],
              progress: restoredProgress,
              duration: restoredDuration,
              volume: vol,
              isMuted,
              shuffle: Boolean(saved.shuffle),
              repeat: saved.repeat || 'off',
              playbackSpeed: speed,
              isExpanded: Boolean(saved.isExpanded),
              smartQueueEnabled: saved.smartQueueEnabled !== false,
              isPlaying: false, // Default paused until user gesture or autoplay verified
              isAutoplayBlocked: false,
            });

            // Pre-load audio track at exact restored progress
            if (saved.current.audioUrl) {
              audioEngine.loadTrack(saved.current.audioUrl, restoredProgress);
              audioEngine.setVolume(isMuted ? 0 : vol);
              audioEngine.setPlaybackRate(speed);
            }
          }
        }
      } catch (err) {
        console.warn('Playback local hydration error:', err);
      }

      // 2. Synchronize with backend if user is authenticated
      await get().syncWithBackend();
    },

    syncWithBackend: async () => {
      try {
        const token = localStorage.getItem('sonique_access_token');
        if (!token) return;

        const serverState = await api.getPlaybackState();
        if (!serverState || !serverState.track) return;

        // If local state is empty or older than server state, adopt server state
        const { current, progress } = get();
        if (!current) {
          const restoredTrack: Playable = serverState.track;
          const restoredProgress = Math.floor(serverState.positionSeconds || 0);
          set({
            current: restoredTrack,
            progress: restoredProgress,
            duration: restoredTrack.duration || 0,
            volume: serverState.volume ?? 0.8,
            isMuted: serverState.isMuted ?? false,
            shuffle: serverState.shuffle ?? false,
            repeat: serverState.repeatMode || 'off',
          });

          if (restoredTrack.audioUrl) {
            audioEngine.loadTrack(restoredTrack.audioUrl, restoredProgress);
            audioEngine.setVolume(serverState.isMuted ? 0 : (serverState.volume ?? 0.8));
          }
        }
      } catch (err) {
        // Backend sync failures (e.g. offline or unauthenticated) are silently ignored
      }
    },
  };
});
