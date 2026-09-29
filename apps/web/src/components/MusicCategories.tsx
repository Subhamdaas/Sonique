import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Music2 } from 'lucide-react';
import { Track } from '../types';
import { api } from '../services/api';
import { usePlayerStore } from '../store/playerStore';

interface MusicCategoriesProps {
  onSelectSong?: (song: Track) => void;
  onViewAll?: () => void;
}

export default function MusicCategories({ onSelectSong, onViewAll }: MusicCategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const player = usePlayerStore();
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [genresRes, featuredRes, allTracksRes] = await Promise.all([
          api.getGenres().catch(() => []),
          api.getFeatured().catch(() => ({
            featuredTracks: [],
            topPlaylists: [],
            newReleases: [],
            popularArtists: [],
          })),
          api.getTracks().catch(() => []),
        ]);

        if (!isMounted) return;

        // Collect available genres from backend
        const genreNames = Array.from(
          new Set(
            genresRes
              .map((g) => g.name)
              .concat(
                allTracksRes
                  .map((t) => t.genre)
                  .filter((g): g is string => Boolean(g)),
              ),
          ),
        );

        setCategories(['All', ...genreNames]);

        // Merge featured tracks and all tracks
        const mergedTracks =
          featuredRes.featuredTracks && featuredRes.featuredTracks.length > 0
            ? featuredRes.featuredTracks
            : allTracksRes;

        setTracks(mergedTracks);
        setIsLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load music categories');
        setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter tracks based on selected category
  const filteredTracks = tracks.filter((track) => {
    if (selectedCategory === 'All') return true;
    return track.genre?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleCardClick = (track: Track) => {
    if (player.current?.id === track.id) {
      player.toggle();
    } else {
      player.setCurrent(track, filteredTracks.length ? filteredTracks : tracks);
    }
    if (onSelectSong) onSelectSong(track);
  };

  const handlePlayButtonDirect = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    if (player.current?.id === track.id) {
      player.toggle();
    } else {
      player.setCurrent(track, filteredTracks.length ? filteredTracks : tracks);
    }
    if (onSelectSong) onSelectSong(track);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="musicCategoriesSection">
      {/* Header Row */}
      <div className="categoriesHeader">
        <h2 className="categoriesHeadingPixel">
          <span>Music</span>
          <span>Categories</span>
        </h2>

        <div className="categoriesNavActions">
          <button
            className="carouselArrowBtn"
            onClick={() => scrollCarousel('left')}
            aria-label="Scroll left"
            title="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="carouselArrowBtn"
            onClick={() => scrollCarousel('right')}
            aria-label="Scroll right"
            title="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
          {onViewAll && (
            <button
              className="viewAllLinkPixel"
              onClick={onViewAll}
              aria-label="View all tracks"
              title="View all tracks"
            >
              View all
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills Row */}
      <div className="filterPillsScroll" role="tablist" aria-label="Music Genres">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              className={`catPill ${isSelected ? 'selected' : 'outline'}`}
              onClick={() => setSelectedCategory(cat)}
              role="tab"
              aria-selected={isSelected}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Horizontal Carousel */}
      <div className="carouselTrackViewport" ref={carouselRef}>
        {isLoading ? (
          // Retro Skeleton Loaders
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="retroMusicCard skeletonCard">
              <div className="skeletonBox skeletonCover" />
              <div className="skeletonText skeletonTitle" />
              <div className="skeletonText skeletonArtist" />
            </div>
          ))
        ) : error ? (
          <div className="categoryEmptyState">
            <p>{error}</p>
            <button
              className="retroOutlineBtn"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : filteredTracks.length > 0 ? (
          filteredTracks.map((track) => {
            const isCurrentPlaying =
              player.current?.id === track.id && player.isPlaying;
            const isSelected = player.current?.id === track.id;

            return (
              <div
                key={track.id}
                className={`retroMusicCard ${isSelected ? 'activePlaying' : ''}`}
                onClick={() => handleCardClick(track)}
                role="button"
                tabIndex={0}
                aria-label={`Play ${track.title} by ${track.artist}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick(track);
                  }
                }}
              >
                {/* Artwork Card */}
                <div className="retroMusicCardCover">
                  {track.coverUrl ? (
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="musicCardImg"
                      loading="lazy"
                    />
                  ) : (
                    <div className="musicCardPlaceholder">
                      <Music2 size={32} />
                    </div>
                  )}

                  {/* Play Overlay Button */}
                  <button
                    className={`musicCardPlayOverlay ${isCurrentPlaying ? 'visible' : ''}`}
                    onClick={(e) => handlePlayButtonDirect(track, e)}
                    aria-label={isCurrentPlaying ? 'Pause' : 'Play'}
                  >
                    {isCurrentPlaying ? (
                      <Pause size={18} fill="#fff" />
                    ) : (
                      <Play size={18} fill="#fff" style={{ marginLeft: 2 }} />
                    )}
                  </button>

                  {/* Genre Badge */}
                  {track.genre && (
                    <span className="cardGenrePill">{track.genre}</span>
                  )}
                </div>

                {/* Info Text */}
                <div className="retroMusicCardInfo">
                  <span className="retroMusicCardTitle">{track.title}</span>
                  <span className="retroMusicCardArtist">{track.artist}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="categoryEmptyState">
            <p>No tracks found in {selectedCategory}</p>
          </div>
        )}
      </div>
    </div>
  );
}
