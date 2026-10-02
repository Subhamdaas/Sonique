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

interface TurntableProps {
  onExpandToggle?: () => void;
  isExpanded?: boolean;
}

export default function Turntable({ onExpandToggle, isExpanded }: TurntableProps) {
  const player = usePlayerStore();
  const { likedTrackIds, toggleLike } = useLibraryStore();
  const [likesCount, setLikesCount] = useState<number>(392);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [hoverTime, setHoverTime] = useState<string | null>(null);
  const [freqBars, setFreqBars] = useState<number[]>([]);

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

  return (
    <div className={`turntableContainer ${isExpanded ? 'expanded' : ''}`}>
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
      </div>
    </div>
  );
}
