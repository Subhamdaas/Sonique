import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, VolumeX, Shuffle, Repeat, Disc3 } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PersistentPlayerBar() {
  const player = usePlayerStore();
  const { likedTrackIds, toggleLike } = useLibraryStore();
  const location = useLocation();
  const navigate = useNavigate();

  // If on the Home page, the large vinyl turntable is already visible
  if (location.pathname === '/' || !player.current) {
    return null;
  }

  const current = player.current;
  const isPlaying = player.isPlaying;
  const hasLiked = current ? likedTrackIds.has(current.id) : false;

  const currentDuration = player.duration || current.duration || 0;
  const progressRatio =
    currentDuration > 0 ? (player.progress / currentDuration) * 100 : 0;

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    player.seek(ratio * currentDuration);
  };

  return (
    <div className="persistentRetroPlayerBar" role="region" aria-label="Audio Player">
      {/* Left: Track Identity */}
      <div className="playerBarTrackMeta" onClick={() => navigate('/')} title="Click to view vinyl deck">
        <div className="playerBarCoverWrap">
          {current.coverUrl || (current as any).art ? (
            <img
              src={current.coverUrl || (current as any).art}
              alt=""
              className={`playerBarCover ${isPlaying ? 'spinning' : ''}`}
            />
          ) : (
            <Disc3 size={24} />
          )}
        </div>
        <div className="playerBarText">
          <span className="playerBarTitle">{current.title}</span>
          <span className="playerBarArtist">{(current as any).artist || (current as any).show?.title || 'Unknown Artist'}</span>
        </div>
        <button
          className={`playerBarLikeBtn ${hasLiked ? 'liked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(current as any);
          }}
          aria-label={hasLiked ? 'Unlike' : 'Like'}
        >
          <Heart size={16} fill={hasLiked ? '#000' : 'none'} color="#000" />
        </button>
      </div>

      {/* Center: Controls & Scrubber */}
      <div className="playerBarCenterControls">
        <div className="playerBarButtons">
          <button
            className={`playerBarIconBtn ${player.shuffle ? 'active' : ''}`}
            onClick={player.toggleShuffle}
            aria-label="Toggle shuffle"
          >
            <Shuffle size={14} />
          </button>
          <button
            className="playerBarIconBtn"
            onClick={player.previous}
            aria-label="Previous track"
          >
            <SkipBack size={16} />
          </button>
          {player.isAutoplayBlocked ? (
            <button
              className="playerBarPlayBtn resumeBlockedBtn"
              onClick={player.resumeAutoplay}
              aria-label="Resume playback"
              title="Autoplay paused by browser. Click to resume."
            >
              <Play size={18} fill="#000" style={{ marginLeft: 2 }} />
            </button>
          ) : (
            <button
              className="playerBarPlayBtn"
              onClick={player.toggle}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={18} fill="#000" /> : <Play size={18} fill="#000" style={{ marginLeft: 2 }} />}
            </button>
          )}
          <button
            className="playerBarIconBtn"
            onClick={player.next}
            aria-label="Next track"
          >
            <SkipForward size={16} />
          </button>
          <button
            className={`playerBarIconBtn ${player.repeat !== 'off' ? 'active' : ''}`}
            onClick={player.cycleRepeat}
            aria-label="Repeat mode"
          >
            <Repeat size={14} />
          </button>
        </div>

        <div className="playerBarScrubberRow">
          <span className="playerBarTime">{formatTime(player.progress)}</span>
          <div className="playerBarTrackLine" onClick={handleSeek} title="Seek">
            <div className="playerBarProgressFill" style={{ width: `${progressRatio}%` }} />
          </div>
          <span className="playerBarTime">{formatTime(currentDuration)}</span>
        </div>
      </div>

      {/* Right: Volume & Vinyl Deck Shortcut */}
      <div className="playerBarRightActions">
        <button
          className="playerBarIconBtn"
          onClick={player.toggleMute}
          aria-label={player.isMuted ? 'Unmute' : 'Mute'}
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
          className="playerBarVolumeSlider"
          aria-label="Volume"
        />
        <button
          className="deckShortcutBtn"
          onClick={() => navigate('/')}
          title="Return to Vinyl Deck"
          aria-label="Return to Vinyl Deck"
        >
          <Disc3 size={16} />
          <span>DECK</span>
        </button>
      </div>
    </div>
  );
}
