import { useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { api } from '../services/api';
import { Playlist } from '../types';

interface FavoritePlaylistsProps {
  onPlaylistSelect?: (playlist: Playlist) => void;
  limit?: number;
}

export default function FavoritePlaylists({ onPlaylistSelect, limit = 6 }: FavoritePlaylistsProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const player = usePlayerStore();

  const fetchPlaylists = () => {
    setLoading(true);
    setError(null);
    api
      .getPlaylists()
      .then((data) => {
        setPlaylists(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load playlists');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const displayedPlaylists = limit ? playlists.slice(0, limit) : playlists;

  const handleTogglePlaylist = (pl: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    const isThisPlaying = player.isPlaying && player.activePlaylistId === pl.id;

    if (isThisPlaying) {
      player.pause();
    } else {
      const tracks = (pl.tracks || []).map((t: any) => t.track || t);
      if (tracks.length > 0) {
        player.playPlaylist(pl.id, tracks[0], tracks);
      } else {
        // Fetch full playlist detail if tracks not present in overview
        api
          .getPlaylist(pl.id)
          .then((fullPl) => {
            const fullTracks = (fullPl.tracks || []).map((t: any) => t.track || t);
            if (fullTracks.length > 0) {
              player.playPlaylist(pl.id, fullTracks[0], fullTracks);
            }
          })
          .catch(() => {});
      }
    }
    if (onPlaylistSelect) onPlaylistSelect(pl);
  };

  if (loading) {
    return (
      <div className="favoritePlaylistsSection">
        <h2 className="favPlaylistsHeadingPixel">Favorite Playlists</h2>
        <div className="retroLoadingMsg" style={{ margin: '12px 0' }}>Loading playlists...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favoritePlaylistsSection">
        <h2 className="favPlaylistsHeadingPixel">Favorite Playlists</h2>
        <div className="retroEmptyStateContainer" style={{ padding: '16px 0' }}>
          <p style={{ color: '#c00' }}>{error}</p>
          <button className="retroBlackBtn" onClick={fetchPlaylists} style={{ marginTop: 8 }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="favoritePlaylistsSection">
        <h2 className="favPlaylistsHeadingPixel">Favorite Playlists (0)</h2>
        <div className="retroEmptyStateContainer" style={{ padding: '16px 0' }}>
          <p>No playlists found in catalog.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favoritePlaylistsSection">
      {/* Heading */}
      <h2 className="favPlaylistsHeadingPixel">
        Favorite Playlists ({playlists.length})
      </h2>

      {/* Playlists List */}
      <div className="playlistsListWrap">
        {displayedPlaylists.map((pl) => {
          const isThisPlaylistPlaying = player.isPlaying && player.activePlaylistId === pl.id;
          const trackCount = pl._count?.tracks ?? pl.tracks?.length ?? 0;

          return (
            <div
              key={pl.id}
              className={`playlistRowCard ${isThisPlaylistPlaying ? 'activeRow' : ''}`}
              onClick={(e) => handleTogglePlaylist(pl, e)}
              title={isThisPlaylistPlaying ? `Pause ${pl.title}` : `Play ${pl.title}`}
            >
              {/* Thumbnail */}
              <div className="playlistThumbWrap">
                {pl.coverUrl ? (
                  <img
                    src={pl.coverUrl}
                    alt={pl.title}
                    className="playlistThumbImg"
                    loading="lazy"
                  />
                ) : (
                  <div className="tableRowThumb placeholder" style={{ width: '100%', height: '100%' }} />
                )}
              </div>

              {/* Text Meta */}
              <div className="playlistMeta">
                <h3 className="playlistTitlePixel">{pl.title}</h3>
                <span className="playlistCountText">{trackCount} songs in this list</span>
              </div>

              {/* Round Play Button */}
              <button
                className={`playlistPlayCircleBtn ${isThisPlaylistPlaying ? 'playing' : ''}`}
                onClick={(e) => handleTogglePlaylist(pl, e)}
                title={isThisPlaylistPlaying ? 'Pause' : 'Play playlist'}
                aria-label={isThisPlaylistPlaying ? 'Pause playlist' : 'Play playlist'}
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
