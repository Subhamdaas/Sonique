import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Heart, Play, Pause, Clock } from 'lucide-react';
import AppShell from './components/AppShell';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';
import {
  AlbumPage,
  ArtistPage,
  EpisodePage,
  PlaylistPage,
  PodcastPage,
} from './pages/DetailPages';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { ProfilePage, CreatorPage, AdminPage, PricingPage } from './pages/OtherPages';
import ListenTogetherPage from './pages/ListenTogetherPage';
import { SongRow } from './components/media';
import { useLibraryStore } from './store/libraryStore';
import { usePlayerStore } from './store/playerStore';
import { useAuthStore } from './store/authStore';
import './styles.css';

function BrowsePage() {
  const navigate = useNavigate();
  const categories = [
    { name: 'Electronic', color: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
    { name: 'Synthwave', color: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
    { name: 'Dream Pop', color: 'linear-gradient(135deg, #f43f5e, #fb923c)' },
    { name: 'Lofi', color: 'linear-gradient(135deg, #10b981, #059669)' },
    { name: 'Acoustic', color: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { name: 'Ambient', color: 'linear-gradient(135deg, #6366f1, #a855f7)' },
    { name: 'Indie Folk', color: 'linear-gradient(135deg, #14b8a6, #0284c7)' },
    { name: 'Podcasts', color: 'linear-gradient(135deg, #64748b, #334155)' },
  ];

  return (
    <div className="pageContent" style={{ paddingTop: 20 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 20px 0' }}>Explore All Genres</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {categories.map((cat) => (
          <div
            key={cat.name}
            style={{
              background: cat.color,
              height: 140,
              borderRadius: 8,
              padding: 16,
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: 20,
              color: '#fff',
            }}
            onClick={() => navigate(`/search?q=${encodeURIComponent(cat.name)}`)}
          >
            {cat.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function LikedSongsPage() {
  const { likedTracks } = useLibraryStore();
  const { user } = useAuthStore();
  const player = usePlayerStore();

  const isPlayingLiked = likedTracks.some((t) => t.id === player.current?.id) && player.isPlaying;

  const handlePlayToggle = () => {
    if (isPlayingLiked) {
      player.pause();
    } else if (likedTracks.length > 0) {
      player.setCurrent(likedTracks[0], likedTracks);
    }
  };

  return (
    <div>
      {/* Spotify Signature Liked Songs Gradient Header */}
      <div className="detailHeader likedTheme">
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #450af5, #c4efd9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
            flexShrink: 0,
          }}
        >
          <Heart size={84} fill="#fff" color="#fff" />
        </div>
        <div className="detailInfo">
          <div className="detailType">Playlist</div>
          <h1 className="detailTitle">Liked Songs</h1>
          <div className="detailMeta">
            <strong>{user?.name || 'You'}</strong>
            <span>•</span>
            <span>{likedTracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="detailActionRow">
        <button
          className="bigPlayBtn"
          onClick={handlePlayToggle}
          disabled={likedTracks.length === 0}
          aria-label="Play liked songs"
        >
          {isPlayingLiked ? <Pause size={24} fill="#000" /> : <Play size={24} fill="#000" style={{ marginLeft: 3 }} />}
        </button>
      </div>

      {/* Spotify Table */}
      <div className="pageContent">
        {likedTracks.length > 0 ? (
          <div className="spotifyTable">
            <div className="spotifyTableHeader">
              <div>#</div>
              <div>Title</div>
              <div>Album</div>
              <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', paddingRight: 4 }}>
                <Clock size={16} />
              </div>
            </div>
            {likedTracks.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                onPlay={() => player.setCurrent(song, likedTracks)}
              />
            ))}
          </div>
        ) : (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>Songs you like will appear here</h2>
            <p style={{ color: 'var(--text-subdued)' }}>Save songs by tapping the heart icon in any playlist or tracklist.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/listen-together" element={<ListenTogetherPage />} />
          <Route path="/room/:code" element={<ListenTogetherPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/liked-songs" element={<LikedSongsPage />} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />
          <Route path="/album/:id" element={<AlbumPage />} />
          <Route path="/artist/:id" element={<ArtistPage />} />
          <Route path="/podcast/:id" element={<PodcastPage />} />
          <Route path="/episode/:id" element={<EpisodePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/premium" element={<PricingPage />} />
          <Route path="/creator" element={<CreatorPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}
