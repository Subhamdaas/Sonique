import { useState, useRef, useEffect } from 'react';
import { Search, User, X, Play, LogOut, Disc3, Mic2, Library, Keyboard } from 'lucide-react';
import { api } from '../services/api';
import { Track, Artist, Album, Playlist } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import soniqueLogo from '../assets/sonique-logo.jpg';

interface SearchResultPayload {
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

interface HeaderBarProps {
  onOpenShortcuts?: () => void;
}

export default function HeaderBar({ onOpenShortcuts }: HeaderBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResultPayload>({
    tracks: [],
    artists: [],
    albums: [],
    playlists: [],
  });

  const player = usePlayerStore();
  const { user, logout } = useAuthStore();
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounced search via real API
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setResults({ tracks: [], artists: [], albums: [], playlists: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const data = await api.search(q);
        setResults({
          tracks: data.tracks || [],
          artists: data.artists || [],
          albums: data.albums || [],
          playlists: data.playlists || [],
        });
      } catch {
        setResults({ tracks: [], artists: [], albums: [], playlists: [] });
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTrack = (track: Track) => {
    player.setCurrent(track, results.tracks.length ? results.tracks : [track]);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearchFocused(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const hasResults =
    results.tracks.length > 0 ||
    results.artists.length > 0 ||
    results.albums.length > 0 ||
    results.playlists.length > 0;

  return (
    <header className="retroHeaderBar">
      {/* Left Logo */}
      <div
        className="retroLogoWrap"
        onClick={() => navigate('/')}
        role="button"
        tabIndex={0}
        aria-label="Sonique Home"
        onKeyDown={(e) => {
          if (e.key === 'Enter') navigate('/');
        }}
        title="Sonique — Music Makes Life Better"
      >
        <img
          src={soniqueLogo}
          alt="Sonique Logo"
          className="retroLogoImg"
        />
        <div className="retroLogoBrand">
          <span className="retroLogoTitle">Sonique</span>
          <span className="retroLogoSubtitle">MUSIC MAKES LIFE BETTER</span>
        </div>
      </div>

      {/* Center Search Pill */}
      <div className="searchPillContainer" ref={searchWrapRef}>
        <div className={`searchPillBox ${isSearchFocused ? 'focused' : ''}`}>
          <Search size={17} className="searchIcon" />
          <input
            type="text"
            className="searchInput"
            placeholder="Search songs, artists, albums, playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={handleKeyDown}
            aria-label="Search"
          />
          {searchQuery && (
            <button
              className="clearSearchBtn"
              onClick={() => {
                setSearchQuery('');
                setResults({ tracks: [], artists: [], albums: [], playlists: [] });
              }}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Live Search Dropdown */}
        {isSearchFocused && searchQuery.trim() && (
          <div className="searchResultsDropdown">
            {isSearching ? (
              <div className="searchStatusMsg">Searching catalog...</div>
            ) : hasResults ? (
              <>
                {/* Tracks */}
                {results.tracks.length > 0 && (
                  <div className="searchDropdownSection">
                    <div className="searchSectionTitle">SONGS</div>
                    {results.tracks.slice(0, 5).map((track) => (
                      <div
                        key={track.id}
                        className="searchResultItem"
                        onClick={() => handleSelectTrack(track)}
                      >
                        <div className="searchItemThumb">
                          {track.coverUrl ? (
                            <img src={track.coverUrl} alt="" className="searchThumbImg" />
                          ) : (
                            <Disc3 size={16} />
                          )}
                        </div>
                        <div className="searchItemMeta">
                          <span className="searchItemTitle">{track.title}</span>
                          <span className="searchItemSub">{track.artist}</span>
                        </div>
                        <Play size={14} className="searchPlayIcon" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Artists */}
                {results.artists.length > 0 && (
                  <div className="searchDropdownSection">
                    <div className="searchSectionTitle">ARTISTS</div>
                    {results.artists.slice(0, 3).map((artist) => (
                      <div
                        key={artist.id}
                        className="searchResultItem"
                        onClick={() => {
                          setIsSearchFocused(false);
                          navigate(`/artist/${artist.id}`);
                        }}
                      >
                        <div className="searchItemThumb round">
                          {artist.imageUrl ? (
                            <img src={artist.imageUrl} alt="" className="searchThumbImg round" />
                          ) : (
                            <Mic2 size={16} />
                          )}
                        </div>
                        <div className="searchItemMeta">
                          <span className="searchItemTitle">{artist.name}</span>
                          <span className="searchItemSub">Artist</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Playlists */}
                {results.playlists.length > 0 && (
                  <div className="searchDropdownSection">
                    <div className="searchSectionTitle">PLAYLISTS</div>
                    {results.playlists.slice(0, 3).map((playlist) => (
                      <div
                        key={playlist.id}
                        className="searchResultItem"
                        onClick={() => {
                          setIsSearchFocused(false);
                          navigate(`/playlist/${playlist.id}`);
                        }}
                      >
                        <div className="searchItemThumb">
                          {playlist.coverUrl ? (
                            <img src={playlist.coverUrl} alt="" className="searchThumbImg" />
                          ) : (
                            <Library size={16} />
                          )}
                        </div>
                        <div className="searchItemMeta">
                          <span className="searchItemTitle">{playlist.title}</span>
                          <span className="searchItemSub">Playlist</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className="searchViewAllFooter"
                  onClick={() => {
                    setIsSearchFocused(false);
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  }}
                >
                  View all results for "{searchQuery}"
                </div>
              </>
            ) : (
              <div className="searchStatusMsg">No results found for "{searchQuery}"</div>
            )}
          </div>
        )}
      </div>

      {/* Right User Actions Area */}
      <div className="headerActionsArea">
        {onOpenShortcuts && (
          <button
            className="retroIconCircleBtn"
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts (?)"
            aria-label="Keyboard Shortcuts"
          >
            <Keyboard size={16} />
          </button>
        )}

        {user ? (
          <div className="headerUserPill">
            <button
              className="userProfileBadgeBtn"
              onClick={() => navigate('/profile')}
              aria-label="User Profile"
              title={`Profile (${user.name || user.email})`}
            >
              <div className="userAvatarCircle">
                <User size={15} />
              </div>
              <span className="userNameText">{user.name || user.username || 'My Profile'}</span>
            </button>
            <button
              className="headerLogoutBtn"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              aria-label="Sign Out"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="headerAuthButtons">
            <button
              className="retroTextBtn"
              onClick={() => navigate('/login')}
              aria-label="Sign In"
            >
              Sign In
            </button>
            <button
              className="retroBlackBtn"
              onClick={() => navigate('/register')}
              aria-label="Create Account"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
