import {
  Home,
  Search,
  Library,
  Plus,
  Compass,
  Radio,
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  ListMusic,
  Mic2,
  ChevronLeft,
  ChevronRight,
  Laptop2,
  ArrowDownCircle,
  X,
  User,
} from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { usePlayerStore, setGlobalYouTubePlayer } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useAuthStore } from '../store/authStore';

export function Sidebar() {
  const nav = useNavigate();
  const { user } = useAuthStore();
  const { myPlaylists, fetchLibrary, likedTrackIds } = useLibraryStore();
  const [libFilter, setLibFilter] = useState<'all' | 'playlists' | 'artists' | 'podcasts'>('all');

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  return (
    <aside className="sidebar">
      {/* Main Nav Card */}
      <div className="sidebarCard mainNav">
        <div className="spotifyBrand" onClick={() => nav('/')}>
          <Radio size={24} color="#1ed760" />
          <span>Sonique</span>
        </div>
        <NavLink to="/" className={({ isActive }) => `navItem ${isActive ? 'active' : ''}`}>
          <Home size={22} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `navItem ${isActive ? 'active' : ''}`}>
          <Search size={22} />
          <span>Search</span>
        </NavLink>
        <NavLink to="/browse" className={({ isActive }) => `navItem ${isActive ? 'active' : ''}`}>
          <Compass size={22} />
          <span>Explore</span>
        </NavLink>
        <NavLink to="/listen-together" className={({ isActive }) => `navItem ${isActive ? 'active' : ''}`}>
          <Radio size={22} />
          <span>Live Rooms</span>
          <span style={{ marginLeft: 'auto', background: '#1ed760', color: '#000', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '12px' }}>
            SYNC
          </span>
        </NavLink>
      </div>

      {/* Your Library Card */}
      <div className="sidebarCard libraryCard">
        <div className="libraryHeader">
          <div className="libraryHeaderTitle" onClick={() => nav('/library')}>
            <Library size={22} />
            <span>Your Library</span>
          </div>
          <button
            onClick={() => nav('/library')}
            style={{ background: 'transparent', color: 'var(--text-subdued)', padding: '4px' }}
            title="Create Playlist"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Library Filter Pills */}
        <div className="libraryPills">
          <button
            className={`libraryPill ${libFilter === 'playlists' ? 'active' : ''}`}
            onClick={() => setLibFilter(libFilter === 'playlists' ? 'all' : 'playlists')}
          >
            Playlists
          </button>
          <button
            className={`libraryPill ${libFilter === 'artists' ? 'active' : ''}`}
            onClick={() => setLibFilter(libFilter === 'artists' ? 'all' : 'artists')}
          >
            Artists
          </button>
          <button
            className={`libraryPill ${libFilter === 'podcasts' ? 'active' : ''}`}
            onClick={() => setLibFilter(libFilter === 'podcasts' ? 'all' : 'podcasts')}
          >
            Podcasts
          </button>
        </div>

        {/* Library List Items */}
        <div className="libraryList">
          {/* Liked Songs Special Item */}
          <div className="libraryItem" onClick={() => nav('/liked-songs')}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #450af5, #c4efd9)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
              }}
            >
              <Heart size={20} fill="#fff" />
            </div>
            <div className="libraryItemDetails">
              <strong>Liked Songs</strong>
              <span>Playlist · {likedTrackIds.size} songs</span>
            </div>
          </div>

          {/* User Playlists */}
          {myPlaylists.map((pl) => (
            <div className="libraryItem" key={pl.id} onClick={() => nav(`/playlist/${pl.id}`)}>
              <img
                src={pl.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80'}
                alt={pl.title}
              />
              <div className="libraryItemDetails">
                <strong>{pl.title}</strong>
                <span>Playlist · {pl.owner && typeof pl.owner === 'object' ? pl.owner.name : 'You'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function Topbar() {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isSearchPage = location.pathname.startsWith('/search');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      nav(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AU';

  return (
    <header className="topbar">
      <div className="topbarLeft">
        <button className="navArrowBtn" onClick={() => window.history.back()} title="Go back">
          <ChevronLeft size={20} />
        </button>
        <button className="navArrowBtn" onClick={() => window.history.forward()} title="Go forward">
          <ChevronRight size={20} />
        </button>

        {isSearchPage && (
          <form onSubmit={handleSearch} className="topbarSearch">
            <Search size={18} />
            <input
              type="text"
              placeholder="What do you want to play?"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>
        )}
      </div>

      <div className="topbarRight">
        <button className="pillBadge" onClick={() => nav('/premium')}>
          Explore Premium
        </button>
        <button className="pillBadge dark" onClick={() => nav('/creator')}>
          <ArrowDownCircle size={15} />
          Creator Studio
        </button>
        <div
          className="userProfilePill"
          onClick={() => nav(user ? '/profile' : '/login')}
          title={user ? user.name : 'Sign In'}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}

export function MobileNav() {
  return null;
}

export function PlayerBar() {
  const p = usePlayerStore();
  const c = p.current;
  const { likedTrackIds, toggleLike } = useLibraryStore();
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showDevice, setShowDevice] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const ytMountedRef = useRef(false);

  // YouTube IFrame API Initialization
  useEffect(() => {
    function setupYT() {
      if ((window as any).YT && (window as any).YT.Player && !ytMountedRef.current) {
        ytMountedRef.current = true;
        new (window as any).YT.Player('yt-player-mount', {
          height: '200',
          width: '200',
          videoId: p.youtubeId || 'xvT1jH8B9AM',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (evt: any) => {
              setGlobalYouTubePlayer(evt.target);
              if (p.youtubeId && p.isPlaying) {
                evt.target.loadVideoById(p.youtubeId);
                evt.target.setVolume(Math.round(p.volume * 100));
                evt.target.playVideo();
              }
            },
            onStateChange: (evt: any) => {
              if (evt.data === 0) {
                if (p.repeat === 'one') {
                  evt.target.seekTo(0);
                  evt.target.playVideo();
                } else {
                  p.next();
                }
              }
            },
          },
        });
      }
    }

    if (p.isYouTube) {
      if ((window as any).YT && (window as any).YT.Player) {
        setupYT();
      } else {
        const oldCallback = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          if (oldCallback) oldCallback();
          setupYT();
        };
      }
    }
  }, [p.isYouTube]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        p.toggle();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        p.seek(Math.min(p.duration || 180, p.progress + 5));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        p.seek(Math.max(0, p.progress - 5));
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        if (p.volume > 0) {
          setPrevVolume(p.volume);
          p.setVolume(0);
        } else {
          p.setVolume(prevVolume || 0.8);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [p, prevVolume]);

  const isLiked = c ? likedTrackIds.has(c.id) : false;
  const progressRatio = p.duration > 0 ? (p.progress / p.duration) * 100 : 0;
  const volumeRatio = p.volume * 100;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getArtistText = (item: any) => {
    if (!item) return '';
    if ('artist' in item && typeof item.artist === 'string') return item.artist;
    if ('show' in item && item.show?.author) return item.show.author;
    return 'Artist';
  };

  return (
    <>
      <footer className="playerBar">
        {/* Left Track Info */}
        <div className="playerLeft">
          {c ? (
            <>
              <img
                src={c.coverUrl || c.art || 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=80'}
                alt={c.title}
                className="playerCover"
              />
              <div className="playerTrackMeta">
                <div className="playerTrackTitle">{c.title}</div>
                <div className="playerTrackArtist">{getArtistText(c)}</div>
              </div>
              <button
                className={`rowHeartBtn ${isLiked ? 'liked' : ''}`}
                style={{ opacity: 1, marginLeft: 8 }}
                onClick={() => c && toggleLike(c as any)}
                title={isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
              >
                <Heart size={18} fill={isLiked ? '#1ed760' : 'none'} color={isLiked ? '#1ed760' : 'currentColor'} />
              </button>
            </>
          ) : (
            <div style={{ color: 'var(--text-subdued)', fontSize: 13 }}>
              Select a song to start listening
            </div>
          )}
        </div>

        {/* Center Playback Controls */}
        <div className="playerCenter">
          <div className="playerControls">
            <button
              className={`controlBtn ${p.shuffle ? 'active' : ''}`}
              onClick={p.toggleShuffle}
              title="Enable shuffle"
            >
              <Shuffle size={16} />
            </button>
            <button className="controlBtn" onClick={p.previous} title="Previous track">
              <SkipBack size={18} fill="currentColor" />
            </button>
            <button className="playPauseCircle" onClick={p.toggle} title={p.isPlaying ? 'Pause' : 'Play'}>
              {p.isPlaying ? <Pause size={18} fill="#000" /> : <Play size={18} fill="#000" style={{ marginLeft: 2 }} />}
            </button>
            <button className="controlBtn" onClick={p.next} title="Next track">
              <SkipForward size={18} fill="currentColor" />
            </button>
            <button
              className={`controlBtn ${p.repeat !== 'off' ? 'active' : ''}`}
              onClick={p.cycleRepeat}
              title="Repeat"
            >
              <Repeat size={16} />
            </button>
          </div>

          <div className="progressBarContainer">
            <span className="progressTime">{formatTime(p.progress)}</span>
            <div
              className="customSlider"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                p.seek(ratio * (p.duration || 180));
              }}
            >
              <div className="sliderFilled" style={{ width: `${progressRatio}%` }} />
            </div>
            <span className="progressTime">{formatTime(p.duration || 180)}</span>
          </div>
        </div>

        {/* Right Aux Controls */}
        <div className="playerRight">
          <button
            className={`controlBtn ${showLyrics ? 'active' : ''}`}
            onClick={() => setShowLyrics(!showLyrics)}
            title="Lyrics"
          >
            <Mic2 size={18} />
          </button>
          <button
            className={`controlBtn ${showQueue ? 'active' : ''}`}
            onClick={() => setShowQueue(!showQueue)}
            title="Queue"
          >
            <ListMusic size={18} />
          </button>
          <button
            className={`controlBtn ${showDevice ? 'active' : ''}`}
            onClick={() => setShowDevice(!showDevice)}
            title="Connect to a device"
          >
            <Laptop2 size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 120 }}>
            <button
              className="controlBtn"
              onClick={() => {
                if (p.volume > 0) {
                  setPrevVolume(p.volume);
                  p.setVolume(0);
                } else {
                  p.setVolume(prevVolume || 0.8);
                }
              }}
            >
              {p.volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <div
              className="customSlider"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                p.setVolume(ratio);
              }}
            >
              <div className="sliderFilled" style={{ width: `${volumeRatio}%` }} />
            </div>
          </div>
        </div>
      </footer>

      {/* Hidden YouTube Iframe Mount */}
      <div
        id="yt-player-mount"
        style={{
          position: 'fixed',
          bottom: -1000,
          right: -1000,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Fullscreen Interactive Lyrics View */}
      {showLyrics && (
        <div className="lyricsModal">
          <button className="lyricsCloseBtn" onClick={() => setShowLyrics(false)}>
            <X size={20} />
          </button>
          <div className="lyricsTextWrap">
            <div className="lyricLine active">♪ {c?.title} by {getArtistText(c)} ♪</div>
            <div className="lyricLine">Lost inside the city lights and neon rain</div>
            <div className="lyricLine">Every frequency is resonating through the vein</div>
            <div className="lyricLine">Underneath the midnight skies we find our place</div>
            <div className="lyricLine">Floating in the endless rhythm, lost in space</div>
            <div className="lyricLine">Turn the volume higher, let the bass line grow</div>
            <div className="lyricLine">Feel the energy in motion, letting go</div>
          </div>
        </div>
      )}

      {/* Queue Drawer */}
      {showQueue && (
        <div className="queueDrawer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Queue</h3>
            <button onClick={() => setShowQueue(false)} style={{ background: 'transparent', color: 'var(--text-subdued)' }}>
              <X size={18} />
            </button>
          </div>
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 13, color: 'var(--text-subdued)', fontWeight: 700, marginBottom: 4 }}>Now playing</div>
            {c && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
                <img src={c.coverUrl || c.art || ''} style={{ width: 40, height: 40, borderRadius: 4 }} alt="" />
                <div>
                  <strong style={{ display: 'block', fontSize: 14, color: '#1ed760' }}>{c.title}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-subdued)' }}>{getArtistText(c)}</span>
                </div>
              </div>
            )}
            <div style={{ fontSize: 13, color: 'var(--text-subdued)', fontWeight: 700, marginTop: 12, marginBottom: 4 }}>Next up</div>
            {p.queue.slice(1, 10).map((t, i) => (
              <div
                key={`${t.id}-${i}`}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 4, cursor: 'pointer' }}
                onClick={() => p.setCurrent(t)}
              >
                <img src={t.coverUrl || t.art || ''} style={{ width: 40, height: 40, borderRadius: 4 }} alt="" />
                <div>
                  <strong style={{ display: 'block', fontSize: 14 }}>{t.title}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-subdued)' }}>{getArtistText(t)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connect Device Modal */}
      {showDevice && (
        <div className="queueDrawer" style={{ height: 260 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Connect to a device</h3>
            <button onClick={() => setShowDevice(false)} style={{ background: 'transparent', color: 'var(--text-subdued)' }}>
              <X size={18} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, background: 'rgba(30,215,96,0.1)', border: '1px solid #1ed760', borderRadius: 8 }}>
              <Laptop2 size={24} color="#1ed760" />
              <div>
                <strong style={{ display: 'block', fontSize: 14, color: '#1ed760' }}>Current Web Browser</strong>
                <span style={{ fontSize: 12, color: 'var(--text-subdued)' }}>This computer · High Fidelity Lossless</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
              <Radio size={24} color="var(--text-subdued)" />
              <div>
                <strong style={{ display: 'block', fontSize: 14 }}>Listen Together Room</strong>
                <span style={{ fontSize: 12, color: 'var(--text-subdued)' }}>Broadcast to connected friends in room</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="appShell">
      <Sidebar />
      <main className="mainArea">
        <Topbar />
        {children}
      </main>
      <PlayerBar />
      <MobileNav />
    </div>
  );
}
