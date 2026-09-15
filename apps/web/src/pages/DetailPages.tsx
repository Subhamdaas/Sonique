import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  Play,
  Pause,
  MoreHorizontal,
  Clock,
  Share2,
} from 'lucide-react';
import { SongRow, PodcastEpisodeRow, MediaCard } from '../components/media';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { api } from '../services/api';
import { Album, Artist, Playlist, PodcastEpisode, PodcastShow, Track } from '../types';

export function PlaylistPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const player = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getPlaylist(id)
      .then((data: any) => {
        setPlaylist(data);
        const extractedTracks = (data.tracks || []).map((pt: any) => pt.track || pt);
        setTracks(extractedTracks);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ padding: 40, color: 'var(--text-subdued)' }}>Loading playlist...</div>;

  const currentPl = playlist || {
    id: id || 'pl1',
    title: 'Featured Selection',
    description: 'A curated selection of late-night soundscapes.',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=900&q=80',
    owner: 'Sonique',
  };

  const isPlayingThisList = tracks.some((t) => t.id === player.current?.id) && player.isPlaying;

  const handlePlayToggle = () => {
    if (isPlayingThisList) {
      player.pause();
    } else if (tracks.length > 0) {
      player.setCurrent(tracks[0], tracks);
    }
  };

  const ownerName = typeof currentPl.owner === 'object' ? currentPl.owner?.name : currentPl.owner || 'Sonique';

  return (
    <div>
      {/* Spotify Grand Header */}
      <div className="detailHeader">
        <img
          src={currentPl.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=900&q=80'}
          alt={currentPl.title}
          className="detailArt"
        />
        <div className="detailInfo">
          <div className="detailType">Public Playlist</div>
          <h1 className="detailTitle">{currentPl.title}</h1>
          <p style={{ margin: 0, color: 'var(--text-subdued)', fontSize: 14 }}>{currentPl.description || 'Curated music stream.'}</p>
          <div className="detailMeta">
            <strong>{ownerName}</strong>
            <span>•</span>
            <span>{tracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="detailActionRow">
        <button className="bigPlayBtn" onClick={handlePlayToggle} aria-label="Play playlist">
          {isPlayingThisList ? <Pause size={24} fill="#000" /> : <Play size={24} fill="#000" style={{ marginLeft: 3 }} />}
        </button>
        <button style={{ background: 'transparent', color: 'var(--text-subdued)', padding: 0 }} aria-label="Like playlist">
          <Heart size={32} />
        </button>
        <button style={{ background: 'transparent', color: 'var(--text-subdued)', padding: 0 }} aria-label="More options">
          <MoreHorizontal size={32} />
        </button>
      </div>

      {/* Spotify Table */}
      <div className="pageContent">
        <div className="spotifyTable">
          <div className="spotifyTableHeader">
            <div>#</div>
            <div>Title</div>
            <div>Album</div>
            <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', paddingRight: 4 }}>
              <Clock size={16} />
            </div>
          </div>
          {tracks.map((s, i) => (
            <SongRow
              song={s}
              index={i}
              key={s.id}
              onPlay={() => player.setCurrent(s, tracks)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AlbumPage() {
  const { id } = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const player = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getAlbum(id)
      .then((data) => {
        setAlbum(data);
        setTracks(data.tracks || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ padding: 40, color: 'var(--text-subdued)' }}>Loading album...</div>;

  const currentAl = album || {
    id: id || 'al1',
    title: 'Neon Odyssey',
    artist: { name: 'Nova Vale' },
    releaseYear: 2026,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80',
  };

  const isPlayingThisAlbum = tracks.some((t) => t.id === player.current?.id) && player.isPlaying;

  const handlePlayToggle = () => {
    if (isPlayingThisAlbum) {
      player.pause();
    } else if (tracks.length > 0) {
      player.setCurrent(tracks[0], tracks);
    }
  };

  return (
    <div>
      <div className="detailHeader albumTheme">
        <img
          src={currentAl.coverUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80'}
          alt={currentAl.title}
          className="detailArt"
        />
        <div className="detailInfo">
          <div className="detailType">Album</div>
          <h1 className="detailTitle">{currentAl.title}</h1>
          <div className="detailMeta">
            <strong>{currentAl.artist?.name || 'Artist'}</strong>
            <span>•</span>
            <span>{currentAl.releaseYear || 2026}</span>
            <span>•</span>
            <span>{tracks.length} songs</span>
          </div>
        </div>
      </div>

      <div className="detailActionRow">
        <button className="bigPlayBtn" onClick={handlePlayToggle} aria-label="Play album">
          {isPlayingThisAlbum ? <Pause size={24} fill="#000" /> : <Play size={24} fill="#000" style={{ marginLeft: 3 }} />}
        </button>
        <button style={{ background: 'transparent', color: 'var(--text-subdued)', padding: 0 }} aria-label="Like album">
          <Heart size={32} />
        </button>
        <button style={{ background: 'transparent', color: 'var(--text-subdued)', padding: 0 }} aria-label="More options">
          <MoreHorizontal size={32} />
        </button>
      </div>

      <div className="pageContent">
        <div className="spotifyTable">
          <div className="spotifyTableHeader">
            <div>#</div>
            <div>Title</div>
            <div>Album</div>
            <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', paddingRight: 4 }}>
              <Clock size={16} />
            </div>
          </div>
          {tracks.map((s, i) => (
            <SongRow
              song={s}
              index={i}
              key={s.id}
              onPlay={() => player.setCurrent(s, tracks)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ArtistPage() {
  const { id } = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const player = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getArtist(id)
      .then((data) => {
        setArtist(data);
        setTracks(data.tracks || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ padding: 40, color: 'var(--text-subdued)' }}>Loading artist...</div>;

  const currentArt = artist || {
    id: id || 'art1',
    name: 'Nova Vale',
    bio: 'Electronic synth architect building luminous soundscapes.',
    imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80',
    verified: true,
  };

  const isPlayingThisArtist = tracks.some((t) => t.id === player.current?.id) && player.isPlaying;

  const handlePlayToggle = () => {
    if (isPlayingThisArtist) {
      player.pause();
    } else if (tracks.length > 0) {
      player.setCurrent(tracks[0], tracks);
    }
  };

  return (
    <div>
      <div className="detailHeader artistTheme">
        <img
          src={currentArt.imageUrl || 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80'}
          alt={currentArt.name}
          className="detailArt"
          style={{ borderRadius: '50%' }}
        />
        <div className="detailInfo">
          <div className="detailType">Verified Artist</div>
          <h1 className="detailTitle">{currentArt.name}</h1>
          <p style={{ margin: 0, color: 'var(--text-subdued)', fontSize: 14 }}>{currentArt.bio}</p>
          <div className="detailMeta">
            <span>{tracks.length} tracks in catalog</span>
          </div>
        </div>
      </div>

      <div className="detailActionRow">
        <button className="bigPlayBtn" onClick={handlePlayToggle} aria-label="Play artist top tracks">
          {isPlayingThisArtist ? <Pause size={24} fill="#000" /> : <Play size={24} fill="#000" style={{ marginLeft: 3 }} />}
        </button>
        <button
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            borderRadius: 32,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Follow
        </button>
      </div>

      <div className="pageContent">
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Popular</h2>
        <div className="spotifyTable">
          {tracks.slice(0, 10).map((s, i) => (
            <SongRow
              song={s}
              index={i}
              key={s.id}
              onPlay={() => player.setCurrent(s, tracks)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PodcastPage() {
  const { id } = useParams();
  const [show, setShow] = useState<PodcastShow | null>(null);
  const [loading, setLoading] = useState(true);
  const player = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getPodcastShow(id)
      .then((data) => {
        setShow(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ padding: 40, color: 'var(--text-subdued)' }}>Loading podcast...</div>;

  const currentShow = show || {
    id: id || 'pod1',
    title: 'Sonic Architecture',
    author: 'Nova Vale',
    description: 'Deep discussions on audio production and modern synthesizers.',
    coverUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=80',
    episodes: [],
  };

  const episodes = currentShow.episodes || [];

  return (
    <div>
      <div className="detailHeader" style={{ background: 'linear-gradient(180deg, #1b3a4b 0%, #121212 100%)' }}>
        <img
          src={currentShow.coverUrl || 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=80'}
          alt={currentShow.title}
          className="detailArt"
        />
        <div className="detailInfo">
          <div className="detailType">Podcast</div>
          <h1 className="detailTitle">{currentShow.title}</h1>
          <p style={{ margin: 0, color: 'var(--text-subdued)', fontSize: 14 }}>{currentShow.description}</p>
          <div className="detailMeta">
            <strong>{currentShow.author}</strong>
            <span>•</span>
            <span>{episodes.length} episodes</span>
          </div>
        </div>
      </div>

      <div className="pageContent" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>All Episodes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {episodes.map((ep) => (
            <div
              key={ep.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 16,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 8,
                cursor: 'pointer',
              }}
              onClick={() => player.setCurrent(ep as any)}
            >
              <button
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--text-bright)',
                  color: '#000',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Play size={18} fill="#000" style={{ marginLeft: 2 }} />
              </button>
              <div>
                <strong style={{ display: 'block', fontSize: 16, color: 'var(--text-bright)' }}>{ep.title}</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-subdued)' }}>{ep.description}</p>
                <span style={{ fontSize: 12, color: 'var(--text-subdued)', marginTop: 6, display: 'block' }}>
                  {Math.floor((ep.duration || 1800) / 60)} mins
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EpisodePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'transparent',
          color: 'var(--text-subdued)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 20,
        }}
      >
        ← Back
      </button>
      <h1>Podcast Episode</h1>
      <p style={{ color: 'var(--text-subdued)' }}>Select an episode from the podcast directory to play.</p>
    </div>
  );
}
