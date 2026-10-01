import { useState, useRef, useEffect } from 'react';
import { Search, Mail, Bell, User, X, Play } from 'lucide-react';
import { initialSongs, RetroSong } from '../data/mockData';
import { usePlayerStore } from '../store/playerStore';
import { useNavigate } from 'react-router-dom';
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
  const [searchResults, setSearchResults] = useState<RetroSong[]>([]);
  const player = usePlayerStore();
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle live search
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const filtered = initialSongs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.genre?.toLowerCase().includes(q)
    );
    setSearchResults(filtered);
    if (onSearchChange) onSearchChange(q);
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

  const handleSelectTrack = (song: RetroSong) => {
    player.setCurrent(song as any, initialSongs as any);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  return (
    <header className="retroHeaderBar">
      {/* Left Logo */}
      <div className="retroLogoWrap" onClick={() => navigate('/')} title="Sonique — Music Makes Life Better">
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
            placeholder="Search for songs, artists"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />
          {searchQuery && (
            <button
              className="clearSearchBtn"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
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
                {searchResults.map((song) => (
                  <div
                    key={song.id}
                    className="searchResultItem"
                    onClick={() => handleSelectTrack(song)}
                  >
                    <img
                      src={song.coverUrl || ''}
                      alt={song.title}
                      className="searchItemThumb"
                    />
                    <div className="searchItemMeta">
                      <span className="searchItemTitle">{song.title}</span>
                      <span className="searchItemArtist">{song.artist} • {song.genre}</span>
                    </div>
                    <button className="searchPlayBtn" title="Play on turntable">
                      <Play size={14} fill="#000" color="#000" />
                    </button>
                  </div>
                ))}
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
