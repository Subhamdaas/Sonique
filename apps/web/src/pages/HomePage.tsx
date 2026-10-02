import { useNavigate } from 'react-router-dom';
import MusicCategories from '../components/MusicCategories';
import Turntable from '../components/Turntable';
import FavoritePlaylists from '../components/FavoritePlaylists';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="retroHomeFlow homeVerticalStack">
      {/* 1. First: Music Categories */}
      <section className="homeSection categoriesSectionArea" aria-label="Music Categories">
        <MusicCategories onViewAll={() => navigate('/search')} />
      </section>

      {/* 2. Then: Play Button Bar */}
      <section className="homeSection playBarSectionArea" aria-label="Audio Playback Bar">
        <Turntable variant="compact" />
      </section>

      {/* 3. Then: Favorite Musics */}
      <section className="homeSection favoriteMusicsSectionArea" aria-label="Favorite Music & Playlists">
        <FavoritePlaylists limit={6} />
      </section>
    </div>
  );
}
