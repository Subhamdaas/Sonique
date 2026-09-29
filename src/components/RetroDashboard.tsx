import { useState } from 'react';
import HeaderBar from './HeaderBar';
import RetroSidebar, { ActiveNavTab } from './RetroSidebar';
import Turntable from './Turntable';
import MusicCategories from './MusicCategories';
import FavoritePlaylists from './FavoritePlaylists';
import LikedSongsView from './LikedSongsView';
import AllTracksView from './AllTracksView';
import EqualizerModal from './EqualizerModal';
import { NotificationModal, ProfileModal } from './RetroModals';
import { RetroSong } from '../data/mockData';
import { usePlayerStore } from '../store/playerStore';

export default function RetroDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('home');
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTurntableExpanded, setIsTurntableExpanded] = useState(false);

  const player = usePlayerStore();

  const handleTabChange = (tab: ActiveNavTab) => {
    if (tab === 'equalizer') {
      setIsEqualizerOpen(true);
    } else {
      setActiveTab(tab);
      if (tab === 'turntable') {
        setIsTurntableExpanded(true);
      } else {
        setIsTurntableExpanded(false);
      }
    }
  };

  return (
    <div className="retroWindowWrapper">
      {/* Outer Shell Console */}
      <div className="retroConsoleBezel">
        {/* Top Header */}
        <HeaderBar
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenMessages={() => setIsNotificationsOpen(true)}
        />

        {/* Console Body: Sidebar + Main Stage */}
        <div className="retroConsoleBody">
          {/* Vertical Icon Navigation Column */}
          <RetroSidebar activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Main Content Area */}
          <main className="retroMainStage">
            {activeTab === 'home' && (
              <div className={`retroGridStage ${isTurntableExpanded ? 'expandedTurntableMode' : ''}`}>
                {/* Left Side: Realistic Vinyl Turntable Player */}
                <section className="turntableStageArea">
                  <Turntable
                    isExpanded={isTurntableExpanded}
                    onExpandToggle={() => setIsTurntableExpanded(!isTurntableExpanded)}
                  />
                </section>

                {/* Right Side: Music Categories & Favorite Playlists */}
                {!isTurntableExpanded && (
                  <section className="discoveryStageArea">
                    <MusicCategories
                      onSelectSong={(song: RetroSong) => {
                        // Song chosen from carousel
                      }}
                      onViewAll={() => setActiveTab('music')}
                    />

                    <FavoritePlaylists />
                  </section>
                )}
              </div>
            )}

            {activeTab === 'turntable' && (
              <div className="expandedTurntableCenter">
                <Turntable
                  isExpanded={true}
                  onExpandToggle={() => setActiveTab('home')}
                />
              </div>
            )}

            {activeTab === 'liked' && (
              <div className="retroSubpageStage">
                <LikedSongsView />
              </div>
            )}

            {activeTab === 'music' && (
              <div className="retroSubpageStage">
                <AllTracksView />
              </div>
            )}

            {activeTab === 'tags' && (
              <div className="retroSubpageStage">
                <MusicCategories onViewAll={() => setActiveTab('music')} />
                <div style={{ marginTop: 24 }}>
                  <FavoritePlaylists />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Hardware Equalizer Modal */}
      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
      />

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
