import { Play, Pause } from 'lucide-react';
import { favoritePlaylists, FavoritePlaylist } from '../data/mockData';
import { usePlayerStore } from '../store/playerStore';

interface FavoritePlaylistsProps {
  onPlaylistSelect?: (playlist: FavoritePlaylist) => void;
  limit?: number;
}

export default function FavoritePlaylists({ onPlaylistSelect, limit = 5 }: FavoritePlaylistsProps) {
  const player = usePlayerStore();
  const displayedPlaylists = limit ? favoritePlaylists.slice(0, limit) : favoritePlaylists;

  const handleTogglePlaylist = (pl: FavoritePlaylist, e: React.MouseEvent) => {
    e.stopPropagation();
    const isThisPlaying = player.isPlaying && player.activePlaylistId === pl.id;

    if (isThisPlaying) {
      player.pause();
    } else if (pl.tracks && pl.tracks.length > 0) {
      player.playPlaylist(pl.id, pl.tracks[0] as any, pl.tracks as any);
    }
    if (onPlaylistSelect) onPlaylistSelect(pl);
  };

  return (
    <div className="favoritePlaylistsSection">
      {/* Heading */}
      <h2 className="favPlaylistsHeadingPixel">
        Favorite Playlists ({favoritePlaylists.length})
      </h2>

      {/* Playlists List */}
      <div className="playlistsListWrap">
        {displayedPlaylists.map((pl) => {
          const isThisPlaylistPlaying = player.isPlaying && player.activePlaylistId === pl.id;

          return (
            <div
              key={pl.id}
              className={`playlistRowCard ${isThisPlaylistPlaying ? 'activeRow' : ''}`}
              onClick={(e) => handleTogglePlaylist(pl, e)}
              title={isThisPlaylistPlaying ? `Pause ${pl.title}` : `Play ${pl.title}`}
            >
              {/* Thumbnail */}
              <div className="playlistThumbWrap">
                <img
                  src={pl.coverUrl}
                  alt={pl.title}
                  className="playlistThumbImg"
                  loading="lazy"
                />
              </div>

              {/* Text Meta */}
              <div className="playlistMeta">
                <h3 className="playlistTitlePixel">{pl.title}</h3>
                <span className="playlistCountText">{pl.songCount} songs in this list</span>
              </div>

              {/* Round Play Button */}
              <button
                className={`playlistPlayCircleBtn ${isThisPlaylistPlaying ? 'playing' : ''}`}
                onClick={(e) => handleTogglePlaylist(pl, e)}
                title={isThisPlaylistPlaying ? 'Pause' : 'Play playlist'}
              >
                {isThisPlaylistPlaying ? (
                  <Pause size={18} fill="#000" color="#000" />
                ) : (
                  <Play size={18} fill="#000" color="#000" style={{ marginLeft: 3 }} />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
