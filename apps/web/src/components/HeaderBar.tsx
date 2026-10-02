import { useState, useRef, useEffect } from 'react';
import { Search, Mail, Bell, User, X, Play } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Track } from '../types';
import soniqueLogo from '../assets/sonique-logo.jpg';

interface HeaderBarProps {
  onSearchChange?: (query: string) => void;
  onOpenNotifications?: () => void;
  onOpenMessages?: () => void;
  onOpenProfile?: () => void;
}

export default function HeaderBar({
  onSearchChange,
  onOpenNotifications,
  onOpenMessages,
  onOpenProfile,
}: HeaderBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const player = usePlayerStore();
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle live search with debouncing
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    let isCurrent = true;
    const timeout = setTimeout(() => {
      api
        .search(q, 'tracks')
        .then((res) => {
          if (isCurrent) {
            setSearchResults(res.tracks || []);
          }
        })
        .catch(() => {
          if (isCurrent) {
            setSearchResults([]);
          }
        });
    }, 150);

    if (onSearchChange) onSearchChange(q);
    return () => {
      isCurrent = false;
      clearTimeout(timeout);
    };
  }, [searchQuery, onSearchChange]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTrack = (song: Track) => {
    player.setCurrent(song, searchResults.length > 0 ? searchResults : [song]);
    setIsSearchFocused(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearchFocused(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="retroHeaderBar">
      {/* Left Logo */}
      <div className="retroLogoWrap" onClick={() => navigate('/')} title="Sonique — Music Makes Life Better" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/')}>
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
            placeholder="Search for songs, artists, genres (Press Enter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={handleInputKeyDown}
            aria-label="Search music catalog"
          />
          {searchQuery && (
            <button
              className="clearSearchBtn"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchFocused && searchQuery.trim() && (
          <div className="searchDropdown">
            <div className="searchDropdownHeader">
              <span>Results for "{searchQuery}"</span>
              <span>{searchResults.length} found</span>
            </div>
            {searchResults.length > 0 ? (
              <div className="searchResultsList">
                {searchResults.slice(0, 5).map((song) => (
                  <div
                    key={song.id}
                    className="searchResultItem"
                    onClick={() => handleSelectTrack(song)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Play ${song.title}`}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelectTrack(song)}
                  >
                    {song.coverUrl ? (
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="searchItemThumb"
                      />
                    ) : (
                      <div className="searchItemThumb placeholder" />
                    )}
                    <div className="searchItemMeta">
                      <span className="searchItemTitle">{song.title}</span>
                      <span className="searchItemArtist">{song.artist} • {song.genre || song.album || 'Catalog'}</span>
                    </div>
                    <button className="searchPlayBtn" title="Play on turntable" aria-label={`Play ${song.title}`}>
                      <Play size={14} fill="#000" color="#000" />
                    </button>
                  </div>
                ))}
                <div
                  className="searchDropdownFooter"
                  onClick={() => {
                    setIsSearchFocused(false);
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <span>SEE ALL RESULTS FOR "{searchQuery}" →</span>
                </div>
              </div>
            ) : (
              <div className="noResultsNotice">No tracks found matching "{searchQuery}"</div>
            )}
          </div>
        )}
      </div>

      {/* Right Action Icons */}
      <div className="headerActionsRight">
        <button
          className="headerIconBtn"
          onClick={onOpenMessages}
          title="Messages / Inbox"
          aria-label="Messages"
        >
          <Mail size={19} />
        </button>

        <button
          className="headerIconBtn withBadge"
          onClick={onOpenNotifications}
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="notificationDot" />
        </button>

        {/* Profile Avatar Pill */}
        <div
          className="profileAvatarPill"
          onClick={onOpenProfile}
          title="User Account & Settings"
        >
          <div className="profileAvatarInner">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
