import { Home, Heart, Music, Disc3, SlidersHorizontal, Tag } from 'lucide-react';

export type ActiveNavTab = 'home' | 'liked' | 'music' | 'turntable' | 'equalizer' | 'tags';

interface RetroSidebarProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
}

export default function RetroSidebar({ activeTab, onTabChange }: RetroSidebarProps) {
  const navItems: { id: ActiveNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home Dashboard', icon: <Home size={22} /> },
    { id: 'liked', label: 'Liked Songs', icon: <Heart size={22} /> },
    { id: 'music', label: 'All Tracks', icon: <Music size={22} /> },
    { id: 'turntable', label: 'Vinyl Turntable', icon: <Disc3 size={22} /> },
    { id: 'equalizer', label: 'Audio Equalizer', icon: <SlidersHorizontal size={22} /> },
    { id: 'tags', label: 'Music Categories', icon: <Tag size={22} /> },
  ];

  return (
    <nav className="retroSidebarNav">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            className={`retroNavIconBtn ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
            title={item.label}
            aria-label={item.label}
          >
            {item.icon}
          </button>
        );
      })}
    </nav>
  );
}
