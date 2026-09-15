import { useEffect, useState } from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { MediaCard, ArtistCard, PodcastCard } from '../components/media';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Artist, Playlist, PodcastShow, Track } from '../types';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const player = usePlayerStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'all' | 'music' | 'podcasts'>('all');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [recommended, setRecommended] = useState<Track[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastShow[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Spotify Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [featured, recs, podShows] = await Promise.all([
          api.getFeatured().catch(() => ({
            featuredTracks: [],
            topPlaylists: [],
            newReleases: [],
            popularArtists: [],
          })),
          api.getPersonalizedRecommendations(user?.id).catch(() => ({
            recommendedTracks: [],
            discoverWeekly: [],
            genres: [],
          })),
          api.getPodcastShows().catch(() => []),
        ]);

        if (mounted) {
          setTracks(featured.featuredTracks);
          setRecommended(recs.recommendedTracks || []);
          setPlaylists(featured.topPlaylists);
          setArtists(featured.popularArtists);
          setPodcasts(podShows);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [user]);

  const playTrack = (track: Track, queueList?: Track[]) => {
    player.setCurrent(track, queueList || tracks);
  };

  // Quick Play 6 items
  const quickItems = [
    {
      title: 'Liked Songs',
      cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80',
      action: () => navigate('/liked-songs'),
      track: tracks[0],
    },
    ...tracks.slice(0, 5).map((t) => ({
      title: t.title,
      cover: t.coverUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80',
      action: () => playTrack(t),
      track: t,
    })),
  ];

  return (
    <div>
      {/* Category Pills Header */}
      <div className="filterPillsRow">
        <button
          className={`filterPillBtn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          className={`filterPillBtn ${activeTab === 'music' ? 'active' : ''}`}
          onClick={() => setActiveTab('music')}
        >
          Music
        </button>
        <button
          className={`filterPillBtn ${activeTab === 'podcasts' ? 'active' : ''}`}
          onClick={() => setActiveTab('podcasts')}
        >
          Podcasts
        </button>
      </div>

      <div className="pageContent">
        {/* Dynamic Spotify Greeting */}
        <h1 className="greetingTitle">{getGreeting()}</h1>

        {/* 6-Grid Quick Play Section */}
        <div className="quickPlayGrid">
          {quickItems.map((item, idx) => (
            <div className="quickPlayCard" key={idx} onClick={item.action}>
              <img src={item.cover} alt={item.title} />
              <div className="quickPlayCardTitle">{item.title}</div>
              <button
                className="quickPlayBtn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.track) playTrack(item.track);
                  else item.action();
                }}
                aria-label={`Play ${item.title}`}
              >
                <Play size={18} fill="#000" color="#000" style={{ marginLeft: 2 }} />
              </button>
            </div>
          ))}
        </div>

        {/* Made For You / Recommendations */}
        {(activeTab === 'all' || activeTab === 'music') && recommended.length > 0 && (
          <section>
            <div className="sectionHeader">
              <h2>Made For You</h2>
              <button className="sectionShowAll" onClick={() => navigate('/browse')}>
                Show all
              </button>
            </div>
            <div className="cardGrid">
              {recommended.slice(0, 5).map((t) => (
                <MediaCard key={`rec-${t.id}`} item={t} onPlay={() => playTrack(t, recommended)} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Music Catalog */}
        {(activeTab === 'all' || activeTab === 'music') && (
          <section>
            <div className="sectionHeader">
              <h2>Featured Today</h2>
              <button className="sectionShowAll" onClick={() => navigate('/browse')}>
                Show all
              </button>
            </div>
            <div className="cardGrid">
              {tracks.slice(0, 5).map((t) => (
                <MediaCard key={t.id} item={t} onPlay={() => playTrack(t, tracks)} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Artists */}
        {(activeTab === 'all' || activeTab === 'music') && artists.length > 0 && (
          <section>
            <div className="sectionHeader">
              <h2>Popular Artists</h2>
              <button className="sectionShowAll" onClick={() => navigate('/browse')}>
                Show all
              </button>
            </div>
            <div className="cardGrid">
              {artists.slice(0, 5).map((a) => (
                <ArtistCard key={a.id} artist={a} />
              ))}
            </div>
          </section>
        )}

        {/* Top Podcasts */}
        {(activeTab === 'all' || activeTab === 'podcasts') && podcasts.length > 0 && (
          <section>
            <div className="sectionHeader">
              <h2>Shows You Might Like</h2>
              <button className="sectionShowAll" onClick={() => navigate('/browse')}>
                Show all
              </button>
            </div>
            <div className="cardGrid">
              {podcasts.slice(0, 5).map((p) => (
                <PodcastCard key={p.id} item={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
