import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  Play,
  Pause,
  Clock,
  ArrowLeft,
  Disc3,
  Mic2,
  Library,
  Radio,
} from 'lucide-react';
import { SongRow } from '../components/media';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { api } from '../services/api';
import { Album, Artist, Playlist, PodcastEpisode, PodcastShow, Track } from '../types';

export function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const player = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api
      .getPlaylist(id)
      .then((data: any) => {
        setPlaylist(data);
        const extractedTracks = (data.tracks || []).map((pt: any) => pt.track || pt);
        setTracks(extractedTracks);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Playlist not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="retroLoadingMsg">Loading playlist...</div>;
  }

  if (error || !playlist) {
    return (
      <div className="retroEmptyStateContainer">
        <h2>Playlist Not Found</h2>
        <p>{error || 'The requested playlist does not exist in the catalog.'}</p>
        <button className="retroBlackBtn" onClick={() => navigate('/library')}>
          Return to Library
        </button>
      </div>
    );
  }

  const isPlayingThisList =
    tracks.some((t) => t.id === player.current?.id) && player.isPlaying;

  const handlePlayToggle = () => {
    if (isPlayingThisList) {
      player.pause();
    } else if (tracks.length > 0) {
      player.playPlaylist(playlist.id, tracks[0], tracks);
    }
  };

  const ownerName =
    typeof playlist.owner === 'object'
      ? playlist.owner?.name
      : playlist.owner || 'Sonique Curator';

  return (
    <div className="retroDetailPage">
      <button className="retroBackBtn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Retro Detail Header */}
      <div className="retroDetailHeader">
        <div className="retroDetailArtBox">
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl} alt={playlist.title} className="retroDetailArtImg" />
          ) : (
            <div className="retroDetailArtPlaceholder">
              <Library size={48} />
            </div>
          )}
        </div>
        <div className="retroDetailInfo">
          <span className="retroDetailBadge">PLAYLIST</span>
          <h1 className="retroDetailTitle">{playlist.title}</h1>
          {playlist.description && (
            <p className="retroDetailDesc">{playlist.description}</p>
          )}
          <div className="retroDetailMeta">
            <strong>{ownerName}</strong>
            <span>•</span>
            <span>{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</span>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="retroActionRow">
        <button
          className="retroBigPlayBtn"
          onClick={handlePlayToggle}
          disabled={tracks.length === 0}
          aria-label={isPlayingThisList ? 'Pause playlist' : 'Play playlist'}
        >
          {isPlayingThisList ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" style={{ marginLeft: 2 }} />}
          <span>{isPlayingThisList ? 'PAUSE' : 'PLAY'}</span>
        </button>
      </div>

      {/* Tracks Table */}
      <div className="retroTrackTableContainer">
        {tracks.length > 0 ? (
          <div className="retroTable">
            <div className="retroTableHeader">
              <div className="colNum">#</div>
              <div className="colTitle">TITLE</div>
              <div className="colAlbum">ALBUM</div>
              <div className="colDuration">
                <Clock size={14} />
              </div>
            </div>
            {tracks.map((s, idx) => (
              <SongRow
                key={s.id || idx}
                song={s}
                index={idx}
                onPlay={() => player.setCurrent(s, tracks)}
              />
            ))}
          </div>
        ) : (
          <div className="retroEmptyStateContainer">
            <p>This playlist has no tracks yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function AlbumPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const player = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api
      .getAlbum(id)
      .then((data) => {
        setAlbum(data);
        setTracks(data.tracks || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Album not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="retroLoadingMsg">Loading album...</div>;
  }

  if (error || !album) {
    return (
      <div className="retroEmptyStateContainer">
        <h2>Album Not Found</h2>
        <p>{error || 'The requested album does not exist in the catalog.'}</p>
        <button className="retroBlackBtn" onClick={() => navigate('/search')}>
          Explore Music
        </button>
      </div>
    );
  }

  const isPlayingThisAlbum =
    tracks.some((t) => t.id === player.current?.id) && player.isPlaying;

  const handlePlayToggle = () => {
    if (isPlayingThisAlbum) {
      player.pause();
    } else if (tracks.length > 0) {
      player.setCurrent(tracks[0], tracks);
    }
  };

  return (
    <div className="retroDetailPage">
      <button className="retroBackBtn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="retroDetailHeader">
        <div className="retroDetailArtBox">
          {album.coverUrl ? (
            <img src={album.coverUrl} alt={album.title} className="retroDetailArtImg" />
          ) : (
            <div className="retroDetailArtPlaceholder">
              <Disc3 size={48} />
            </div>
          )}
        </div>
        <div className="retroDetailInfo">
          <span className="retroDetailBadge">ALBUM</span>
          <h1 className="retroDetailTitle">{album.title}</h1>
          <div className="retroDetailMeta">
            <strong>{album.artist?.name || 'Artist'}</strong>
            {album.releaseYear && (
              <>
                <span>•</span>
                <span>{album.releaseYear}</span>
              </>
            )}
            <span>•</span>
            <span>{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</span>
          </div>
        </div>
      </div>

      <div className="retroActionRow">
        <button
          className="retroBigPlayBtn"
          onClick={handlePlayToggle}
          disabled={tracks.length === 0}
          aria-label={isPlayingThisAlbum ? 'Pause album' : 'Play album'}
        >
          {isPlayingThisAlbum ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" style={{ marginLeft: 2 }} />}
          <span>{isPlayingThisAlbum ? 'PAUSE' : 'PLAY'}</span>
        </button>
      </div>

      <div className="retroTrackTableContainer">
        {tracks.length > 0 ? (
          <div className="retroTable">
            <div className="retroTableHeader">
              <div className="colNum">#</div>
              <div className="colTitle">TITLE</div>
              <div className="colAlbum">ALBUM</div>
              <div className="colDuration">
                <Clock size={14} />
              </div>
            </div>
            {tracks.map((s, idx) => (
              <SongRow
                key={s.id || idx}
                song={s}
                index={idx}
                onPlay={() => player.setCurrent(s, tracks)}
              />
            ))}
          </div>
        ) : (
          <div className="retroEmptyStateContainer">
            <p>No tracks in this album.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ArtistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const player = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api
      .getArtist(id)
      .then((data) => {
        setArtist(data);
        setTracks(data.tracks || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Artist not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="retroLoadingMsg">Loading artist...</div>;
  }

  if (error || !artist) {
    return (
      <div className="retroEmptyStateContainer">
        <h2>Artist Not Found</h2>
        <p>{error || 'The requested artist does not exist in the catalog.'}</p>
        <button className="retroBlackBtn" onClick={() => navigate('/search')}>
          Explore Artists
        </button>
      </div>
    );
  }

  const isPlayingThisArtist =
    tracks.some((t) => t.id === player.current?.id) && player.isPlaying;

  const handlePlayToggle = () => {
    if (isPlayingThisArtist) {
      player.pause();
    } else if (tracks.length > 0) {
      player.setCurrent(tracks[0], tracks);
    }
  };

  return (
    <div className="retroDetailPage">
      <button className="retroBackBtn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="retroDetailHeader">
        <div className="retroDetailArtBox round">
          {artist.imageUrl ? (
            <img src={artist.imageUrl} alt={artist.name} className="retroDetailArtImg round" />
          ) : (
            <div className="retroDetailArtPlaceholder round">
              <Mic2 size={48} />
            </div>
          )}
        </div>
        <div className="retroDetailInfo">
          <span className="retroDetailBadge">VERIFIED ARTIST</span>
          <h1 className="retroDetailTitle">{artist.name}</h1>
          {artist.bio && <p className="retroDetailDesc">{artist.bio}</p>}
          <div className="retroDetailMeta">
            <span>{tracks.length} tracks cataloged</span>
          </div>
        </div>
      </div>

      <div className="retroActionRow">
        <button
          className="retroBigPlayBtn"
          onClick={handlePlayToggle}
          disabled={tracks.length === 0}
          aria-label={isPlayingThisArtist ? 'Pause artist' : 'Play artist tracks'}
        >
          {isPlayingThisArtist ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" style={{ marginLeft: 2 }} />}
          <span>{isPlayingThisArtist ? 'PAUSE' : 'PLAY'}</span>
        </button>
      </div>

      <div className="retroTrackTableContainer">
        <h2 className="retroSectionSubheading">Popular Tracks</h2>
        {tracks.length > 0 ? (
          <div className="retroTable">
            <div className="retroTableHeader">
              <div className="colNum">#</div>
              <div className="colTitle">TITLE</div>
              <div className="colAlbum">ALBUM</div>
              <div className="colDuration">
                <Clock size={14} />
              </div>
            </div>
            {tracks.map((s, idx) => (
              <SongRow
                key={s.id || idx}
                song={s}
                index={idx}
                onPlay={() => player.setCurrent(s, tracks)}
              />
            ))}
          </div>
        ) : (
          <div className="retroEmptyStateContainer">
            <p>No tracks available for this artist.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function PodcastPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState<PodcastShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const player = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api
      .getPodcastShow(id)
      .then((data) => {
        setShow(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Podcast show not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="retroLoadingMsg">Loading podcast...</div>;
  }

  if (error || !show) {
    return (
      <div className="retroEmptyStateContainer">
        <h2>Podcast Not Found</h2>
        <p>{error || 'The requested podcast show does not exist.'}</p>
        <button className="retroBlackBtn" onClick={() => navigate('/browse')}>
          Browse Shows
        </button>
      </div>
    );
  }

  const episodes = show.episodes || [];

  return (
    <div className="retroDetailPage">
      <button className="retroBackBtn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="retroDetailHeader">
        <div className="retroDetailArtBox">
          {show.coverUrl ? (
            <img src={show.coverUrl} alt={show.title} className="retroDetailArtImg" />
          ) : (
            <div className="retroDetailArtPlaceholder">
              <Radio size={48} />
            </div>
          )}
        </div>
        <div className="retroDetailInfo">
          <span className="retroDetailBadge">PODCAST SHOW</span>
          <h1 className="retroDetailTitle">{show.title}</h1>
          {show.description && <p className="retroDetailDesc">{show.description}</p>}
          <div className="retroDetailMeta">
            <strong>{show.author}</strong>
            <span>•</span>
            <span>{episodes.length} episodes</span>
          </div>
        </div>
      </div>

      <div className="retroTrackTableContainer">
        <h2 className="retroSectionSubheading">All Episodes</h2>
        {episodes.length > 0 ? (
          <div className="retroEpisodesList">
            {episodes.map((ep) => (
              <div
                key={ep.id}
                className="retroEpisodeRow"
                onClick={() => player.setCurrent(ep as any)}
                role="button"
                tabIndex={0}
                aria-label={`Play episode: ${ep.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') player.setCurrent(ep as any);
                }}
              >
                <button className="episodePlayBtn" aria-label="Play Episode">
                  <Play size={16} fill="#000" style={{ marginLeft: 2 }} />
                </button>
                <div className="episodeMeta">
                  <span className="episodeTitle">{ep.title}</span>
                  {ep.description && <p className="episodeDesc">{ep.description}</p>}
                  <span className="episodeDuration">
                    {Math.floor((ep.duration || 1800) / 60)} mins
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="retroEmptyStateContainer">
            <p>No episodes currently released for this show.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function EpisodePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [loading, setLoading] = useState(true);
  const player = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getPodcastEpisode(id)
      .then((data) => {
        setEpisode(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="retroLoadingMsg">Loading episode...</div>;

  return (
    <div className="retroDetailPage">
      <button className="retroBackBtn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {episode ? (
        <div className="retroEpisodeDetailCard">
          <h1 className="retroDetailTitle">{episode.title}</h1>
          {episode.description && <p className="retroDetailDesc">{episode.description}</p>}
          <button
            className="retroBigPlayBtn"
            onClick={() => player.setCurrent(episode as any)}
          >
            <Play size={18} fill="#000" />
            <span>PLAY EPISODE</span>
          </button>
        </div>
      ) : (
        <div className="retroEmptyStateContainer">
          <h2>Episode Not Found</h2>
          <p>Please select an episode from the podcast directory.</p>
        </div>
      )}
    </div>
  );
}
