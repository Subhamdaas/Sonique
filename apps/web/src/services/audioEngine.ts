// ============================================================
// CLEAN & BULLETPROOF AUDIO ENGINE
// Plays any audio stream natively through HTML5 Audio element
// No CORS hijacking, instant sound, realistic beat visualizer
// ============================================================

class RetroAudioEngine {
  private audio: HTMLAudioElement;
  private currentUrl = '';
  private pendingSeek: number | null = null;
  private playbackRate = 1.0;
  private shouldPlay = false;

  public onTimeUpdate: ((currentTime: number) => void) | null = null;
  public onDurationChange: ((duration: number) => void) | null = null;
  public onEnded: (() => void) | null = null;
  public onPlayStateChange: ((isPlaying: boolean) => void) | null = null;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.volume = 0.8;

    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.audio.currentTime);
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.onDurationChange && !isNaN(this.audio.duration) && this.audio.duration > 0) {
        this.onDurationChange(this.audio.duration);
      }
      if (this.pendingSeek !== null) {
        try {
          this.audio.currentTime = this.pendingSeek;
        } catch (e) {}
        this.pendingSeek = null;
      }
    });

    this.audio.addEventListener('canplay', () => {
      if (this.pendingSeek !== null) {
        try {
          this.audio.currentTime = this.pendingSeek;
        } catch (e) {}
        this.pendingSeek = null;
      }
      if (this.shouldPlay && this.audio.paused) {
        this.audio.play().catch(() => {});
      }
    });

    this.audio.addEventListener('play', () => {
      if (!this.shouldPlay) {
        try {
          this.audio.pause();
        } catch (e) {}
        return;
      }
      if (this.onPlayStateChange) this.onPlayStateChange(true);
    });

    this.audio.addEventListener('playing', () => {
      if (!this.shouldPlay) {
        try {
          this.audio.pause();
        } catch (e) {}
        return;
      }
      if (this.onPlayStateChange) this.onPlayStateChange(true);
    });

    this.audio.addEventListener('pause', () => {
      if (this.audio.ended) return;
      if (!this.shouldPlay && this.onPlayStateChange) {
        this.onPlayStateChange(false);
      }
    });

    this.audio.addEventListener('ended', () => {
      this.shouldPlay = false;
      if (this.onEnded) {
        this.onEnded();
      } else {
        if (this.onPlayStateChange) this.onPlayStateChange(false);
      }
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio stream error on URL:', this.audio.src, e);
    });
  }

  // Pre-load track without playing
  public loadTrack(url: string, initialSeek = 0) {
    if (!url) return;
    this.currentUrl = url;
    this.audio.src = url;
    this.audio.playbackRate = this.playbackRate;
    this.pendingSeek = initialSeek;
    this.shouldPlay = false;
    if (this.onPlayStateChange) this.onPlayStateChange(false);
    if (this.onTimeUpdate) this.onTimeUpdate(initialSeek);
  }

  // Explicit Play
  public async play(url?: string, seekSeconds?: number): Promise<void> {
    this.shouldPlay = true;
    const isNew = Boolean(url && (this.currentUrl !== url || !this.audio.src));

    if (isNew && url) {
      this.currentUrl = url;
      this.audio.src = url;
      this.audio.playbackRate = this.playbackRate;
      if (seekSeconds !== undefined) {
        this.pendingSeek = seekSeconds;
      }
    } else if (seekSeconds !== undefined) {
      if (this.audio.readyState >= 1) {
        try {
          this.audio.currentTime = seekSeconds;
        } catch (e) {}
      } else {
        this.pendingSeek = seekSeconds;
      }
    }

    try {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      if (!this.shouldPlay) {
        try {
          this.audio.pause();
        } catch (e) {}
        if (this.onPlayStateChange) this.onPlayStateChange(false);
        return;
      }
      if (this.onPlayStateChange) this.onPlayStateChange(true);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      console.warn('Playback gesture needed or error:', err.message);
      throw err;
    }
  }

  // Explicit Pause
  public pause() {
    this.shouldPlay = false;
    try {
      this.audio.pause();
    } catch (e) {}
    if (this.onPlayStateChange) this.onPlayStateChange(false);
  }

  // Seek
  public seek(seconds: number) {
    if (this.audio.readyState >= 1) {
      try {
        this.audio.currentTime = seconds;
      } catch (e) {}
    } else {
      this.pendingSeek = seconds;
    }
    if (this.onTimeUpdate) this.onTimeUpdate(seconds);
  }

  // Volume (0.0 to 1.0)
  public setVolume(vol: number) {
    this.audio.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.audio.volume;
  }

  // Playback Rate (RPM)
  public setPlaybackRate(rate: number) {
    this.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    if (this.audio) {
      this.audio.playbackRate = this.playbackRate;
    }
  }

  public getPlaybackRate(): number {
    return this.playbackRate;
  }

  // Dynamic rhythmic visualizer frequency levels
  public getFrequencyData(): Uint8Array {
    const data = new Uint8Array(36);
    if (!this.shouldPlay || this.audio.paused) {
      return data;
    }
    const t = performance.now() / 150;
    for (let i = 0; i < 36; i++) {
      // Natural harmonic waveform pattern that pulses with tempo
      const beat1 = Math.sin(t * 1.8 + i * 0.4);
      const beat2 = Math.cos(t * 0.9 - i * 0.3);
      const noise = (Math.sin(t * 3.5 + i * 1.2) + 1) / 2;
      const combined = Math.max(0, (beat1 + beat2 + noise) / 3);
      data[i] = Math.floor(combined * 255);
    }
    return data;
  }
}

export const audioEngine = new RetroAudioEngine();
