import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Maximize2,
  Minimize2,
  MessageSquare,
} from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { audioEngine } from '../services/audioEngine';
import soniqueLogo from '../assets/sonique-logo.jpg';

interface VinylTurntableProps {
  onExpandToggle?: () => void;
  isExpanded?: boolean;
}

export default function VinylTurntable({ onExpandToggle, isExpanded }: VinylTurntableProps) {
  const player = usePlayerStore();
  const { likedTrackIds, toggleLike } = useLibraryStore();
  const [likesCount, setLikesCount] = useState<number>(392);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [isScratching, setIsScratching] = useState<boolean>(false);
  const [hoverTime, setHoverTime] = useState<string | null>(null);
  const [freqBars, setFreqBars] = useState<number[]>([]);
  const [rpm, setRpm] = useState<33 | 45>(33);
  const [pitchOffset, setPitchOffset] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const current = player.current;
  const isPlaying = player.isPlaying;

  // Waveform bars data (36 bars with natural variation)
  const barHeights = [
    20, 35, 60, 45, 80, 95, 70, 50, 85, 100, 75, 40, 65, 90, 80, 55, 70, 95,
    60, 85, 100, 70, 45, 80, 90, 65, 40, 75, 85, 60, 45, 70, 80, 50, 30, 20,
  ];

  // Frequency visualizer loop
  useEffect(() => {
    let animId: number;
    const updateFreqs = () => {
      if (isPlaying) {
        const raw = audioEngine.getFrequencyData();
        if (raw && raw.length > 0) {
          const sample = Array.from(raw.slice(0, 36)).map((v, i) => {
            const base = barHeights[i] || 40;
            const boost = (v / 255) * 55;
            return Math.min(100, Math.max(15, base * 0.45 + boost));
          });
          setFreqBars(sample);
        }
      }
      animId = requestAnimationFrame(updateFreqs);
    };
    animId = requestAnimationFrame(updateFreqs);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Update like count based on current track
  useEffect(() => {
    if (current && 'likes' in current && typeof (current as any).likes === 'number') {
      setLikesCount((current as any).likes);
    } else {
      setLikesCount(392);
    }
    if (current) {
      setHasLiked(likedTrackIds.has(current.id));
    }
  }, [current, likedTrackIds]);

  const handleLikeToggle = () => {
    if (!current) return;
    toggleLike(current as any);
    if (!hasLiked) {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikesCount((prev) => Math.max(0, prev - 1));
      setHasLiked(false);
    }
  };

  const handleSpeedToggle = (newRpm: 33 | 45) => {
    setRpm(newRpm);
    const baseRate = newRpm === 45 ? 1.35 : 1.0;
    const combinedRate = baseRate * (1 + pitchOffset / 100);
    audioEngine.setPlaybackRate(combinedRate);
  };

  const handlePitchClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const ratio = Math.max(0, Math.min(1, clickY / rect.height));
    const newPitch = Math.round((0.5 - ratio) * 16);
    setPitchOffset(newPitch);
    const baseRate = rpm === 45 ? 1.35 : 1.0;
    const combinedRate = baseRate * (1 + newPitch / 100);
    audioEngine.setPlaybackRate(combinedRate);
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      audioEngine.setVolume(player.volume || 0.8);
      setIsMuted(false);
    } else {
      audioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentDuration = player.duration || (current?.duration ?? 215);
  const currentProgress = Math.min(player.progress, currentDuration);
  const progressPercent = currentDuration > 0 ? (currentProgress / currentDuration) * 100 : 0;

  // Handle clicking on waveform to seek
  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = Math.floor(ratio * currentDuration);
    player.seek(targetSeconds);
    if (!isPlaying) {
      player.play();
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  // Vinyl animation speed based on RPM
  const spinDuration = rpm === 45 ? '2.3s' : '3.2s';
  const dialAngle = isMuted ? -135 : Math.round(((player.volume ?? 0.8) * 270) - 135);

  const handleDialClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handleMuteToggle();
  };

  const handleDialWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    const newVol = Math.max(0, Math.min(1, (player.volume ?? 0.8) + delta));
    player.setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  return (
    <div className="vinylTurntableSectionWrap">
      {/* 1. Metallic Vinyl Turntable Chassis */}
      <div className="turntableChassis">
        {/* 4 Corner Hardware Screws */}
        <div className="cornerScrew tl" title="Hardware chassis rivet" />
        <div className="cornerScrew tr" title="Hardware chassis rivet" />
        <div className="cornerScrew bl" title="Hardware chassis rivet" />
        <div className="cornerScrew br" title="Hardware chassis rivet" />

        {/* Vintage Turntable Controls on Chassis */}
        <div className="chassisControls">
          {/* Rotary Volume / Gain Knob */}
          <div
            className={`chassisDial top ${isMuted ? 'muted' : ''}`}
            onClick={handleDialClick}
            onWheel={handleDialWheel}
            title={`Volume: ${isMuted ? 'Muted' : `${Math.round((player.volume ?? 0.8) * 100)}%`} (Click to Mute, Scroll to adjust)`}
          >
            <div className="dialNotch" style={{ transform: `rotate(${dialAngle}deg)` }} />
          </div>

          {/* 33 • 45 RPM Speed Selector */}
          <div
            className="speedPill"
            title={`Speed: ${rpm} RPM (Click 33 or 45 to switch)`}
          >
            <span
              className={`speedLabel ${rpm === 33 ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); handleSpeedToggle(33); }}
            >
              33
            </span>
            <span
              className={`speedDot ${rpm === 45 ? 'dotRight' : 'dotLeft'}`}
              onClick={(e) => { e.stopPropagation(); handleSpeedToggle(rpm === 33 ? 45 : 33); }}
            />
            <span
              className={`speedLabel ${rpm === 45 ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); handleSpeedToggle(45); }}
            >
              45
            </span>
          </div>

          {/* PITCH Tempo / Speed Fader */}
          <div
            className="pitchSliderWrap"
            title={`Pitch: ${pitchOffset > 0 ? `+${pitchOffset}` : pitchOffset}% (Click/drag to adjust, double-click to reset 0%)`}
          >
            <div
              className="pitchTrack"
              onClick={handlePitchClick}
              onDoubleClick={() => {
                setPitchOffset(0);
                audioEngine.setPlaybackRate(rpm === 45 ? 1.35 : 1.0);
              }}
            >
              <div
                className="pitchThumb"
                style={{ top: `${Math.round(50 - (pitchOffset / 8) * 45)}%` }}
              />
            </div>
            <span className="pitchLabel">PITCH</span>
            <div className="chassisScrewSmall" title="Hardware chassis rivet" />
          </div>
        </div>

        {/* Recessed Platter Basin */}
        <div className="platterBasin">
          <div className="strobeRim" />

          {/* Vinyl Record */}
          <div
            className={`vinylRecord ${isPlaying ? 'spinning' : 'paused'} ${isScratching ? 'scratching' : ''}`}
            style={{ animationDuration: spinDuration }}
            onClick={() => {
              setIsScratching(true);
              setTimeout(() => setIsScratching(false), 200);
              togglePlayback();
            }}
            title="Click vinyl to Play / Pause"
          >
            <div className="vinylGroove groove1" />
            <div className="vinylGroove groove2" />
            <div className="vinylGroove groove3" />
            <div className="vinylGroove groove4" />
            <div className="vinylGroove groove5" />

            <div className="vinylSheen" />

            {/* Center Label featuring uploaded Sonique logo */}
            <div className="vinylCenterLabel">
              <img
                src={soniqueLogo}
                alt="Sonique Logo"
                className="vinylCenterLogoImg"
              />
              <div className="labelSpeedText">{rpm === 45 ? '45 RPM' : '33⅓ RPM'}</div>
              <div className="spindleHole" />
            </div>
          </div>
        </div>

        {/* Tonearm Assembly */}
        <div className={`tonearmAssembly ${isPlaying ? 'onRecord' : 'atRest'}`}>
          <div className="tonearmPivot">
            <div className="pivotRing" />
            <div className="counterweight" />
          </div>

          <div className="tonearmArm">
            <div className="cartridgeHead">
              <svg
                viewBox="0 0 54 84"
                width="30"
                height="48"
                className="technicsHeadshellSvg"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="collarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#444850" />
                    <stop offset="25%" stopColor="#d8dde6" />
                    <stop offset="50%" stopColor="#ffffff" />
                    <stop offset="75%" stopColor="#a4abb8" />
                    <stop offset="100%" stopColor="#32363e" />
                  </linearGradient>

                  <linearGradient id="headshellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="35%" stopColor="#e4e8ef" />
                    <stop offset="70%" stopColor="#b6bcc8" />
                    <stop offset="100%" stopColor="#767c88" />
                  </linearGradient>

                  <linearGradient id="cartridgeBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#15171a" />
                    <stop offset="50%" stopColor="#2c3038" />
                    <stop offset="100%" stopColor="#0f1012" />
                  </linearGradient>

                  <linearGradient id="stylusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor="#ffd700" />
                    <stop offset="100%" stopColor="#b8860b" />
                  </linearGradient>

                  <filter id="headshellShadow" x="-30%" y="-20%" width="160%" height="160%">
                    <feDropShadow dx="1.5" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.45" />
                  </filter>
                </defs>

                <rect x="14" y="24" width="18" height="40" rx="3" fill="url(#cartridgeBodyGrad)" filter="url(#headshellShadow)" />
                <path d="M 21 62 L 25 74 L 23 75 L 19 63 Z" fill="url(#stylusGrad)" />
                <circle cx="24" cy="74" r="1.5" fill="#ffffff" />

                <rect x="15" y="0" width="16" height="13" rx="2" fill="url(#collarGrad)" />
                <line x1="15" y1="3" x2="31" y2="3" stroke="#222" strokeWidth="1" opacity="0.65" />
                <line x1="15" y1="6" x2="31" y2="6" stroke="#222" strokeWidth="1" opacity="0.65" />
                <line x1="15" y1="9" x2="31" y2="9" stroke="#222" strokeWidth="1" opacity="0.65" />

                <path
                  d="M 12 11
                     C 12 9, 34 9, 34 11
                     L 36 46
                     C 36 53, 30 57, 23 57
                     C 16 57, 10 53, 10 46
                     Z"
                  fill="url(#headshellGrad)"
                  stroke="#7c828e"
                  strokeWidth="0.8"
                  filter="url(#headshellShadow)"
                />

                <line x1="23" y1="13" x2="23" y2="53" stroke="#ffffff" strokeWidth="1" opacity="0.75" />
                <circle cx="17" cy="21" r="1.8" fill="#e53935" />
                <circle cx="29" cy="21" r="1.8" fill="#43a047" />
                <circle cx="17" cy="29" r="1.8" fill="#1e88e5" />
                <circle cx="29" cy="29" r="1.8" fill="#ffffff" stroke="#888" strokeWidth="0.5" />

                <rect x="15" y="19" width="4" height="4.5" rx="1" fill="#111" stroke="#555" strokeWidth="0.6" />
                <rect x="15" y="27" width="4" height="4.5" rx="1" fill="#111" stroke="#555" strokeWidth="0.6" />
                <rect x="15" y="35" width="4" height="4.5" rx="1" fill="#111" stroke="#555" strokeWidth="0.6" />

                <rect x="27" y="19" width="4" height="4.5" rx="1" fill="#111" stroke="#555" strokeWidth="0.6" />
                <rect x="27" y="27" width="4" height="4.5" rx="1" fill="#111" stroke="#555" strokeWidth="0.6" />
                <rect x="27" y="35" width="4" height="4.5" rx="1" fill="#111" stroke="#555" strokeWidth="0.6" />

                <rect x="18" y="43" width="10" height="4" rx="2" fill="#181a1e" stroke="#4a4f58" strokeWidth="0.6" />

                <path
                  d="M 33 30
                     C 40 30, 47 28, 47 22
                     C 47 18, 42 18, 40 22"
                  fill="none"
                  stroke="url(#collarGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#headshellShadow)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Play Button Bar (Track Info, Waveform & Controls) */}
      <div className="turntableContainer" style={{ marginTop: 18 }}>
        {/* Track Meta & Social Badge */}
        <div className="trackInfoSection">
          <div className="trackMainRow">
            <h1 className="trackTitlePixel" title={current?.title || 'The Suffering'}>
              {current?.title || 'The Suffering'}
            </h1>
            <button
              className={`likeCountBadge ${hasLiked ? 'liked' : ''}`}
              onClick={handleLikeToggle}
              title={hasLiked ? 'Unlike track' : 'Like track'}
            >
              <MessageSquare size={16} fill={hasLiked ? '#000' : 'none'} color="#000" />
              <span className="likeNumber">+ {likesCount}</span>
            </button>
          </div>

          <div className="genrePillRow">
            <span className="genrePillBlack">
              {((current as any)?.genre) || ((current as any)?.badge) || 'Classic'}
            </span>
          </div>
        </div>

        {/* Waveform Visualizer & Time Codes */}
        <div className="waveformContainer">
          <span className="timePixel current">{formatTime(currentProgress)}</span>

          <div
            className="waveformBars"
            onClick={handleWaveformClick}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setHoverTime(formatTime(Math.floor(ratio * currentDuration)));
            }}
            onMouseLeave={() => setHoverTime(null)}
            title={hoverTime ? `Seek to ${hoverTime}` : 'Click to seek'}
          >
            {barHeights.map((h, index) => {
              const barPercent = (index / barHeights.length) * 100;
              const isPlayed = barPercent <= progressPercent;
              const realHeight = freqBars[index] !== undefined && isPlaying
                ? freqBars[index]
                : isPlaying
                ? Math.min(100, Math.max(15, h + Math.sin((index + player.progress * 4) * 0.5) * 18))
                : h;

              return (
                <div
                  key={index}
                  className={`waveBar ${isPlayed ? 'played' : 'unplayed'} ${isPlaying ? 'animated' : ''}`}
                  style={{
                    height: `${realHeight}%`,
                  }}
                />
              );
            })}
          </div>

          <span className="timePixel total">{formatTime(currentDuration)}</span>
        </div>

        {/* Bottom Transport Controls */}
        <div className="transportControls">
          <button
            className="transportIconBtn"
            onClick={onExpandToggle}
            title={isExpanded ? 'Minimize player' : 'Expand player'}
          >
            {isExpanded ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
          </button>

          <button
            className="transportIconBtn"
            onClick={() => player.previous()}
            title="Previous Track"
          >
            <SkipBack size={21} fill="#000" color="#000" />
          </button>

          <button
            className="bigPlayButton"
            onClick={togglePlayback}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={24} fill="#fff" color="#fff" />
            ) : (
              <Play size={24} fill="#fff" color="#fff" style={{ marginLeft: 3 }} />
            )}
          </button>

          <button
            className="transportIconBtn"
            onClick={() => player.next()}
            title="Next Track"
          >
            <SkipForward size={21} fill="#000" color="#000" />
          </button>

          <button
            className={`transportIconBtn ${player.shuffle ? 'active' : ''}`}
            onClick={player.toggleShuffle}
            title={player.shuffle ? 'Shuffle: ON' : 'Shuffle: OFF'}
          >
            <Shuffle size={19} color={player.shuffle ? '#000' : '#444'} />
            {player.shuffle && <span className="shuffleActiveDot" />}
          </button>
        </div>
      </div>
    </div>
  );
}
