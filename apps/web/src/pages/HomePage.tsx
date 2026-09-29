import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic2, Radio, Users, Sparkles, ArrowRight, Disc3 } from 'lucide-react';
import Turntable from '../components/Turntable';
import MusicCategories from '../components/MusicCategories';
import UpNextQueue from '../components/UpNextQueue';
import FavoritePlaylists from '../components/FavoritePlaylists';
import { api } from '../services/api';
import type { PodcastShow } from '../types';

export default function HomePage() {
  const [isTurntableExpanded, setIsTurntableExpanded] = useState(false);
  const [podcastPicks, setPodcastPicks] = useState<PodcastShow[]>([]);
  const [liveRooms, setLiveRooms] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api
      .getPodcastShows()
      .then((data) => {
        if (mounted && data) {
          setPodcastPicks(data.slice(0, 3));
        }
      })
      .catch(() => {});

    api
      .getRooms()
      .then((data) => {
        if (mounted && data) {
          setLiveRooms(data.slice(0, 3));
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="retroHomeFlow">
      {/* Content Switcher Header Bar (Requirement 9) */}
      <div className="homeContentSwitcherRow">
        <div className="retroContentSwitcher" role="tablist" aria-label="Content Experience">
          <button
            className="switcherPill active"
            role="tab"
            aria-selected="true"
          >
            MUSIC
          </button>
          <button
            className="switcherPill"
            onClick={() => navigate('/podcasts')}
            role="tab"
            aria-selected="false"
          >
            PODCASTS
          </button>
          <button
            className="switcherPill"
            onClick={() => navigate('/live')}
            role="tab"
            aria-selected="false"
          >
            LIVE
          </button>
        </div>
      </div>

      {/* Main Dual-Column Grid Stage (Turntable + Music Discovery + Queue + Playlists) */}
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

      {/* Ecosystem Row 1: PODCAST PICKS (Requirement 8) */}
      {!isTurntableExpanded && (
        <section className="homeEcosystemSection" aria-label="Podcast Picks">
          <div className="ecosystemSectionHeader">
            <div className="ecosystemHeaderLeft">
              <Mic2 size={16} />
              <h2 className="ecosystemHeadingPixel">PODCAST PICKS</h2>
            </div>
            <button
              className="ecosystemViewAllBtn"
              onClick={() => navigate('/podcasts')}
              aria-label="View all podcasts"
            >
              <span>View all</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="ecosystemCardsGrid">
            {podcastPicks.length > 0 ? (
              podcastPicks.map((show) => (
                <div
                  key={show.id}
                  className="ecosystemCardItem"
                  onClick={() => navigate(`/podcast/${show.id}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open podcast: ${show.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/podcast/${show.id}`);
                  }}
                >
                  <div className="ecosystemCoverWrap">
                    {show.coverUrl || show.art ? (
                      <img src={show.coverUrl || show.art} alt="" className="ecosystemCoverImg" />
                    ) : (
                      <div className="ecosystemFallbackCover">
                        <Mic2 size={24} />
                      </div>
                    )}
                    {show.category && (
                      <span className="ecosystemCardTag">{show.category}</span>
                    )}
                  </div>
                  <div className="ecosystemCardInfo">
                    <span className="ecosystemCardTitle">{show.title}</span>
                    <span className="ecosystemCardSub">{show.author}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="ecosystemEmptyNotice">
                <span>No podcasts available yet. Discover episodes on the dedicated Podcasts hub.</span>
                <button
                  className="ecosystemEmptyAction"
                  onClick={() => navigate('/podcasts')}
                >
                  EXPLORE PODCASTS →
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Ecosystem Row 2: LIVE NOW (Requirement 8) */}
      {!isTurntableExpanded && (
        <section className="homeEcosystemSection" aria-label="Live Now Broadcasts">
          <div className="ecosystemSectionHeader">
            <div className="ecosystemHeaderLeft">
              <span className="liveBlinkDot" />
              <Radio size={16} />
              <h2 className="ecosystemHeadingPixel">LIVE NOW</h2>
            </div>
            <button
              className="ecosystemViewAllBtn"
              onClick={() => navigate('/live')}
              aria-label="View all live listening rooms"
            >
              <span>View all</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="ecosystemCardsGrid">
            {liveRooms.length > 0 ? (
              liveRooms.map((room) => {
                const listenerCount = room.memberCount || (room.members ? room.members.length : 0);
                return (
                  <div
                    key={room.code}
                    className="ecosystemCardItem liveCardMini"
                    onClick={() => navigate(`/room/${room.code}`)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Join live room: ${room.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') navigate(`/room/${room.code}`);
                    }}
                  >
                    <div className="ecosystemCoverWrap">
                      <div className="livePillTag">
                        <span className="liveBlinkDot" />
                        <span>LIVE</span>
                      </div>
                      <div className="liveDiscThumbWrap">
                        <Disc3 size={32} className="liveMiniDisc" />
                      </div>
                      <div className="liveMiniListenerCount">
                        <Users size={11} />
                        <span>{listenerCount}</span>
                      </div>
                    </div>
                    <div className="ecosystemCardInfo">
                      <span className="ecosystemCardTitle">{room.name}</span>
                      <span className="ecosystemCardSub">{room.genre || 'Communal Vinyl'} · {room.hostName || 'Host'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="ecosystemEmptyNotice">
                <span>No live sessions right now. Host your own synchronized vinyl room.</span>
                <button
                  className="ecosystemEmptyAction"
                  onClick={() => navigate('/live')}
                >
                  START LIVE SESSION →
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
