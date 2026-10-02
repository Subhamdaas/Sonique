import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc3, Heart, Plus, Play, Pause, Clock, Music, X } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useAuthStore } from '../store/authStore';

export default function LibraryPage() {
  const navigate = useNavigate();
  const player = usePlayerStore();
  const { user } = useAuthStore();
  const {
    myPlaylists,
    likedTracks,
    isLoading,
    error,
    fetchLibrary,
    createPlaylist,
  } = useLibraryStore();

  const [newTitle, setNewTitle] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      const pl = await createPlaylist({ title: newTitle.trim() });
      setNewTitle('');
      setShowCreateModal(false);
      if (pl && pl.id) {
        navigate(`/playlist/${pl.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const playLiked = () => {
    if (likedTracks.length > 0) {
      player.setCurrent(likedTracks[0], likedTracks);
    }
  };

  const formatDuration = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="retroDetailPage">
      {/* Header */}
      <div className="retroSectionHeader">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="retroDetailTitle">Your Sound Library</h1>
            <p className="retroDetailDesc">
              Your saved playlists, high-fidelity favorites, and custom audio collections.
            </p>
          </div>
          <button
            className="retroPrimaryActionBtn"
            onClick={() => setShowCreateModal(true)}
            aria-label="Create new playlist"
          >
            <Plus size={15} />
            <span>NEW PLAYLIST</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="retroLoadingMsg" style={{ margin: '16px 0' }}>Loading your library...</div>
      )}

      {error && (
        <div className="retroEmptyStateContainer" style={{ margin: '16px 0', padding: '16px' }}>
          <p style={{ color: '#c00' }}>{error}</p>
          <button className="retroBlackBtn" onClick={fetchLibrary} style={{ marginTop: 8 }}>
            Retry
          </button>
        </div>
      )}

      {/* Playlists Cards Section */}
      <section style={{ margin: '24px 0' }}>
        <div className="sectionSubHeader">
          <h2 className="sectionTitlePixel">PLAYLISTS & MIXES ({myPlaylists.length + 1})</h2>
        </div>

        <div className="retroBrowseGrid">
          {/* Liked Songs Special Tile */}
          <div
            className="retroGenreTile"
            onClick={() => navigate('/liked-songs')}
            role="button"
            tabIndex={0}
            aria-label="Open liked songs"
            style={{ background: '#ffffff', borderColor: '#000000' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: '#000000',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart size={18} fill="#ffffff" />
              </div>
              <div>
                <span className="retroGenreTitle">Liked Songs</span>
                <p style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                  {likedTracks.length} tracks in collection
                </p>
              </div>
            </div>
            <span className="retroGenreAction">OPEN →</span>
          </div>

          {myPlaylists.map((pl) => (
            <div
              key={pl.id}
              className="retroGenreTile"
              onClick={() => navigate(`/playlist/${pl.id}`)}
              role="button"
              tabIndex={0}
              aria-label={`Open ${pl.title}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {pl.coverUrl ? (
                  <img
                    src={pl.coverUrl}
                    alt=""
                    style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '1px solid #000' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: '#000000',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Disc3 size={18} />
                  </div>
                )}
                <div>
                  <span className="retroGenreTitle">{pl.title}</span>
                  <p style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                    {(pl as any).songCount || ((pl as any)._count?.tracks ?? (Array.isArray((pl as any).tracks) ? (pl as any).tracks.length : 0))} tracks
                  </p>
                </div>
              </div>
              <span className="retroGenreAction">PLAYLIST →</span>
            </div>
          ))}
        </div>
      </section>

      {/* Liked Songs Quick Table */}
      <section style={{ margin: '28px 0' }}>
        <div className="sectionSubHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="sectionTitlePixel">FAVORITE TRACKS ({likedTracks.length})</h2>
          {likedTracks.length > 0 && (
            <button
              className="retroSmallActionBtn"
              onClick={playLiked}
              aria-label="Play all liked songs"
            >
              <Play size={12} fill="#000" />
              <span>PLAY ALL</span>
            </button>
          )}
        </div>

        {likedTracks.length > 0 ? (
          <div className="retroTable" style={{ background: '#ffffff', border: '1.5px solid #000', borderRadius: 14 }}>
            <div className="retroTableHeader">
              <div className="colNum">#</div>
              <div className="colTitle">TITLE & ARTIST</div>
              <div className="colAlbum">ALBUM</div>
              <div className="colDuration">
                <Clock size={14} />
              </div>
            </div>

            {likedTracks.slice(0, 8).map((song, idx) => {
              const isCurrent = player.current?.id === song.id;
              const isPlaying = isCurrent && player.isPlaying;

              return (
                <div
                  key={song.id || idx}
                  className={`retroTableRow ${isCurrent ? 'activeRow' : ''}`}
                  onClick={() => player.setCurrent(song, likedTracks)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Play ${song.title}`}
                >
                  <div className="tdCol idx">
                    {isPlaying ? <span>▶</span> : idx + 1}
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
                  <div className="tdCol album">{song.album || 'Single'}</div>
                  <div className="tdCol time">{formatDuration(song.duration || 215)}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="retroEmptyStateContainer">
            <h2>No Liked Tracks Yet</h2>
            <p>Tap the heart icon on any song on the Turntable or in Search to collect it here.</p>
            <button className="retroBlackBtn" onClick={() => navigate('/search')}>
              Browse Catalog
            </button>
          </div>
        )}
      </section>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div
          className="equalizerModalBackdrop"
          onClick={() => setShowCreateModal(false)}
          role="dialog"
          aria-label="Create Playlist"
        >
          <div
            className="retroPopupCard"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 420 }}
          >
            <div className="popupHeader">
              <div className="popupTitleWrap">
                <Disc3 size={18} />
                <span className="popupTitlePixel">CREATE PLAYLIST</span>
              </div>
              <button
                className="popupCloseBtn"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close dialog"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
              <div className="retroFormField">
                <label className="retroFormLabel">PLAYLIST TITLE</label>
                <input
                  type="text"
                  className="retroFormInput"
                  placeholder="e.g. Midnight Vinyl Session"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="modalActionsRow" style={{ marginTop: 10 }}>
                <button
                  type="button"
                  className="retroSecondaryActionBtn"
                  onClick={() => setShowCreateModal(false)}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="retroPrimaryActionBtn"
                  disabled={creating || !newTitle.trim()}
                >
                  {creating ? 'CREATING...' : 'CREATE PLAYLIST →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
