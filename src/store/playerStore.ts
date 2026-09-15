import { create } from 'zustand';
import type { Playable, Track } from '../types';
import { api } from '../services/api';

// Shared HTML5 Audio element instance
let globalAudio: HTMLAudioElement | null = null;
let telemetryTimer: number | null = null;
let ytPlayer: any = null;
let ytTimer: number | null = null;

function getAudio(): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio();
  }
  return globalAudio;
}

export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : null;
}

// Dynamically load YouTube Iframe API
let ytReadyPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (ytReadyPromise) return ytReadyPromise;
  if ((window as any).YT && (window as any).YT.Player) {
    ytReadyPromise = Promise.resolve();
    return ytReadyPromise;
  }

  ytReadyPromise = new Promise((resolve) => {
    const existing = document.getElementById('youtube-iframe-api');
    if (!existing) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
    (window as any).onYouTubeIframeAPIReady = () => {
      resolve();
    };
    // Fallback if already ready
    setTimeout(() => {
      if ((window as any).YT && (window as any).YT.Player) {
        resolve();
      }
    }, 1500);
  });
  return ytReadyPromise;
}

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
  isYouTube: boolean;
  youtubeId: string | null;

  setCurrent: (item: Playable, newQueue?: Playable[]) => void;
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
  tick: () => void;
  syncYouTubeProgress: (currentTime: number, duration: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  const audio = getAudio();

  // Setup HTML5 audio event listeners
  audio.ontimeupdate = () => {
    if (!get().isYouTube) {
      set({ progress: Math.floor(audio.currentTime) });
    }
  };

  audio.onloadedmetadata = () => {
    if (!get().isYouTube) {
      set({ duration: Math.floor(audio.duration) || get().current?.duration || 0 });
    }
  };

  audio.onended = () => {
    const { repeat, next } = get();
    if (repeat === 'one') {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else {
      next();
    }
  };

  audio.onerror = () => {
    if (!get().isYouTube) {
      set({ error: 'Audio stream preview unavailable' });
    }
  };

  return {
    current: null,
    queue: [],
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 0.8,
    shuffle: false,
    repeat: 'off',
    error: null,
    isYouTube: false,
    youtubeId: null,

    syncYouTubeProgress: (currentTime: number, duration: number) => {
      set({
        progress: Math.floor(currentTime),
        duration: Math.floor(duration) || get().duration || 180,
      });
    },

    setCurrent: (item: Playable, newQueue?: Playable[]) => {
      const audio = getAudio();
      const currentQueue = newQueue || (get().queue.length ? get().queue : [item]);

      // Ensure item is in queue
      const inQueue = currentQueue.some((q) => q.id === item.id);
      const updatedQueue = inQueue ? currentQueue : [...currentQueue, item];

      const ytId = extractYouTubeId(item.audioUrl);
      const isYt = Boolean(ytId);

      // Auto fallback cover to YouTube thumbnail if missing or broken google search
      let resolvedCover = item.coverUrl || item.art;
      if (isYt && ytId && (!resolvedCover || resolvedCover.includes('google.com/search'))) {
        resolvedCover = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      }

      const preparedItem: Playable = {
        ...item,
        coverUrl: resolvedCover,
        art: resolvedCover,
      };

      set({
        current: preparedItem,
        queue: updatedQueue,
        progress: 0,
        duration: item.duration || 180,
        isPlaying: true,
        error: null,
        isYouTube: isYt,
        youtubeId: ytId,
      });

      if (isYt) {
        // Pause HTML5 audio
        audio.pause();
        audio.src = '';

        // Start YouTube polling timer
        if (ytTimer) clearInterval(ytTimer);
        ytTimer = window.setInterval(() => {
          if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function' && get().isPlaying) {
            try {
              const cur = ytPlayer.getCurrentTime() || 0;
              const dur = ytPlayer.getDuration() || get().duration;
              get().syncYouTubeProgress(cur, dur);
            } catch (e) {}
          }
        }, 500);

        loadYouTubeApi().then(() => {
          if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
            ytPlayer.loadVideoById(ytId);
            ytPlayer.setVolume(Math.round(get().volume * 100));
            ytPlayer.playVideo();
          }
        });
      } else {
        // Direct audio stream (MP3 / AAC / WAV)
        if (ytTimer) clearInterval(ytTimer);
        if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
          try {
            ytPlayer.stopVideo();
          } catch (e) {}
        }

        if (item.audioUrl) {
          audio.src = item.audioUrl;
          audio.volume = get().volume;
          audio.play().catch((err) => {
            console.warn('Playback error / autoplay restricted:', err.message);
          });
        }
      }

      // Record telemetry event after 5s of listening
      if (telemetryTimer) clearTimeout(telemetryTimer);
      telemetryTimer = window.setTimeout(() => {
        if (item.id && get().isPlaying) {
          api.recordPlaybackEvent(item.id, 5).catch(() => {});
        }
      }, 5000);
    },

    setQueue: (queue: Playable[]) => set({ queue }),

    play: () => {
      const { current, isYouTube } = get();
      if (!current) return;

      if (isYouTube) {
        if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
          try {
            ytPlayer.playVideo();
          } catch (e) {}
        }
      } else {
        const audio = getAudio();
        if (audio.src) {
          audio.play().catch(() => {});
        }
      }
      set({ isPlaying: true });
    },

    pause: () => {
      const { isYouTube } = get();
      if (isYouTube) {
        if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
          try {
            ytPlayer.pauseVideo();
          } catch (e) {}
        }
      } else {
        const audio = getAudio();
        audio.pause();
      }
      set({ isPlaying: false });
    },

    toggle: () => {
      const { isPlaying, play, pause } = get();
      if (isPlaying) pause();
      else play();
    },

    next: () => {
      const { current, queue, shuffle, setCurrent } = get();
      if (!current || !queue.length) return;

      if (shuffle && queue.length > 1) {
        const remaining = queue.filter((x) => x.id !== current.id);
        const randomIndex = Math.floor(Math.random() * remaining.length);
        setCurrent(remaining[randomIndex]);
        return;
      }

      const currentIndex = queue.findIndex((x) => x.id === current.id);
      const nextIndex = (currentIndex + 1) % queue.length;
      setCurrent(queue[nextIndex]);
    },

    previous: () => {
      const { current, queue, progress, seek, setCurrent } = get();
      if (!current || !queue.length) return;

      if (progress > 3) {
        seek(0);
        return;
      }

      const currentIndex = queue.findIndex((x) => x.id === current.id);
      const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
      setCurrent(queue[prevIndex]);
    },

    seek: (seconds: number) => {
      const { isYouTube } = get();
      if (isYouTube) {
        if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
          try {
            ytPlayer.seekTo(seconds, true);
          } catch (e) {}
        }
      } else {
        const audio = getAudio();
        if (audio.duration) {
          audio.currentTime = seconds;
        }
      }
      set({ progress: seconds });
    },

    setVolume: (volume: number) => {
      const clamped = Math.max(0, Math.min(1, volume));
      const { isYouTube } = get();

      if (isYouTube) {
        if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
          try {
            ytPlayer.setVolume(Math.round(clamped * 100));
          } catch (e) {}
        }
      } else {
        const audio = getAudio();
        audio.volume = clamped;
      }
      set({ volume: clamped });
    },

    toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

    cycleRepeat: () =>
      set((s) => ({
        repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off',
      })),

    tick: () => {
      const s = get();
      if (!s.current || !s.isPlaying) return;
      if (!s.isYouTube && (!globalAudio?.src || globalAudio.paused)) {
        const duration = s.duration || s.current.duration || 180;
        if (s.progress + 1 >= duration) {
          if (s.repeat === 'one') set({ progress: 0 });
          else s.next();
        } else {
          set({ progress: s.progress + 1 });
        }
      }
    },
  };
});

// Helper for Layout to register the YouTube player iframe instance
export function setGlobalYouTubePlayer(playerInstance: any) {
  ytPlayer = playerInstance;
}
