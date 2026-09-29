import { useState } from 'react';
import Turntable from '../components/Turntable';
import MusicCategories from '../components/MusicCategories';
import UpNextQueue from '../components/UpNextQueue';
import FavoritePlaylists from '../components/FavoritePlaylists';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [isTurntableExpanded, setIsTurntableExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={`retroGridStage ${isTurntableExpanded ? 'expandedTurntableMode' : ''}`}>
      {/* Left Column: Realistic Vinyl Turntable Player */}
      <section className="turntableStageArea" aria-label="Vinyl Turntable Deck">
        <Turntable
          isExpanded={isTurntableExpanded}
          onExpandToggle={() => setIsTurntableExpanded(!isTurntableExpanded)}
        />
      </section>

      {/* Right Column: Music Categories, Up Next Queue, and Favorite Playlists */}
      {!isTurntableExpanded && (
        <section className="discoveryStageArea" aria-label="Music Discovery">
          {/* Music Categories Carousel */}
          <MusicCategories onViewAll={() => navigate('/search')} />

          {/* Up Next Playback Queue (Requirement 1 & 2) */}
          <UpNextQueue />

          {/* Favorite Playlists Section */}
          <FavoritePlaylists />
        </section>
      )}
    </div>
  );
}
