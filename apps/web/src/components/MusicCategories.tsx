import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { api } from '../services/api';
import { Track } from '../types';

interface MusicCategoriesProps {
  onSelectSong?: (song: Track) => void;
  onViewAll?: () => void;
}

export default function MusicCategories({ onSelectSong, onViewAll }: MusicCategoriesProps) {
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [songs, setSongs] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const player = usePlayerStore();
  const carouselRef = useRef<HTMLDivElement>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);

    Promise.all([
      api.getGenres().catch(() => []),
      api.getTracks().catch(() => []),
    ])
      .then(([genresData, tracksData]) => {
        const genreNames = ['All', ...new Set((genresData || []).map((g: any) => g.name).filter(Boolean))];
        if (genreNames.length <= 1) {
          // Fallback canonical genre tags if backend returns no genres
          setCategories(['All', 'Hindi', 'Odia', 'Tollywood', 'Hollywood', 'Classic', 'Rock', 'Electronic', 'Jazz']);
        } else {
          setCategories(genreNames);
        }
        setSongs(tracksData || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load music categories');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter songs based on selected category
  const filteredSongs = songs.filter((song) => {
    if (selectedCategory === 'All') return true;
    return (
      song.genre?.toLowerCase() === selectedCategory.toLowerCase()
    );
  });

  const handleCardClick = (song: Track) => {
    if (player.current?.id === song.id) {
      player.toggle();
    } else {
      player.setCurrent(song, filteredSongs.length > 0 ? filteredSongs : songs);
    }
    if (onSelectSong) onSelectSong(song);
  };

  const handlePlayButtonDirect = (song: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    if (player.current?.id === song.id) {
      player.toggle();
    } else {
      player.setCurrent(song, filteredSongs.length > 0 ? filteredSongs : songs);
    }
    if (onSelectSong) onSelectSong(song);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="musicCategoriesSection">
        <div className="categoriesHeader">
          <h2 className="categoriesHeadingPixel">
            <span>Music</span>
            <span>Categories</span>
          </h2>
        </div>
        <div className="retroLoadingMsg" style={{ margin: '20px 0' }}>Loading catalog...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="musicCategoriesSection">
        <div className="categoriesHeader">
          <h2 className="categoriesHeadingPixel">
            <span>Music</span>
            <span>Categories</span>
          </h2>
        </div>
        <div className="retroEmptyStateContainer" style={{ padding: '16px 0' }}>
          <p style={{ color: '#c00' }}>{error}</p>
          <button className="retroBlackBtn" onClick={fetchData} style={{ marginTop: 8 }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            title="Scroll left"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="carouselArrowBtn"
            onClick={() => scrollCarousel('right')}
            title="Scroll right"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
          <button
            className="viewAllLinkPixel"
            onClick={onViewAll}
            title="View all categories"
          >
            View all
          </button>
        </div>
      </div>

      {/* Filter Pills Row */}
      <div className="filterPillsScroll">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              className={`catPill ${isSelected ? 'selected' : 'outline'}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Cards Carousel Row */}
      <div className="cardsCarouselWrap" ref={carouselRef}>
        {filteredSongs.length > 0 ? (
          filteredSongs.map((song) => {
            const isCurrent = player.current?.id === song.id;
            const isPlayingThis = isCurrent && player.isPlaying;

            return (
              <div
                key={song.id}
                className={`albumCardItem ${isCurrent ? 'activePlaying' : ''}`}
                onClick={() => handleCardClick(song)}
                title={isPlayingThis ? `Pause ${song.title}` : `Play ${song.title}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCardClick(song)}
              >
                {/* Image Container */}
                <div className="cardImageWrap">
                  {song.coverUrl ? (
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="cardMonochromeImg"
                      loading="lazy"
                    />
                  ) : (
                    <div className="cardMonochromeImg placeholder" />
                  )}
                  <div
                    className="cardHoverOverlay"
                    onClick={(e) => handlePlayButtonDirect(song, e)}
                  >
                    <div className="cardPlayIconCircle">
                      {isPlayingThis ? (
                        <Pause size={18} fill="#fff" color="#fff" />
                      ) : (
                        <Play size={18} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
                      )}
                    </div>
                  </div>
                  {isPlayingThis && (
                    <div className="nowPlayingBadgePill">
                      <span>PLAYING</span>
                    </div>
                  )}
                  {isCurrent && !isPlayingThis && (
                    <div className="nowPlayingBadgePill paused">
                      <span>ON DECK</span>
                    </div>
                  )}
                </div>

                {/* Title & Artist */}
                <div className="cardMeta">
                  <h3 className="cardTitlePixel">{song.title}</h3>
                  <p className="cardArtistText">by {song.artist}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="retroEmptyStateContainer" style={{ width: '100%', padding: '20px 0' }}>
            <p>No songs found in category "{selectedCategory}".</p>
          </div>
        )}
      </div>
    </div>
  );
}
