import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Maximize2,
  Minimize2,
  MessageSquare,
  Heart,
  Volume2,
  VolumeX,
  ListMusic,
} from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';

import { audioEngine } from '../services/audioEngine';
import soniqueLogo from '../assets/sonique-logo.jpg';

interface TurntableProps {
  onExpandToggle?: () => void;
  isExpanded?: boolean;
}

export default function Turntable({ onExpandToggle, isExpanded }: TurntableProps) {
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

  const queue = player.queue && player.queue.length > 0 ? player.queue : [];
  const currentIdx = queue.findIndex((t) => t.id === current?.id);
  const upNextTracks =
    currentIdx !== -1 && currentIdx < queue.length - 1
      ? queue.slice(currentIdx + 1, currentIdx + 4)
      : queue.filter((t) => t.id !== current?.id).slice(0, 3);

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
    // Top is +8%, bottom is -8%
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

  // Calculate rotary knob angle based on volume: -135deg (0%) to +135deg (100%)
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
    <div className={`turntableContainer ${isExpanded ? 'expanded' : ''}`}>
      {/* Metallic Turntable Chassis */}
      <div className="turntableChassis">
        {/* 4 Corner Hardware Screws */}
        <div className="cornerScrew tl" title="Hardware chassis rivet" />
        <div className="cornerScrew tr" title="Hardware chassis rivet" />
        <div className="cornerScrew bl" title="Hardware chassis rivet" />
        <div className="cornerScrew br" title="Hardware chassis rivet" />

        {/* Vintage Turntable Controls on Chassis (matching user photo) */}
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
            {/* Matching screw below PITCH */}
            <div className="chassisScrewSmall" title="Hardware chassis rivet" />
          </div>
        </div>

        {/* Recessed Platter Basin */}
        <div className="platterBasin">
          {/* Stroboscope Rim */}
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
            {/* Concentric Grooves */}
            <div className="vinylGroove groove1" />
            <div className="vinylGroove groove2" />
            <div className="vinylGroove groove3" />
            <div className="vinylGroove groove4" />
            <div className="vinylGroove groove5" />

            {/* Specular Radial Shine Overlay */}
            <div className="vinylSheen" />

            {/* Center Label featuring uploaded Sonique logo badge */}
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
          {/* Base Pivot */}
          <div className="tonearmPivot">
            <div className="pivotRing" />
            <div className="counterweight" />
          </div>

          {/* S-Shaped Tone Arm Rod */}
          <div className="tonearmArm">
            {/* Headshell & Needle Cartridge */}
            <div className="cartridgeHead">
              <div className="cartridgeBody" />
              <div className="needleTip" />
            </div>
          </div>
        </div>
      </div>

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

        {/* Genre Pill Tag */}
        <div className="genrePillRow">
          <span className="genrePillBlack">
            {((current as any)?.genre) || ((current as any)?.badge) || 'Classic'}
          </span>
          <span className="artistSubtleText">
            {typeof (current as any)?.artist === 'string' ? (current as any).artist : 'Classic Sound'}
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
            // Real audio frequency reactive height or fallback waveform bounce
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

        {/* Big Circular Black Play/Pause Button */}
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

        {/* Shuffle Button with clear visual active state */}
        <button
          className={`transportIconBtn ${player.shuffle ? 'active' : ''}`}
          onClick={player.toggleShuffle}
          title={player.shuffle ? 'Shuffle: ON' : 'Shuffle: OFF'}
        >
          <Shuffle size={19} color={player.shuffle ? '#000' : '#444'} />
          {player.shuffle && <span className="shuffleActiveDot" />}
        </button>

        {/* Repeat Mode Button (Off -> All -> One) */}
        <button
          className={`transportIconBtn ${player.repeat !== 'off' ? 'active' : ''}`}
          onClick={player.cycleRepeat}
          title={`Repeat: ${player.repeat.toUpperCase()} (Click to cycle)`}
        >
          <Repeat size={19} color={player.repeat !== 'off' ? '#000' : '#444'} />
          {player.repeat === 'one' && <span className="repeatModeBadge">1</span>}
          {player.repeat === 'all' && <span className="repeatModeBadge">ALL</span>}
        </button>

        {/* Audio Volume / Mute Button */}
        <button
          className="transportIconBtn"
          onClick={handleMuteToggle}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={19} color="#777" /> : <Volume2 size={19} color="#000" />}
        </button>
      </div>

      {/* Up Next in Queue mini-panel to fill blank space with upcoming tracks */}
      {!isExpanded && upNextTracks.length > 0 && (
        <div className="turntableQueueSection">
          <div className="turntableQueueHeader">
            <span className="turntableQueueTitle">
              <ListMusic size={13} style={{ display: 'inline', verticalAlign: -1, marginRight: 5 }} />
              Up Next
            </span>
            <span className="turntableQueueBadge">
              {queue.length} in queue
            </span>
          </div>
          <div className="turntableQueueList">
            {upNextTracks.map((trk) => {
              const mins = Math.floor((trk.duration || 215) / 60);
              const secs = ((trk.duration || 215) % 60).toString().padStart(2, '0');
              return (
                <div
                  key={trk.id}
                  className="turntableQueueItem"
                  onClick={() => player.selectTrack(trk as any, true)}
                  title={`Play: ${trk.title} by ${(trk as any).artist || 'Artist'}`}
                >
                  <img
                    src={(trk as any).coverUrl || (trk as any).art || ''}
                    alt={trk.title}
                    className="queueItemThumb"
                  />
                  <div className="queueItemMeta">
                    <span className="queueItemTitle">{trk.title}</span>
                    <span className="queueItemArtist">{(trk as any).artist || (trk as any).showTitle || 'Artist'}</span>
                  </div>
                  <span className="queueItemTime">{mins}:{secs}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
