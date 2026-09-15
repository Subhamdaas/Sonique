import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { MediaCard, ArtistCard, PodcastCard, SongRow } from '../components/media';
import { usePlayerStore } from '../store/playerStore';
import { api } from '../services/api';
import { Album, Artist, Playlist, PodcastShow, Track } from '../types';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [q, setQ] = useState(initialQ);
  const [filterType, setFilterType] = useState<string>('all');
  const [results, setResults] = useState<{
    tracks: Track[];
    artists: Artist[];
    albums: Album[];
    playlists: Playlist[];
    podcasts: PodcastShow[];
  }>({
    tracks: [],
    artists: [],
    albums: [],
    playlists: [],
    podcasts: [],
  });
  const [loading, setLoading] = useState(false);
  const player = usePlayerStore();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (q.trim()) {
        setLoading(true);
        api
          .search(q, filterType === 'all' ? undefined : filterType)
          .then((res) => {
            setResults(res);
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      } else {
        setResults({ tracks: [], artists: [], albums: [], playlists: [], podcasts: [] });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [q, filterType]);

  const hasResults =
    results.tracks.length > 0 ||
    results.artists.length > 0 ||
    results.albums.length > 0 ||
    results.playlists.length > 0 ||
    results.podcasts.length > 0;

  // Spotify Browse Genres
  const browseCategories = [
    { title: 'Podcasts', color: '#e13300', img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=300&q=80' },
    { title: 'Live Events', color: '#7358ff', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80' },
    { title: 'Made For You', color: '#1e3264', img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80' },
    { title: 'New Releases', color: '#e8115b', img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80' },
    { title: 'Electronic', color: '#503750', img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=80' },
    { title: 'Pop', color: '#148a08', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80' },
    { title: 'Indie & Folk', color: '#bc5900', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
    { title: 'Chill & Lofi', color: '#d84000', img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=300&q=80' },
    { title: 'Rock', color: '#e91429', img: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=300&q=80' },
    { title: 'Ambient', color: '#8d67ab', img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&q=80' },
  ];

  return (
    <div className="pageContent">
      {/* Search Bar on Page Header */}
      <div style={{ margin: '16px 0 24px 0', maxWidth: 460 }}>
        <div className="topbarSearch" style={{ height: 48, background: '#242424' }}>
          <Search size={20} />
          <input
            type="text"
            placeholder="What do you want to play?"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSearchParams(e.target.value ? { q: e.target.value } : {});
            }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      {q.trim() && (
        <div className="filterPillsRow" style={{ padding: '0 0 20px 0' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'tracks', label: 'Songs' },
            { id: 'artists', label: 'Artists' },
            { id: 'albums', label: 'Albums' },
            { id: 'podcasts', label: 'Podcasts' },
          ].map((pill) => (
            <button
              key={pill.id}
              className={`filterPillBtn ${filterType === pill.id ? 'active' : ''}`}
              onClick={() => setFilterType(pill.id)}
            >
              {pill.label}
            </button>
          ))}
        </div>
      )}

      {loading && <div style={{ padding: 40, color: 'var(--text-subdued)' }}>Searching Spotify catalog...</div>}

      {/* When No Query: Show Spotify Browse All Category Cards */}
      {!q.trim() && (
        <section>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '20px 0 16px 0' }}>Browse all</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {browseCategories.map((c, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: c.color,
                  height: 160,
                  borderRadius: 8,
                  padding: 16,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setQ(c.title);
                  setSearchParams({ q: c.title });
                }}
              >
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff' }}>{c.title}</h3>
                <img
                  src={c.img}
                  alt={c.title}
                  style={{
                    position: 'absolute',
                    width: 90,
                    height: 90,
                    right: -10,
                    bottom: -10,
                    transform: 'rotate(25deg)',
                    borderRadius: 4,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* When Query is Entered */}
      {q.trim() && hasResults && (
        <>
          {/* Top Result + Songs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 24, marginBottom: 32 }}>
            {results.tracks.length > 0 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 16px 0' }}>Top result</h2>
                <div
                  style={{
                    background: 'var(--bg-card)',
                    padding: 20,
                    borderRadius: 8,
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onClick={() => player.setCurrent(results.tracks[0], results.tracks)}
                >
                  <img
                    src={results.tracks[0].coverUrl || 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=80'}
                    style={{ width: 92, height: 92, borderRadius: 6, marginBottom: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                    alt=""
                  />
                  <h3 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px 0' }}>{results.tracks[0].title}</h3>
                  <div style={{ fontSize: 14, color: 'var(--text-subdued)' }}>
                    <span>Song</span> • <strong style={{ color: 'var(--text-bright)' }}>{results.tracks[0].artist}</strong>
                  </div>
                </div>
              </div>
            )}

            {results.tracks.length > 0 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 16px 0' }}>Songs</h2>
                <div className="spotifyTable">
                  {results.tracks.slice(0, 4).map((s, i) => (
                    <SongRow key={s.id} song={s} index={i} onPlay={() => player.setCurrent(s, results.tracks)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Artists */}
          {results.artists.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 16px 0' }}>Artists</h2>
              <div className="cardGrid">
                {results.artists.slice(0, 5).map((a) => (
                  <ArtistCard key={a.id} artist={a} />
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {results.albums.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 16px 0' }}>Albums</h2>
              <div className="cardGrid">
                {results.albums.slice(0, 5).map((al) => (
                  <div className="mediaCard" key={al.id} onClick={() => navigate(`/album/${al.id}`)}>
                    <div className="artWrap">
                      <img src={al.coverUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80'} alt={al.title} />
                    </div>
                    <div className="cardTitle">{al.title}</div>
                    <div className="cardSubtitle">{al.artist?.name || 'Artist'} • {al.releaseYear || 2026}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {q.trim() && !loading && !hasResults && (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>No results found for “{q}”</h2>
          <p style={{ color: 'var(--text-subdued)' }}>Please make sure your words are spelled correctly, or use fewer keywords.</p>
        </div>
      )}
    </div>
  );
}
