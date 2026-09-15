import { Heart, Play, Pause, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore, extractYouTubeId } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import type { Artist, PodcastShow, Track } from '../types';

function resolveCoverImage(coverUrl?: string | null, audioUrl?: string | null, fallback?: string): string {
  const ytId = extractYouTubeId(audioUrl);
  if (!coverUrl || coverUrl.includes('google.com/search')) {
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
    return fallback || 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=700&q=80';
  }
  return coverUrl;
}

export function MediaCard({
  item,
  onPlay,
}: {
  item: Track;
  onPlay?: () => void;
}) {
  const imageUrl = resolveCoverImage(item.coverUrl || item.art, item.audioUrl);
  const player = usePlayerStore();
  const isPlayingCurrent = player.current?.id === item.id && player.isPlaying;

  return (
    <div
      className="mediaCard"
      onClick={() => onPlay?.()}
      title={`Play ${item.title}`}
    >
      <div className="artWrap">
        <img src={imageUrl} alt={item.title} loading="lazy" />
        <button
          className="floatPlay"
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.();
          }}
          aria-label="Play track"
        >
          {isPlayingCurrent ? <Pause size={20} fill="#000" color="#000" /> : <Play size={20} fill="#000" color="#000" style={{ marginLeft: 2 }} />}
        </button>
      </div>
      <div className="cardTitle">{item.title}</div>
      <div className="cardSubtitle">{item.artist} {item.album ? `· ${item.album}` : ''}</div>
    </div>
  );
}

export function ArtistCard({ artist }: { artist: Artist }) {
  const navigate = useNavigate();
  return (
    <div
      className="mediaCard artistCard"
      onClick={() => navigate(`/artist/${artist.id}`)}
      title={`View ${artist.name}`}
    >
      <div className="artWrap">
        <img
          src={artist.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
          alt={artist.name}
          loading="lazy"
        />
        <button className="floatPlay" aria-label={`Play ${artist.name}`}>
          <Play size={20} fill="#000" color="#000" style={{ marginLeft: 2 }} />
        </button>
      </div>
      <div className="cardTitle">{artist.name}</div>
      <div className="cardSubtitle">Artist</div>
    </div>
  );
}

export function PodcastCard({ item }: { item: PodcastShow }) {
  const navigate = useNavigate();
  const imageUrl = resolveCoverImage(
    item.coverUrl || item.art,
    null,
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=700&q=80'
  );
  return (
    <div className="mediaCard" onClick={() => navigate(`/podcast/${item.id}`)} title={item.title}>
      <div className="artWrap">
        <img src={imageUrl} alt={item.title} loading="lazy" />
      </div>
      <div className="cardTitle">{item.title}</div>
      <div className="cardSubtitle">{item.author || item.creator} · Podcast</div>
    </div>
  );
}

export function SongRow({
  song,
  index,
  onPlay,
}: {
  song: Track;
  index?: number;
  onPlay?: () => void;
}) {
  const player = usePlayerStore();
  const { likedTrackIds, toggleLike } = useLibraryStore();
  const isLiked = likedTrackIds.has(song.id);
  const isCurrent = player.current?.id === song.id;
  const isPlayingThis = isCurrent && player.isPlaying;
  const imageUrl = resolveCoverImage(
    song.coverUrl || song.art,
    song.audioUrl,
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=80'
  );

  const handlePlay = () => {
    if (isCurrent) {
      player.toggle();
    } else if (onPlay) {
      onPlay();
    } else {
      player.setCurrent(song);
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`songRow ${isCurrent ? 'active' : ''}`} onClick={handlePlay}>
      {/* Rank or Play Icon */}
      <div className="songRankCol">
        {isPlayingThis ? (
          <Pause size={15} fill="var(--spotify-green)" color="var(--spotify-green)" />
        ) : (
          <>
            <span className="rankNum">{index !== undefined ? index + 1 : '—'}</span>
            <Play size={15} fill="#fff" color="#fff" className="playHoverIcon" />
          </>
        )}
      </div>

      {/* Title & Artist */}
      <div className="songMainCol">
        <img src={imageUrl} alt={song.title} loading="lazy" />
        <div className="songInfo">
          <div className="songTitle">{song.title}</div>
          <div className="songArtist">{song.artist}</div>
        </div>
      </div>

      {/* Album */}
      <div className="songAlbumCol">{song.album || 'Single'}</div>

      {/* Like & Duration */}
      <div className="songMetaCol">
        <button
          className={`rowHeartBtn ${isLiked ? 'liked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(song);
          }}
          aria-label={isLiked ? 'Unlike song' : 'Like song'}
        >
          <Heart
            size={16}
            fill={isLiked ? 'var(--spotify-green)' : 'none'}
            color={isLiked ? 'var(--spotify-green)' : 'currentColor'}
          />
        </button>
        <span>{formatDuration(song.duration || 180)}</span>
      </div>
    </div>
  );
}

export function PodcastEpisodeRow({
  title,
  date,
  duration,
  onPlay,
  saved,
  onSave,
}: {
  title: string;
  date: string;
  duration: number;
  onPlay: () => void;
  saved?: boolean;
  onSave?: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 12,
        borderRadius: 6,
        background: 'rgba(255,255,255,0.04)',
        cursor: 'pointer',
      }}
      onClick={onPlay}
    >
      <button
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--text-bright)',
          color: '#000',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPlay();
        }}
      >
        <Play size={15} fill="#000" style={{ marginLeft: 2 }} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ display: 'block', fontSize: 14, color: 'var(--text-bright)' }}>{title}</strong>
        <span style={{ fontSize: 12, color: 'var(--text-subdued)' }}>
          {date} · {Math.floor(duration / 60)} min
        </span>
      </div>
      <button
        style={{ background: 'transparent', color: 'var(--text-subdued)', padding: 4 }}
        onClick={(e) => {
          e.stopPropagation();
          onSave?.();
        }}
      >
        <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
