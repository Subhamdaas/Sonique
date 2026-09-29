import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import HeaderBar from './HeaderBar';
import RetroSidebar from './RetroSidebar';
import EqualizerModal from './EqualizerModal';
import PersistentPlayerBar from './PersistentPlayerBar';
import { useAuthStore } from '../store/authStore';

export default function AppShell() {
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const hydrate = useAuthStore((s) => s.hydrate);

  // Hydrate auth once when app loads
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="retroWindowWrapper">
      {/* Outer Shell Console */}
      <div className="retroConsoleBezel">
        {/* Top Header */}
        <HeaderBar />

        {/* Console Body: Sidebar + Main Stage */}
        <div className="retroConsoleBody">
          {/* Vertical Icon Navigation Column */}
          <RetroSidebar onOpenEqualizer={() => setIsEqualizerOpen(true)} />

          {/* Main Route Content Area */}
          <main className="retroMainStage" id="main-content">
            <Outlet />
          </main>
        </div>

        {/* Persistent Player Bar across other routes */}
        <PersistentPlayerBar />
      </div>

      {/* Audio Equalizer Modal */}
      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
      />
    </div>
  );
}
