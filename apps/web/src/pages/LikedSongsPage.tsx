import { useEffect } from 'react';
import { Play, Pause, Heart, Clock, Music } from 'lucide-react';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Track } from '../types';

export default function LikedSongsPage() {
  const { likedTracks, likedTrackIds, toggleLike, fetchLibrary, isLoading } =
    useLibraryStore();
  const player = usePlayerStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const isPlayingLiked =
    likedTracks.some((t) => t.id === player.current?.id) && player.isPlaying;

  const handlePlayToggle = () => {
    if (isPlayingLiked) {
      player.pause();
    } else if (likedTracks.length > 0) {
      player.setCurrent(likedTracks[0], likedTracks);
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="retroDetailPage">
      {/* Header */}
      <div className="retroDetailHeader likedTheme">
        <div className="retroDetailArtBox likedBox">
          <Heart size={64} fill="#000" color="#000" />
        </div>
        <div className="retroDetailInfo">
          <span className="retroDetailBadge">LIBRARY</span>
          <h1 className="retroDetailTitle">Liked Songs</h1>
          <div className="retroDetailMeta">
            <strong>{user?.name || user?.username || 'Your Library'}</strong>
            <span>•</span>
            <span>
              {likedTracks.length} {likedTracks.length === 1 ? 'song' : 'songs'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="retroActionRow">
        <button
          className="retroBigPlayBtn"
          onClick={handlePlayToggle}
          disabled={likedTracks.length === 0}
          aria-label={isPlayingLiked ? 'Pause liked songs' : 'Play liked songs'}
        >
          {isPlayingLiked ? (
            <Pause size={20} fill="#000" />
          ) : (
            <Play size={20} fill="#000" style={{ marginLeft: 2 }} />
          )}
          <span>{isPlayingLiked ? 'PAUSE' : 'PLAY ALL'}</span>
        </button>
      </div>

      {/* Tracks List */}
      <div className="retroTrackTableContainer">
        {isLoading ? (
          <div className="retroLoadingMsg">Loading your liked songs...</div>
        ) : likedTracks.length > 0 ? (
          <div className="retroTable">
            <div className="retroTableHeader">
              <div className="colNum">#</div>
              <div className="colTitle">TITLE</div>
              <div className="colAlbum">ALBUM</div>
              <div className="colDuration">
                <Clock size={14} />
              </div>
              <div className="colAction"></div>
            </div>

            {likedTracks.map((song: Track, idx: number) => {
              const isCurrent = player.current?.id === song.id;
              const isPlaying = isCurrent && player.isPlaying;
              const isLiked = likedTrackIds.has(song.id);

              return (
                <div
                  key={song.id || idx}
                  className={`retroTableRow ${isCurrent ? 'activeRow' : ''}`}
                  onClick={() => player.setCurrent(song, likedTracks)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Play ${song.title} by ${song.artist}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') player.setCurrent(song, likedTracks);
                  }}
                >
                  <div className="tdCol idx">
                    {isPlaying ? <span className="playingWave">▶</span> : idx + 1}
                  </div>
                  <div className="tdCol title">
                    {song.coverUrl ? (
                      <img src={song.coverUrl} alt="" className="tableRowThumb" />
                    ) : (
                      <div className="tableRowThumb placeholder">
                        <Music size={14} />
                      </div>
                    )}
                    <div className="tableTitleGroup">
                      <span className="tableSongTitlePixel">{song.title}</span>
                      <span className="tableSongArtistPixel">{song.artist}</span>
                    </div>
                  </div>
                  <div className="tdCol album">{song.album || '—'}</div>
                  <div className="tdCol time">{formatTime(song.duration)}</div>
                  <div
                    className="tdCol action"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song);
                    }}
                  >
                    <button
                      className="tableRowHeartBtn"
                      aria-label={isLiked ? 'Unlike song' : 'Like song'}
                      title={isLiked ? 'Unlike' : 'Like'}
                    >
                      <Heart
                        size={16}
                        fill={isLiked ? '#000' : 'none'}
                        color="#000"
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="retroEmptyStateContainer">
            <h2>No Liked Songs Yet</h2>
            <p>
              Save songs to your collection by tapping the heart icon anywhere in Sonique.
            </p>
            <button className="retroBlackBtn" onClick={() => navigate('/search')}>
              Discover Music
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
