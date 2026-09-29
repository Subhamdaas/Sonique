import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic2, Radio, Play, Pause, Disc3, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import type { PodcastShow, PodcastEpisode } from '../types';
import { usePlayerStore } from '../store/playerStore';

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function PodcastsPage() {
  const [shows, setShows] = useState<PodcastShow[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const player = usePlayerStore();

  const categories = ['ALL', 'Audiophile & Gear', 'Music History', 'Culture', 'Deep Talks', 'Technology'];

  useEffect(() => {
    let mounted = true;
    const catQuery = selectedCategory === 'ALL' ? undefined : selectedCategory;
    api
      .getPodcastShows(catQuery)
      .then((data) => {
        if (mounted) {
          setShows(data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setShows([]);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  const handlePlayEpisode = (episode: PodcastEpisode, showTitle?: string, showCover?: string | null) => {
    player.setCurrent({
      id: episode.id,
      title: episode.title,
      artist: showTitle || 'Podcast Host',
      duration: episode.duration,
      audioUrl: episode.audioUrl,
      coverUrl: episode.coverUrl || showCover,
      type: 'episode',
    });
  };

  return (
    <div className="retroPodcastsPage">
      {/* Top Header & Content Switcher */}
      <div className="podcastsPageHeader">
        <div className="podcastsHeaderLeft">
          <div className="pageHeaderBadge">
            <Mic2 size={13} />
            <span>SPOKEN WORD & PODCASTS</span>
          </div>
          <h1 className="podcastsMainHeading">Audio Essays & Series</h1>
          <p className="podcastsSubtitle">
            Immersive broadcasts, deep artist conversations, and audiophile gear discussions.
          </p>
        </div>

        {/* Minimal Contextual Switcher (Requirement 9) */}
        <div className="retroContentSwitcher" role="tablist" aria-label="Content Experience">
          <button
            className="switcherPill"
            onClick={() => navigate('/')}
            role="tab"
            aria-selected="false"
          >
            MUSIC
          </button>
          <button
            className="switcherPill active"
            role="tab"
            aria-selected="true"
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

      {/* Podcast Category Pills */}
      <div className="podcastCategoriesRow">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`podcastCatPill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
            aria-label={`Filter by category ${cat}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Shows Grid */}
      {loading ? (
        <div className="retroLoadingMsg">Loading Sonique podcasts...</div>
      ) : shows.length > 0 ? (
        <section className="podcastsShowcaseSection" aria-label="Podcast Shows">
          <div className="sectionSubHeader">
            <h2 className="sectionTitlePixel">POPULAR SHOWS</h2>
            <span className="sectionCountBadge">{shows.length} shows</span>
          </div>

          <div className="podcastsCardsGrid">
            {shows.map((show) => (
              <div
                key={show.id}
                className="podcastCardItem"
                onClick={() => navigate(`/podcast/${show.id}`)}
                role="button"
                tabIndex={0}
                aria-label={`Open podcast: ${show.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(`/podcast/${show.id}`);
                }}
              >
                <div className="podcastCoverContainer">
                  {show.coverUrl || show.art ? (
                    <img
                      src={show.coverUrl || show.art}
                      alt={show.title}
                      className="podcastCoverImg"
                    />
                  ) : (
                    <div className="podcastCoverFallback">
                      <Mic2 size={32} />
                    </div>
                  )}
                  {show.category && (
                    <span className="podcastCatBadge">{show.category}</span>
                  )}
                </div>

                <div className="podcastCardMeta">
                  <h3 className="podcastShowTitle">{show.title}</h3>
                  <span className="podcastAuthorName">{show.author}</span>
                  {show.description && (
                    <p className="podcastShowDesc">{show.description}</p>
                  )}
                  <div className="podcastCardFooter">
                    <span className="podcastEpisodesCount">
                      {show._count?.episodes || show.episodes?.length || 0} episodes
                    </span>
                    <span className="podcastListenAction">VIEW SHOW →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="retroEmptyStateBox" style={{ margin: '40px 0' }}>
          <Mic2 size={36} color="#444" />
          <span className="retroEmptyTitle">No podcasts available yet</span>
          <span className="retroEmptyDesc">
            Check back soon as new high-fidelity creator episodes and audio essays are uploaded.
          </span>
        </div>
      )}

      {/* Featured Episode Spotlight */}
      {shows.length > 0 && shows[0].episodes && shows[0].episodes.length > 0 && (
        <section className="trendingEpisodeSpotlight" aria-label="Featured Episode">
          <div className="sectionSubHeader">
            <h2 className="sectionTitlePixel">LATEST EPISODE SPOTLIGHT</h2>
          </div>

          <div className="spotlightEpisodeCard">
            <div className="spotlightLeft">
              <span className="spotlightBadge">FEATURED RELEASE</span>
              <h3 className="spotlightTitle">{shows[0].episodes[0].title}</h3>
              <span className="spotlightShowName">{shows[0].title} · By {shows[0].author}</span>
              {shows[0].episodes[0].description && (
                <p className="spotlightDesc">{shows[0].episodes[0].description}</p>
              )}
              <div className="spotlightActions">
                <button
                  className="spotlightPlayBtn"
                  onClick={() =>
                    handlePlayEpisode(
                      shows[0].episodes![0],
                      shows[0].title,
                      shows[0].coverUrl,
                    )
                  }
                  aria-label="Play spotlight episode"
                >
                  {player.current?.id === shows[0].episodes[0].id && player.isPlaying ? (
                    <>
                      <Pause size={16} fill="#000" color="#000" />
                      <span>PAUSE EPISODE</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="#000" color="#000" style={{ marginLeft: 2 }} />
                      <span>PLAY EPISODE</span>
                    </>
                  )}
                </button>
                <span className="spotlightDuration">
                  {formatDuration(shows[0].episodes[0].duration)}
                </span>
              </div>
            </div>
            <div className="spotlightRightCover">
              {shows[0].coverUrl ? (
                <img src={shows[0].coverUrl} alt="" className="spotlightImg" />
              ) : (
                <Disc3 size={64} />
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
