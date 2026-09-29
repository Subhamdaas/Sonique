import {
  Home,
  Heart,
  Library,
  Radio,
  SlidersHorizontal,
  Compass,
  Crown,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface RetroSidebarProps {
  onOpenEqualizer?: () => void;
}

export default function RetroSidebar({ onOpenEqualizer }: RetroSidebarProps) {
  const { user } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Home Dashboard', icon: <Home size={20} /> },
    { to: '/search', label: 'Explore & Search', icon: <Compass size={20} /> },
    { to: '/library', label: 'Your Library', icon: <Library size={20} /> },
    { to: '/liked-songs', label: 'Liked Songs', icon: <Heart size={20} /> },
    { to: '/listen-together', label: 'Listen Together (Sync Rooms)', icon: <Radio size={20} /> },
  ];

  return (
    <nav className="retroSidebarNav" aria-label="Main Navigation">
      <div className="retroSidebarGroup">
        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
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
      </div>

      <div className="retroSidebarDivider" />

      {/* Feature & Tools Group */}
      <div className="retroSidebarGroup">
        {onOpenEqualizer && (
          <button
            className="retroNavIconBtn"
            onClick={onOpenEqualizer}
            title="Studio Equalizer"
            aria-label="Studio Equalizer"
          >
            <SlidersHorizontal size={20} />
          </button>
        )}

        <NavLink
          to="/premium"
          className={({ isActive }) =>
            `retroNavIconBtn ${isActive ? 'active' : ''}`
          }
          title="Audiophile Premium"
          aria-label="Audiophile Premium"
        >
          <Crown size={20} />
        </NavLink>

        <NavLink
          to="/creator"
          className={({ isActive }) =>
            `retroNavIconBtn ${isActive ? 'active' : ''}`
          }
          title="Creator Studio"
          aria-label="Creator Studio"
        >
          <Sparkles size={20} />
        </NavLink>

        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `retroNavIconBtn ${isActive ? 'active' : ''}`
            }
            title="Admin Console"
            aria-label="Admin Console"
          >
            <ShieldCheck size={20} />
          </NavLink>
        )}
      </div>
    </nav>
  );
}
