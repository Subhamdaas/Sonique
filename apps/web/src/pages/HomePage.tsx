import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Turntable from '../components/Turntable';
import MusicCategories from '../components/MusicCategories';
import UpNextQueue from '../components/UpNextQueue';
import FavoritePlaylists from '../components/FavoritePlaylists';

export default function HomePage() {
  const [isTurntableExpanded, setIsTurntableExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="retroHomeFlow">
      {/* Main Dual-Column Grid Stage (Turntable + Queue on Left, Categories + Playlists on Right) */}
      <div className={`retroGridStage ${isTurntableExpanded ? 'expandedTurntableMode' : ''}`}>
        {/* Left Column: Realistic Vinyl Turntable Player + Up Next Queue */}
        <section className="turntableStageArea" aria-label="Vinyl Turntable Deck">
          <Turntable
            isExpanded={isTurntableExpanded}
            onExpandToggle={() => setIsTurntableExpanded(!isTurntableExpanded)}
          />

          {!isTurntableExpanded && (
            <div className="turntableQueueWrapper" style={{ marginTop: 20 }}>
              <UpNextQueue />
            </div>
          )}
        </section>

        {/* Right Column: Music Categories & Favorite Playlists */}
        {!isTurntableExpanded && (
          <section className="discoveryStageArea" aria-label="Music Discovery">
            {/* Music Categories Carousel */}
            <MusicCategories onViewAll={() => navigate('/search')} />

            {/* Favorite Playlists Section */}
            <div style={{ marginTop: 24 }}>
              <FavoritePlaylists />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
