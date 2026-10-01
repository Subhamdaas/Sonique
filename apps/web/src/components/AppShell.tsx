import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Play, Keyboard, X } from 'lucide-react';
import HeaderBar from './HeaderBar';
import RetroSidebar from './RetroSidebar';
import EqualizerModal from './EqualizerModal';
import { NotificationModal, ProfileModal } from './RetroModals';
import PersistentPlayerBar from './PersistentPlayerBar';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function AppShell() {
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydratePlayback = usePlayerStore((s) => s.hydratePlayback);
  const current = usePlayerStore((s) => s.current);
  const progress = usePlayerStore((s) => s.progress);
  const isAutoplayBlocked = usePlayerStore((s) => s.isAutoplayBlocked);
  const resumeAutoplay = usePlayerStore((s) => s.resumeAutoplay);

  // Hydrate auth and persistent playback once when app mounts
  useEffect(() => {
    hydrateAuth();
    hydratePlayback();
  }, [hydrateAuth, hydratePlayback]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut if user is typing in form inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const player = usePlayerStore.getState();

      if (e.code === 'Space') {
        e.preventDefault();
        player.toggle();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) {
          player.next();
        } else {
          player.seek(player.progress + 5);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) {
          player.previous();
        } else {
          player.seek(player.progress - 5);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        player.toggleMute();
      } else if (e.key === 's' || e.key === 'S') {
        player.toggleShuffle();
      } else if (e.key === 'r' || e.key === 'R') {
        player.cycleRepeat();
      } else if (e.key === '?') {
        setIsShortcutsModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="retroWindowWrapper">
      {/* Outer Shell Console */}
      <div className="retroConsoleBezel">
        {/* Autoplay Resume Banner (Requirement 5) */}
        {isAutoplayBlocked && current && (
          <aside className="autoplayResumeBanner" aria-label="Playback Paused by Browser">
            <div className="resumeBannerLeft">
              <span className="resumePulseDot" />
              <div className="resumeBannerMeta">
                <span className="resumeBannerHeading">AUTOPLAY PAUSED BY BROWSER</span>
                <span className="resumeBannerSub">
                  {current.title} — Position saved at {formatTime(progress)}
                </span>
              </div>
            </div>
            <button
              className="resumeActionBtn"
              onClick={resumeAutoplay}
              aria-label={`Resume playing ${current.title} at ${formatTime(progress)}`}
            >
              <Play size={14} fill="#000" color="#000" />
              <span>RESUME PLAYBACK</span>
            </button>
          </aside>
        )}

        {/* Top Header */}
        <HeaderBar
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenMessages={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Console Body: Sidebar + Main Stage */}
        <div className="retroConsoleBody">
          {/* Vertical Icon Navigation Column */}
          <RetroSidebar
            onOpenEqualizer={() => setIsEqualizerOpen(true)}
          />

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

      {/* Hardware Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Hardware Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Keyboard Shortcuts Helper Modal (Requirement 18) */}
      {isShortcutsModalOpen && (
        <div
          className="equalizerModalBackdrop"
          onClick={() => setIsShortcutsModalOpen(false)}
          role="dialog"
          aria-label="Keyboard Shortcuts"
        >
          <div
            className="retroPopupCard shortcutsModalCard"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="popupHeader">
              <div className="popupTitleWrap">
                <Keyboard size={18} />
                <span className="popupTitlePixel">KEYBOARD SHORTCUTS</span>
              </div>
              <button
                className="popupCloseBtn"
                onClick={() => setIsShortcutsModalOpen(false)}
                aria-label="Close shortcuts dialog"
              >
                <X size={14} />
              </button>
            </div>

            <div className="shortcutsListGrid">
              <div className="shortcutRow">
                <kbd className="shortcutKey">Space</kbd>
                <span className="shortcutAction">Play / Pause</span>
              </div>
              <div className="shortcutRow">
                <kbd className="shortcutKey">→</kbd>
                <span className="shortcutAction">Seek forward 5s</span>
              </div>
              <div className="shortcutRow">
                <kbd className="shortcutKey">←</kbd>
                <span className="shortcutAction">Seek backward 5s</span>
              </div>
              <div className="shortcutRow">
                <kbd className="shortcutKey">Shift + →</kbd>
                <span className="shortcutAction">Next track</span>
              </div>
              <div className="shortcutRow">
                <kbd className="shortcutKey">Shift + ←</kbd>
                <span className="shortcutAction">Previous track</span>
              </div>
              <div className="shortcutRow">
                <kbd className="shortcutKey">M</kbd>
                <span className="shortcutAction">Mute / Unmute</span>
              </div>
              <div className="shortcutRow">
                <kbd className="shortcutKey">S</kbd>
                <span className="shortcutAction">Toggle Shuffle</span>
              </div>
              <div className="shortcutRow">
                <kbd className="shortcutKey">R</kbd>
                <span className="shortcutAction">Cycle Repeat (Off / All / One)</span>
              </div>
              <div className="shortcutRow">
                <kbd className="shortcutKey">?</kbd>
                <span className="shortcutAction">Show / Hide Shortcuts Panel</span>
              </div>
            </div>

            <div className="shortcutFooterNote">
              Shortcuts are inactive while typing in search or input fields.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
