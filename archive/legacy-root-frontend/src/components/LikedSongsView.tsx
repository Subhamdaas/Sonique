import { Play, Heart, Clock } from 'lucide-react';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { initialSongs, RetroSong } from '../data/mockData';

export default function LikedSongsView() {
  const { likedTracks, toggleLike, likedTrackIds } = useLibraryStore();
  const player = usePlayerStore();

  // Combine store liked tracks or sample ones if empty
  const displayTracks: RetroSong[] = likedTracks.length > 0
    ? (likedTracks as any)
    : [initialSongs[0], initialSongs[1], initialSongs[4]];

  const handlePlaySong = (song: RetroSong) => {
    player.setCurrent(song as any, displayTracks as any);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="retroListViewWrap">
      <div className="retroListHeader">
        <h2 className="retroSectionTitlePixel">Liked Songs &amp; Favorites</h2>
        <span className="retroCountBadge">{displayTracks.length} tracks</span>
      </div>

      <div className="retroTable">
        <div className="retroTableHeader">
          <div className="thCol idx">#</div>
          <div className="thCol title">TITLE</div>
          <div className="thCol artist">ARTIST</div>
          <div className="thCol genre">GENRE</div>
          <div className="thCol time">
            <Clock size={15} />
          </div>
          <div className="thCol action"></div>
        </div>

        {displayTracks.map((song, i) => {
          const isCurrent = player.current?.id === song.id;
          const isPlaying = isCurrent && player.isPlaying;
          const isLiked = likedTrackIds.has(song.id);

          return (
            <div
              key={song.id}
              className={`retroTableRow ${isCurrent ? 'activeRow' : ''}`}
              onClick={() => handlePlaySong(song)}
            >
              <div className="tdCol idx">{isPlaying ? '▶' : i + 1}</div>
              <div className="tdCol title">
                <img src={song.coverUrl || ''} alt={song.title} className="tableRowThumb" />
                <span className="tableSongTitlePixel">{song.title}</span>
              </div>
              <div className="tdCol artist">{song.artist}</div>
              <div className="tdCol genre">
                <span className="genreBadgeSmall">{song.genre || 'Classic'}</span>
              </div>
              <div className="tdCol time">{formatTime(song.duration)}</div>
              <div className="tdCol action" onClick={(e) => e.stopPropagation()}>
                <button
                  className="tableRowHeartBtn"
                  onClick={() => toggleLike(song as any)}
                  title="Toggle Favorite"
                >
                  <Heart
                    size={17}
                    fill={isLiked ? '#000' : 'none'}
                    color="#000"
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
