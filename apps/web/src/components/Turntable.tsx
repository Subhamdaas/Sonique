import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Maximize2,
  Minimize2,
  Heart,
  Volume2,
  VolumeX,
  ListMusic,
  Disc3,
  Repeat,
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

  const [isScratching, setIsScratching] = useState<boolean>(false);
  const [hoverTime, setHoverTime] = useState<string | null>(null);
  const [freqBars, setFreqBars] = useState<number[]>([]);
  const [rpm, setRpm] = useState<33 | 45>(33);
  const [pitchOffset, setPitchOffset] = useState<number>(0);

  const current = player.current;
  const isPlaying = player.isPlaying;
  const hasLiked = current ? likedTrackIds.has(current.id) : false;

  const queue = player.queue && player.queue.length > 0 ? player.queue : [];
  const currentIdx = queue.findIndex((t) => t.id === current?.id);
  const upNextTracks =
    currentIdx !== -1 && currentIdx < queue.length - 1
      ? queue.slice(currentIdx + 1, currentIdx + 4)
      : queue.filter((t) => t.id !== current?.id).slice(0, 3);

  // Frequency visualizer loop
  useEffect(() => {
    let animId: number;
    const updateFreqs = () => {
      if (isPlaying) {
        const raw = audioEngine.getFrequencyData();
        if (raw && raw.length > 0) {
          const sample = Array.from(raw.slice(0, 36)).map((v, i) => {
            const boost = (v / 255) * 60;
            return Math.min(100, Math.max(15, 20 + boost));
          });
          setFreqBars(sample);
        }
      }
      animId = requestAnimationFrame(updateFreqs);
    };
    animId = requestAnimationFrame(updateFreqs);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const handleLikeToggle = () => {
    if (!current) return;
    toggleLike(current as any);
  };

  const handleSpeedToggle = (newRpm: 33 | 45) => {
    setRpm(newRpm);
    const baseRate = newRpm === 45 ? 1.35 : 1.0;
    const pitchFactor = 1 + pitchOffset / 100;
    audioEngine.setPlaybackRate(baseRate * pitchFactor);
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setPitchOffset(val);
    const baseRate = rpm === 45 ? 1.35 : 1.0;
    const pitchFactor = 1 + val / 100;
    audioEngine.setPlaybackRate(baseRate * pitchFactor);
  };

  const handleScratchStart = () => {
    if (!current) return;
    setIsScratching(true);
    audioEngine.setPlaybackRate(0.3);
  };

  const handleScratchEnd = () => {
    if (!current) return;
    setIsScratching(false);
    const baseRate = rpm === 45 ? 1.35 : 1.0;
    audioEngine.setPlaybackRate(baseRate * (1 + pitchOffset / 100));
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!current || !player.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    player.seek(ratio * player.duration);
  };

  const handleWaveformHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!current || !player.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, hoverX / rect.width));
    setHoverTime(formatTime(ratio * player.duration));
  };

  const currentDuration = player.duration || current?.duration || 0;
  const progressRatio = currentDuration > 0 ? (player.progress / currentDuration) * 100 : 0;

  return (
    <div className={`turntableHardwareCard ${isExpanded ? 'expandedMode' : ''}`}>
      {/* Plinth Chrome Header */}
      <div className="turntableHeader">
        <div className="turntableBrand">
          <span className="brandDot" />
          <span className="brandModel">SONIQUE HI-FI DIRECT DRIVE</span>
          <span className="brandSub">AUDIOPHILE TURNTABLE</span>
        </div>

        <div className="turntableHeaderActions">
          <div className="hardwareSwitchGroup" role="group" aria-label="RPM Speed Switch">
            <button
              className={`hardwareSwitchBtn ${rpm === 33 ? 'active' : ''}`}
              onClick={() => handleSpeedToggle(33)}
              aria-label="33 RPM"
            >
              33
            </button>
            <button
              className={`hardwareSwitchBtn ${rpm === 45 ? 'active' : ''}`}
              onClick={() => handleSpeedToggle(45)}
              aria-label="45 RPM"
            >
              45
            </button>
          </div>

          {onExpandToggle && (
            <button
              className="expandButton"
              onClick={onExpandToggle}
              aria-label={isExpanded ? 'Minimize player' : 'Expand player'}
              title={isExpanded ? 'Minimize Player' : 'Expand Player'}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Main Turntable Deck Area */}
      <div className="turntableDeck">
        {/* Vinyl Assembly Unit */}
        <div
          className={`vinylAssemblyUnit ${isScratching ? 'scratching' : ''}`}
          onMouseDown={handleScratchStart}
          onMouseUp={handleScratchEnd}
          onMouseLeave={handleScratchEnd}
          onTouchStart={handleScratchStart}
          onTouchEnd={handleScratchEnd}
          title={current ? (isPlaying ? 'Hold or drag to scratch' : 'Click play to start') : 'Select a track'}
        >
          {/* Strobe Rim */}
          <div className={`strobeRimPattern ${isPlaying ? 'strobeActive' : ''}`} />

          {/* Heavy Acrylic / Rubber Slipmat Platter */}
          <div className={`turntablePlatterMat ${isPlaying ? 'spinning' : ''}`}>
            {/* Vinyl 12" LP Record */}
            <div className="vinylRecord">
              <div className="vinylGrooveSheen" />
              <div className="vinylGrooveRing outer" />
              <div className="vinylGrooveRing mid" />
              <div className="vinylGrooveRing inner" />

              {/* Center Vinyl Label */}
              <div className="vinylCenterLabel">
                {current && (current.coverUrl || (current as any).art) ? (
                  <img
                    src={current.coverUrl || (current as any).art}
                    alt={current.title}
                    className="labelArtwork"
                  />
                ) : (
                  <div className="labelArtworkPlaceholder">
                    <img src={soniqueLogo} alt="Sonique" className="labelArtwork" />
                  </div>
                )}
                {/* Spindle Cap */}
                <div className="turntableSpindle">
                  <div className="spindleCenterBrass" />
                </div>
              </div>
            </div>
          </div>

          {/* Realistic High-Fidelity Technics DJ Tonearm with Perforated Headshell */}
          <div className={`tonearmAssembly ${isPlaying && current ? 'needleOnRecord' : 'needleParked'}`}>
            <div className="tonearmPivotBase">
              <div className="pivotGimbalRing" />
              <div className="counterweightDial" />
              <div className="antiskateDialKnob" />
            </div>

            {/* S-Shaped ToneArm Metal Tube */}
            <div className="tonearmTube">
              {/* Cueing Arm Rest Hook */}
              <div className="tonearmRestHook" />

              {/* Technics-style Perforated Headshell & Cartridge */}
              <div className="perforatedHeadshell">
                <svg
                  width="38"
                  height="72"
                  viewBox="0 0 38 72"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="headshellSvg"
                >
                  {/* Headshell Connector Collar */}
                  <rect x="15" y="0" width="8" height="6" rx="1.5" fill="#3a3a3a" stroke="#111" strokeWidth="1" />
                  <rect x="16" y="2" width="6" height="2" fill="#d4af37" />

                  {/* Main Perforated Shell Body */}
                  <path
                    d="M14 6 L24 6 L26 14 L28 42 L25 50 L13 50 L10 42 L12 14 Z"
                    fill="url(#metalGrad)"
                    stroke="#111"
                    strokeWidth="1.2"
                  />

                  {/* Finger Lift Handle */}
                  <path
                    d="M26 22 C32 20, 36 24, 36 30 C36 34, 33 36, 30 35"
                    stroke="#222"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Ventilation / Weight-Reduction Holes */}
                  <circle cx="15.5" cy="20" r="2" fill="#111" />
                  <circle cx="22.5" cy="20" r="2" fill="#111" />
                  <circle cx="15.5" cy="28" r="2" fill="#111" />
                  <circle cx="22.5" cy="28" r="2" fill="#111" />
                  <circle cx="15.5" cy="36" r="2" fill="#111" />
                  <circle cx="22.5" cy="36" r="2" fill="#111" />

                  {/* Cartridge Body */}
                  <rect x="13" y="50" width="12" height="15" rx="1" fill="#1a1a1a" stroke="#000" strokeWidth="1" />
                  <rect x="15" y="52" width="8" height="7" fill="#dc2626" rx="0.5" />
                  <line x1="19" y1="52" x2="19" y2="59" stroke="#fff" strokeWidth="1" />

                  {/* Stylus / Cantilever & Diamond Tip */}
                  <line x1="19" y1="65" x2="19" y2="70" stroke="#888" strokeWidth="1.2" />
                  <polygon points="17.5,70 20.5,70 19,72" fill="#fff" stroke="#666" strokeWidth="0.5" />

                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="metalGrad" x1="10" y1="6" x2="28" y2="50" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#d1d5db" />
                      <stop offset="35%" stopColor="#f3f4f6" />
                      <stop offset="70%" stopColor="#9ca3af" />
                      <stop offset="100%" stopColor="#4b5563" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Micro Stylus LED Light Beam */}
                {isPlaying && current && <div className="stylusGrooveGlow" />}
              </div>
            </div>
          </div>
        </div>

        {/* Pitch Slider on Right Side */}
        <div className="pitchControlArea">
          <div className="pitchScaleLabels">
            <span>+8%</span>
            <span>0</span>
            <span>-8%</span>
          </div>
          <input
            type="range"
            min="-8"
            max="8"
            step="0.5"
            value={pitchOffset}
            onChange={handlePitchChange}
            className="pitchSliderInput"
            aria-label="Pitch Adjust Slider"
            {...({ orient: 'vertical' } as any)}
          />
          <span className="pitchValueDisplay">
            {pitchOffset > 0 ? `+${pitchOffset}%` : `${pitchOffset}%`}
          </span>
        </div>
      </div>

      {/* Track Info Display Bar */}
      <div className="turntableInfoBar">
        <div className="trackIdentityColumn">
          {current ? (
            <>
              <div className="trackMetaBadges">
                <span className="grooveBadge">
                  {isPlaying ? 'PLAYING ON VINYL' : 'PAUSED'}
                </span>
                {(current as any).genre && (
                  <span className="genreBadge">{(current as any).genre}</span>
                )}
                {(current as any).album && (
                  <span className="albumBadge">{(current as any).album}</span>
                )}
              </div>
              <h2 className="currentTrackTitle">{current.title}</h2>
              <p className="currentTrackArtist">{(current as any).artist || (current as any).show?.title || 'Unknown Artist'}</p>
            </>
          ) : (
            <>
              <div className="trackMetaBadges">
                <span className="grooveBadge idle">DECK IDLE</span>
              </div>
              <h2 className="currentTrackTitle">No Track Selected</h2>
              <p className="currentTrackArtist">Choose a song to start listening</p>
            </>
          )}
        </div>

        <div className="trackActionColumn">
          <button
            className={`turntableLikeBtn ${hasLiked ? 'liked' : ''}`}
            onClick={handleLikeToggle}
            disabled={!current}
            aria-label={hasLiked ? 'Unlike song' : 'Like song'}
            title={hasLiked ? 'Unlike' : 'Like'}
          >
            <Heart size={18} fill={hasLiked ? '#000' : 'none'} color="#000" />
          </button>
        </div>
      </div>

      {/* Rhythmic Frequency Bars & Seekable Waveform */}
      <div className="waveformContainer">
        <div
          className="waveformTimelineTrack"
          onClick={handleWaveformClick}
          onMouseMove={handleWaveformHover}
          onMouseLeave={() => setHoverTime(null)}
          title="Click to seek"
        >
          <div className="frequencyBarsWrapper">
            {Array.from({ length: 36 }).map((_, idx) => {
              const liveHeight = freqBars[idx] || 25;
              const barPlayed = (idx / 36) * 100 <= progressRatio;
              return (
                <div
                  key={idx}
                  className={`waveformBar ${barPlayed ? 'barPlayed' : ''}`}
                  style={{
                    height: isPlaying && current ? `${liveHeight}%` : '20%',
                  }}
                />
              );
            })}
          </div>

          {/* Scrubber Playhead Progress Indicator */}
          <div
            className="waveformPlayhead"
            style={{ left: `${Math.min(100, Math.max(0, progressRatio))}%` }}
          />

          {hoverTime && (
            <div className="waveformTooltip" style={{ left: '50%' }}>
              {hoverTime}
            </div>
          )}
        </div>

        <div className="timeLabelsRow">
          <span>{formatTime(player.progress)}</span>
          <span>{formatTime(currentDuration)}</span>
        </div>
      </div>

      {/* Hardware Transport Control Bar */}
      <div className="turntableTransportBar">
        <div className="transportButtonsGroup">
          <button
            className={`circularHardwareBtn ${player.shuffle ? 'active' : ''}`}
            onClick={player.toggleShuffle}
            aria-label="Toggle shuffle"
            title="Shuffle"
          >
            <Shuffle size={15} />
          </button>

          <button
            className="circularHardwareBtn"
            onClick={player.previous}
            aria-label="Previous track"
            title="Previous"
            disabled={!current}
          >
            <SkipBack size={17} />
          </button>

          <button
            className={`circularPlayBtn ${isPlaying ? 'playing' : ''}`}
            onClick={player.toggle}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
            disabled={!current}
          >
            {isPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" style={{ marginLeft: 2 }} />}
          </button>

          <button
            className="circularHardwareBtn"
            onClick={player.next}
            aria-label="Next track"
            title="Next"
            disabled={!current}
          >
            <SkipForward size={17} />
          </button>

          <button
            className={`circularHardwareBtn ${player.repeat !== 'off' ? 'active' : ''}`}
            onClick={player.cycleRepeat}
            aria-label="Repeat mode"
            title={`Repeat: ${player.repeat}`}
          >
            <Repeat size={15} />
            {player.repeat === 'one' && <span className="repeatBadge">1</span>}
          </button>
        </div>

        {/* Volume Fader */}
        <div className="volumeControlGroup">
          <button
            className="volMuteBtn"
            onClick={player.toggleMute}
            aria-label={player.isMuted ? 'Unmute' : 'Mute'}
            title={player.isMuted ? 'Unmute' : 'Mute'}
          >
            {player.isMuted || player.volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={player.isMuted ? 0 : player.volume}
            onChange={(e) => player.setVolume(parseFloat(e.target.value))}
            className="volumeSlider"
            aria-label="Volume slider"
          />
        </div>
      </div>

      {/* Up Next Queue */}
      <div className="upNextQueueCard">
        <div className="upNextQueueHeader">
          <div className="upNextTitleGroup">
            <ListMusic size={14} className="upNextIcon" />
            <span className="upNextTitle">UP NEXT IN QUEUE</span>
          </div>
          {queue.length > 0 && (
            <span className="queueCountBadge">{queue.length} Tracks</span>
          )}
        </div>

        <div className="upNextList">
          {upNextTracks.length > 0 ? (
            upNextTracks.map((trk, i) => (
              <div
                key={trk.id || i}
                className="upNextItem"
                onClick={() => player.setCurrent(trk, queue)}
                role="button"
                tabIndex={0}
                aria-label={`Play next: ${trk.title} by ${(trk as any).artist || 'Unknown Artist'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    player.setCurrent(trk, queue);
                  }
                }}
              >
                <div className="upNextCoverWrap">
                  {trk.coverUrl || (trk as any).art ? (
                    <img src={trk.coverUrl || (trk as any).art} alt="" className="upNextCover" />
                  ) : (
                    <div className="upNextCoverPlaceholder">
                      <Disc3 size={14} />
                    </div>
                  )}
                </div>
                <div className="upNextMeta">
                  <span className="upNextTrackTitle">{trk.title}</span>
                  <span className="upNextTrackArtist">{(trk as any).artist || (trk as any).show?.title || 'Unknown Artist'}</span>
                </div>
                <span className="upNextDuration">
                  {formatTime(trk.duration || 0)}
                </span>
              </div>
            ))
          ) : (
            <div className="upNextEmptyState">
              <span>Queue is empty — select songs from below to play next</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
