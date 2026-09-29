import { useEffect, useState } from 'react';
import { Play, Pause, Plus, ListMusic } from 'lucide-react';
import { Playlist, Track } from '../types';
import { api } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useNavigate } from 'react-router-dom';

interface FavoritePlaylistsProps {
  onPlaylistSelect?: (playlist: Playlist) => void;
  limit?: number;
}

export default function FavoritePlaylists({
  onPlaylistSelect,
  limit = 4,
}: FavoritePlaylistsProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const player = usePlayerStore();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function loadPlaylists() {
      setIsLoading(true);
      setError(null);
      try {
        const [publicLists, myLists] = await Promise.all([
          api.getPlaylists().catch(() => []),
          api.getMyPlaylists().catch(() => []),
        ]);

        if (!mounted) return;

        // Merge my playlists and public playlists (unique by ID)
        const map = new Map<string, Playlist>();
        myLists.forEach((p) => map.set(p.id, p));
        publicLists.forEach((p) => {
          if (!map.has(p.id)) map.set(p.id, p);
        });

        const list = Array.from(map.values());
        setPlaylists(list);
        setIsLoading(false);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Failed to load playlists');
        setIsLoading(false);
      }
    }

    loadPlaylists();
    return () => {
      mounted = false;
    };
  }, []);

  const handleTogglePlaylist = async (pl: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    const isThisPlaying = player.isPlaying && player.activePlaylistId === pl.id;

    if (isThisPlaying) {
      player.pause();
      return;
    }

    try {
      // If playlist doesn't have detailed tracks loaded, fetch them
      let trackList: Track[] = [];
      if (pl.tracks && Array.isArray(pl.tracks) && pl.tracks.length > 0) {
        trackList = pl.tracks.map((item: any) => item.track || item);
      } else {
        const full = await api.getPlaylist(pl.id);
        if (full.tracks && Array.isArray(full.tracks)) {
          trackList = full.tracks.map((item: any) => item.track || item);
        }
      }

      if (trackList.length > 0) {
        player.playPlaylist(pl.id, trackList[0], trackList);
      } else {
        navigate(`/playlist/${pl.id}`);
      }
    } catch {
      navigate(`/playlist/${pl.id}`);
    }

    if (onPlaylistSelect) onPlaylistSelect(pl);
  };

  const displayedPlaylists = limit ? playlists.slice(0, limit) : playlists;

  return (
    <div className="favoritePlaylistsSection">
      {/* Heading */}
      <div className="favPlaylistsHeaderRow">
        <h2 className="favPlaylistsHeadingPixel">
          Favorite Playlists {playlists.length > 0 && `(${playlists.length})`}
        </h2>
        <button
          className="createPlaylistHeaderBtn"
          onClick={() => navigate('/library')}
          aria-label="Create new playlist"
          title="Create Playlist"
        >
          <Plus size={14} />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Playlists List */}
      <div className="playlistsListWrap">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="playlistRowCard skeletonCard">
              <div className="skeletonBox playlistThumbImg" />
              <div className="playlistMeta">
                <div className="skeletonText skeletonTitle" />
                <div className="skeletonText skeletonArtist" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="playlistEmptyState">
            <p>{error}</p>
          </div>
        ) : displayedPlaylists.length > 0 ? (
          displayedPlaylists.map((pl) => {
            const isThisPlaylistPlaying =
              player.isPlaying && player.activePlaylistId === pl.id;
            const songCount =
              pl._count?.tracks ?? (pl.tracks ? pl.tracks.length : 0);

            return (
              <div
                key={pl.id}
                className={`playlistRowCard ${isThisPlaylistPlaying ? 'activeRow' : ''}`}
                onClick={() => navigate(`/playlist/${pl.id}`)}
                role="button"
                tabIndex={0}
                aria-label={`View playlist ${pl.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(`/playlist/${pl.id}`);
                }}
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
                    <div className="playlistThumbPlaceholder">
                      <ListMusic size={22} />
                    </div>
                  )}
                </div>

                {/* Text Meta */}
                <div className="playlistMeta">
                  <h3 className="playlistTitlePixel">{pl.title}</h3>
                  <span className="playlistCountText">
                    {songCount} {songCount === 1 ? 'song' : 'songs'} in this list
                  </span>
                </div>

                {/* Round Play Button */}
                <button
                  className={`playlistPlayCircleBtn ${isThisPlaylistPlaying ? 'playing' : ''}`}
                  onClick={(e) => handleTogglePlaylist(pl, e)}
                  aria-label={isThisPlaylistPlaying ? `Pause ${pl.title}` : `Play ${pl.title}`}
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
          })
        ) : (
          <div className="playlistEmptyState">
            <p>No playlists found yet.</p>
            <button
              className="retroOutlineBtn"
              onClick={() => navigate('/library')}
            >
              Create Your First Playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
