import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppShell from './components/AppShell';
import HomePage from './pages/HomePage';
import MusicPage from './pages/MusicPage';
import SearchPage from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';
import LikedSongsPage from './pages/LikedSongsPage';
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
import PodcastsPage from './pages/PodcastsPage';
import LivePage from './pages/LivePage';
import { api } from './services/api';
import './styles.css';

function BrowsePage() {
  const navigate = useNavigate();
  const [genres, setGenres] = useState<{ name: string; coverUrl?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .getGenres()
      .then((data) => {
        if (mounted) {
          if (data && data.length > 0) {
            setGenres(data);
          } else {
            // Default canonical genres
            setGenres([
              { name: 'Hindi' },
              { name: 'Odia' },
              { name: 'Tollywood' },
              { name: 'Hollywood' },
              { name: 'Classic' },
              { name: 'Rock' },
              { name: 'Electronic' },
              { name: 'Jazz' },
            ]);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setGenres([
            { name: 'Hindi' },
            { name: 'Odia' },
            { name: 'Tollywood' },
            { name: 'Hollywood' },
            { name: 'Classic' },
            { name: 'Rock' },
            { name: 'Electronic' },
            { name: 'Jazz' },
          ]);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="retroDetailPage">
      <div className="retroSectionHeader">
        <h1 className="retroDetailTitle">Explore Music Genres</h1>
        <p className="retroDetailDesc">
          Browse through high-fidelity sonic genres and authentic recordings.
        </p>
      </div>

      {loading ? (
        <div className="retroLoadingMsg">Loading catalog genres...</div>
      ) : (
        <div className="retroBrowseGrid">
          {genres.map((cat) => (
            <div
              key={cat.name}
              className="retroGenreTile"
              onClick={() => navigate(`/search?q=${encodeURIComponent(cat.name)}`)}
              role="button"
              tabIndex={0}
              aria-label={`Explore genre: ${cat.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/search?q=${encodeURIComponent(cat.name)}`);
              }}
            >
              <span className="retroGenreTitle">{cat.name}</span>
              <span className="retroGenreAction">EXPLORE →</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/podcasts" element={<PodcastsPage />} />
          <Route path="/live" element={<LivePage />} />
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
          <Route path="/settings" element={<ProfilePage />} />
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
