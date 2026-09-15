import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc3, Heart, List, Play, Plus } from 'lucide-react';
import { SongRow } from '../components/media';
import { Button, SectionHeader } from '../components/ui';
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
    if (!user) {
      navigate('/login');
      return;
    }

    setCreating(true);
    try {
      const pl = await createPlaylist({ title: newTitle.trim() });
      setNewTitle('');
      setShowCreateModal(false);
      navigate(`/playlist/${pl.id}`);
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

  return (
    <div>
      <div className="pageIntro">
        <div>
          <div className="eyebrow">YOUR SPACE</div>
          <h1>Your library</h1>
          <p>A home for the music, playlists, and favorites you want close.</p>
        </div>
        <div className="introActions">
          <Button onClick={() => (user ? setShowCreateModal(true) : navigate('/login'))}>
            <Plus size={16} /> New playlist
          </Button>
        </div>
      </div>

      {showCreateModal && (
        <div
          className="modalBackdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="modalCard"
            style={{
              background: 'var(--surface-raised, #18181b)',
              padding: '24px',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '420px',
              border: '1px solid var(--border, #27272a)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Create new playlist</h2>
            <p style={{ color: 'var(--text-muted, #a1a1aa)', marginBottom: '16px' }}>
              Give your playlist a title to start adding tracks.
            </p>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Midnight Run, Chill Wave..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--surface, #09090b)',
                  border: '1px solid var(--border, #27272a)',
                  borderRadius: '8px',
                  color: '#fff',
                  marginBottom: '16px',
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="soft"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || !newTitle.trim()}>
                  {creating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SectionHeader title="Your playlists" />
      <div className="playlistGrid">
        <div
          className="playlistCard"
          onClick={() => navigate('/liked-songs')}
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25))',
            borderColor: 'rgba(99,102,241,0.3)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              background: 'var(--accent, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Heart size={24} fill="#fff" color="#fff" />
          </div>
          <div>
            <strong>Liked Songs</strong>
            <span>{likedTracks.length} tracks</span>
          </div>
          {likedTracks.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                playLiked();
              }}
              aria-label="Play liked songs"
            >
              <Play size={16} fill="currentColor" />
            </button>
          )}
        </div>

        {myPlaylists.map((pl) => (
          <div
            className="playlistCard"
            key={pl.id}
            onClick={() => navigate('/playlist/' + pl.id)}
          >
            <img
              src={
                pl.coverUrl ||
                pl.art ||
                'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80'
              }
              alt={pl.title}
            />
            <div>
              <strong>{pl.title}</strong>
              <span>
                {pl._count?.tracks ?? (Array.isArray(pl.tracks) ? pl.tracks.length : 0)} tracks
              </span>
            </div>
            <button aria-label="Open playlist">
              <Play size={16} fill="currentColor" />
            </button>
          </div>
        ))}
      </div>

      <SectionHeader
        title="Liked songs"
        action={likedTracks.length > 0 ? 'Play all' : undefined}
        onAction={playLiked}
      />
      {likedTracks.length > 0 ? (
        <div className="listCard">
          {likedTracks.slice(0, 10).map((s, i) => (
            <SongRow
              song={s}
              index={i}
              key={s.id}
              onPlay={() => player.setCurrent(s, likedTracks)}
            />
          ))}
        </div>
      ) : (
        <div className="searchEmpty" style={{ padding: '32px' }}>
          <h3>No liked songs yet</h3>
          <p>Click the heart icon on any song to save it to your library.</p>
        </div>
      )}
    </div>
  );
}
