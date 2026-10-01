import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Play, Pause, Disc3, Mic2, Music, User, Clock, ArrowRight } from 'lucide-react';
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

  // Synchronize URL search params
  useEffect(() => {
    const urlQ = searchParams.get('q') || '';
    if (urlQ !== q) {
      setQ(urlQ);
    }
  }, [searchParams]);

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
    }, 200);

    return () => clearTimeout(timer);
  }, [q, filterType]);

  const hasResults =
    results.tracks.length > 0 ||
    results.artists.length > 0 ||
    results.albums.length > 0 ||
    results.playlists.length > 0 ||
    results.podcasts.length > 0;

  // Curated Sonique Sound Genres
  const browseCategories = [
    { title: 'Hindi Hits', tag: 'Hindi', color: '#1a1d24', subtitle: 'Arijit Singh, Pritam & Bollywood' },
    { title: 'Odia Classics', tag: 'Odia', color: '#14171f', subtitle: 'Rangabati, Folk & Melody' },
    { title: 'Tollywood Mass', tag: 'Tollywood', color: '#1e2129', subtitle: 'RRR, Pushpa & High Energy' },
    { title: 'Hollywood Viral', tag: 'Hollywood', color: '#111317', subtitle: 'Starboy, The Weeknd & Pop' },
    { title: 'Classic Rock', tag: 'Classic', color: '#191b22', subtitle: 'Queen, Oasis & 70s Legends' },
    { title: 'Electronic & Synth', tag: 'Electronic', color: '#161820', subtitle: 'Daft Punk, Moog & Modular' },
    { title: 'Jazz on Wax', tag: 'Jazz', color: '#1d1f27', subtitle: 'Miles Davis & Blue Note' },
    { title: 'Audiophile Podcasts', tag: 'Audiophile', color: '#171921', subtitle: 'Gear, Acoustics & Vinyl' },
  ];

  const formatDuration = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="retroDetailPage">
      {/* Header Search Console */}
      <div className="retroSectionHeader">
        <h1 className="retroDetailTitle">Catalog & Music Search</h1>
        <p className="retroDetailDesc">
          Search songs, artists, vinyl releases, audio essays, and communal listening sessions.
        </p>
      </div>

      {/* Large Search Input */}
      <div className="searchPillContainer" style={{ maxWidth: 520, margin: '14px 0 20px 0' }}>
        <div className="searchPillBox focused" style={{ background: '#ffffff', padding: '10px 18px' }}>
          <Search size={19} className="searchIcon" />
          <input
            type="text"
            className="searchInput"
            placeholder="Search titles, artists, genres, or albums..."
            value={q}
            onChange={(e) => {
              const val = e.target.value;
              setQ(val);
              setSearchParams(val.trim() ? { q: val } : {});
            }}
            autoFocus
            aria-label="Search music catalog"
          />
        </div>
      </div>

      {/* Filter Category Pills */}
      {q.trim() && (
        <div className="filterPillsScroll" style={{ marginBottom: 20 }}>
          {[
            { id: 'all', label: 'All Catalog' },
            { id: 'tracks', label: 'Songs' },
            { id: 'artists', label: 'Artists' },
            { id: 'albums', label: 'Albums' },
            { id: 'playlists', label: 'Playlists' },
            { id: 'podcasts', label: 'Podcasts' },
          ].map((pill) => (
            <button
              key={pill.id}
              className={`catPill ${filterType === pill.id ? 'selected' : 'outline'}`}
              onClick={() => setFilterType(pill.id)}
            >
              {pill.label}
            </button>
          ))}
        </div>
      )}

      {loading && <div className="retroLoadingMsg">Searching Sonique catalog...</div>}

      {/* When No Query: Browse Genres Grid */}
      {!q.trim() && (
        <section>
          <div className="sectionSubHeader" style={{ margin: '20px 0 14px 0' }}>
            <h2 className="sectionTitlePixel">EXPLORE GENRES & SOUNDSCAPES</h2>
          </div>
          <div className="retroBrowseGrid">
            {browseCategories.map((c, i) => (
              <div
                key={i}
                className="retroGenreTile"
                onClick={() => {
                  setQ(c.tag);
                  setSearchParams({ q: c.tag });
                }}
                role="button"
                tabIndex={0}
                aria-label={`Explore ${c.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setQ(c.tag);
                    setSearchParams({ q: c.tag });
                  }
                }}
              >
                <div>
                  <span className="retroGenreTitle">{c.title}</span>
                  <p style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{c.subtitle}</p>
                </div>
                <span className="retroGenreAction">LISTEN →</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* When Query is Entered */}
      {q.trim() && hasResults && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Top Result + Track Hits */}
          {results.tracks.length > 0 && (
            <section>
              <div className="sectionSubHeader">
                <h2 className="sectionTitlePixel">TRACK RESULTS ({results.tracks.length})</h2>
              </div>

              <div className="retroTable" style={{ background: '#ffffff', border: '1.5px solid #000', borderRadius: 14 }}>
                <div className="retroTableHeader">
                  <div className="colNum">#</div>
                  <div className="colTitle">TITLE & ARTIST</div>
                  <div className="colAlbum">ALBUM</div>
                  <div className="colDuration">
                    <Clock size={14} />
                  </div>
                </div>

                {results.tracks.map((song, idx) => {
                  const isCurrent = player.current?.id === song.id;
                  const isPlaying = isCurrent && player.isPlaying;

                  return (
                    <div
                      key={song.id}
                      className={`retroTableRow ${isCurrent ? 'activeRow' : ''}`}
                      onClick={() => player.setCurrent(song, results.tracks)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Play ${song.title}`}
                      onKeyDown={(e) => e.key === 'Enter' && player.setCurrent(song, results.tracks)}
                    >
                      <div className="tdCol idx">
                        {isPlaying ? (
                          <span style={{ fontWeight: 800 }}>▶</span>
                        ) : (
                          <span>{idx + 1}</span>
                        )}
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
                      <div className="tdCol album">{song.album || song.genre || 'Single'}</div>
                      <div className="tdCol time">{formatDuration(song.duration || 215)}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Artists */}
          {results.artists.length > 0 && (
            <section>
              <div className="sectionSubHeader">
                <h2 className="sectionTitlePixel">ARTISTS ({results.artists.length})</h2>
              </div>
              <div className="cardsCarouselWrap">
                {results.artists.map((a) => (
                  <div
                    key={a.id}
                    className="albumCardItem"
                    onClick={() => navigate(`/artist/${a.id}`)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View artist ${a.name}`}
                  >
                    <div className="cardImageWrap">
                      <img
                        src={a.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                        alt={a.name}
                        className="cardMonochromeImg"
                      />
                    </div>
                    <div className="cardMeta">
                      <h3 className="cardTitlePixel">{a.name}</h3>
                      <p className="cardArtistText">Artist</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {results.albums.length > 0 && (
            <section>
              <div className="sectionSubHeader">
                <h2 className="sectionTitlePixel">ALBUMS ({results.albums.length})</h2>
              </div>
              <div className="cardsCarouselWrap">
                {results.albums.map((al) => (
                  <div
                    key={al.id}
                    className="albumCardItem"
                    onClick={() => navigate(`/album/${al.id}`)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View album ${al.title}`}
                  >
                    <div className="cardImageWrap">
                      <img
                        src={al.coverUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80'}
                        alt={al.title}
                        className="cardMonochromeImg"
                      />
                    </div>
                    <div className="cardMeta">
                      <h3 className="cardTitlePixel">{al.title}</h3>
                      <p className="cardArtistText">{al.artist?.name || 'Artist'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Podcasts */}
          {results.podcasts.length > 0 && (
            <section>
              <div className="sectionSubHeader">
                <h2 className="sectionTitlePixel">PODCASTS ({results.podcasts.length})</h2>
              </div>
              <div className="cardsCarouselWrap">
                {results.podcasts.map((pod) => (
                  <div
                    key={pod.id}
                    className="albumCardItem"
                    onClick={() => navigate(`/podcast/${pod.id}`)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View podcast ${pod.title}`}
                  >
                    <div className="cardImageWrap">
                      <img
                        src={pod.coverUrl || 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80'}
                        alt={pod.title}
                        className="cardMonochromeImg"
                      />
                    </div>
                    <div className="cardMeta">
                      <h3 className="cardTitlePixel">{pod.title}</h3>
                      <p className="cardArtistText">By {pod.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {q.trim() && !loading && !hasResults && (
        <div className="retroEmptyStateContainer">
          <h2>No results found for “{q}”</h2>
          <p>Try searching for artists like Arijit Singh, Daft Punk, Queen, or genres like Hindi, Odia, Rock, or Classic.</p>
          <button className="retroBlackBtn" onClick={() => setQ('')}>
            View All Genres
          </button>
        </div>
      )}
    </div>
  );
}

