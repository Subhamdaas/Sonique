import { Home, Heart, Library, Disc3, SlidersHorizontal, Mic2, Radio } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

export type ActiveNavTab = 'home' | 'liked' | 'music' | 'turntable' | 'equalizer' | 'tags' | 'podcasts' | 'live' | 'library';

interface RetroSidebarProps {
  onOpenEqualizer?: () => void;
  activeTab?: ActiveNavTab;
  onTabChange?: (tab: ActiveNavTab) => void;
}

export default function RetroSidebar({ onOpenEqualizer, activeTab, onTabChange }: RetroSidebarProps) {
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Home Dashboard', icon: <Home size={22} /> },
    { to: '/music', label: 'Music Experience', icon: <Disc3 size={22} /> },
    { to: '/podcasts', label: 'Podcasts & Spoken Audio', icon: <Mic2 size={22} /> },
    { to: '/live', label: 'Live Broadcasts & Rooms', icon: <Radio size={22} /> },
    { to: '/library', label: 'Library', icon: <Library size={22} /> },
    { to: '/liked-songs', label: 'Liked Songs', icon: <Heart size={22} /> },
  ];

  return (
    <nav className="retroSidebarNav" aria-label="Main Navigation">
      {navItems.map((item) => {
        const isActive =
          item.to === '/'
            ? location.pathname === '/' || location.pathname === '/music'
            : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`retroNavIconBtn ${isActive ? 'active' : ''}`}
            title={item.label}
            aria-label={item.label}
          >
            {item.icon}
          </NavLink>
        );
      })}

      {onOpenEqualizer && (
        <button
          className="retroNavIconBtn"
          onClick={onOpenEqualizer}
          title="Audio Equalizer"
          aria-label="Audio Equalizer"
        >
          <SlidersHorizontal size={22} />
        </button>
      )}
    </nav>
  );
}
