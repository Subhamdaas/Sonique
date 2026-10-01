import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { initialSongs, categoriesList, RetroSong } from '../data/mockData';
import { usePlayerStore } from '../store/playerStore';

interface MusicCategoriesProps {
  onSelectSong?: (song: RetroSong) => void;
  onViewAll?: () => void;
}

export default function MusicCategories({ onSelectSong, onViewAll }: MusicCategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const player = usePlayerStore();
  const carouselRef = useRef<HTMLDivElement>(null);

  // Filter songs based on selected category
  const filteredSongs = initialSongs.filter((song) => {
    if (selectedCategory === 'All') return true;
    return (
      song.genre?.toLowerCase() === selectedCategory.toLowerCase() ||
      song.badge?.toLowerCase() === selectedCategory.toLowerCase()
    );
  });

  const handleCardClick = (song: RetroSong) => {
    if (player.current?.id === song.id) {
      player.toggle();
    } else {
      // Select onto turntable with full queue loaded so next song plays automatically
      player.setCurrent(song as any, initialSongs as any);
    }
    if (onSelectSong) onSelectSong(song);
  };

  const handlePlayButtonDirect = (song: RetroSong, e: React.MouseEvent) => {
    e.stopPropagation();
    if (player.current?.id === song.id) {
      player.toggle();
    } else {
      player.setCurrent(song as any, initialSongs as any);
    }
    if (onSelectSong) onSelectSong(song);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
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
            title="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="carouselArrowBtn"
            onClick={() => scrollCarousel('right')}
            title="Scroll right"
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
        {categoriesList.map((cat) => {
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
        {filteredSongs.map((song) => {
          const isCurrent = player.current?.id === song.id;
          const isPlayingThis = isCurrent && player.isPlaying;

          return (
            <div
              key={song.id}
              className={`albumCardItem ${isCurrent ? 'activePlaying' : ''}`}
              onClick={() => handleCardClick(song)}
              title={isPlayingThis ? `Pause ${song.title}` : `Play ${song.title}`}
            >
              {/* Image Container with high contrast B&W aesthetic */}
              <div className="cardImageWrap">
                <img
                  src={song.coverUrl || ''}
                  alt={song.title}
                  className="cardMonochromeImg"
                  loading="lazy"
                />
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
        })}
      </div>
    </div>
  );
}
