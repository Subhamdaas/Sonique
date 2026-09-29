import { Clock, Play, Heart } from 'lucide-react';
import { initialSongs, RetroSong } from '../data/mockData';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';

export default function AllTracksView() {
  const player = usePlayerStore();
  const { likedTrackIds, toggleLike } = useLibraryStore();

  const handlePlay = (song: RetroSong) => {
    player.setCurrent(song as any, initialSongs as any);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="retroListViewWrap">
      <div className="retroListHeader">
        <h2 className="retroSectionTitlePixel">Master Vinyl Library</h2>
        <span className="retroCountBadge">{initialSongs.length} releases</span>
      </div>

      <div className="retroTable">
        <div className="retroTableHeader">
          <div className="thCol idx">#</div>
          <div className="thCol title">TITLE</div>
          <div className="thCol artist">ARTIST</div>
          <div className="thCol album">ALBUM</div>
          <div className="thCol genre">GENRE</div>
          <div className="thCol time">
            <Clock size={15} />
          </div>
          <div className="thCol action"></div>
        </div>

        {initialSongs.map((song, i) => {
          const isCurrent = player.current?.id === song.id;
          const isPlaying = isCurrent && player.isPlaying;
          const isLiked = likedTrackIds.has(song.id);

          return (
            <div
              key={song.id}
              className={`retroTableRow ${isCurrent ? 'activeRow' : ''}`}
              onClick={() => handlePlay(song)}
            >
              <div className="tdCol idx">{isPlaying ? '▶' : i + 1}</div>
              <div className="tdCol title">
                <img src={song.coverUrl || ''} alt={song.title} className="tableRowThumb" />
                <span className="tableSongTitlePixel">{song.title}</span>
              </div>
              <div className="tdCol artist">{song.artist}</div>
              <div className="tdCol album">{song.album || 'Vinyl Single'}</div>
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
