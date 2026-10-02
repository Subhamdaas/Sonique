import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  Play,
  Shuffle,
  Disc,
  User,
  ListMusic,
  Radio,
  Clock,
} from 'lucide-react-native';
import { apiService } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useResponsive } from '../hooks/useResponsive';
import { Playlist, Album, Artist, PodcastShow, PodcastEpisode, Track } from '../types';
import { TrackRow } from '../components/media/TrackRow';
import { EpisodeRow } from '../components/media/EpisodeRow';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';

interface DetailScreenProps {
  type: 'playlist' | 'album' | 'artist' | 'podcast';
  id: string;
  onBack: () => void;
}

export const DetailScreen: React.FC<DetailScreenProps> = ({ type, id, onBack }) => {
  const { isTablet } = useResponsive();
  const { currentTrack, isPlaying, playTrack, setQueue } = usePlayerStore();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    playlist?: Playlist;
    album?: Album;
    artist?: Artist;
    podcast?: PodcastShow;
    tracks?: Track[];
    episodes?: PodcastEpisode[];
  }>({});

  useEffect(() => {
    loadDetails();
  }, [type, id]);

  const loadDetails = async () => {
    setIsLoading(true);
    try {
      if (type === 'playlist') {
        const pl = await apiService.getPlaylistById(id);
        const normalizedTracks: Track[] = (pl.tracks || []).map((t: any) =>
          t.track ? t.track : t,
        );
        setData({ playlist: pl, tracks: normalizedTracks });
      } else if (type === 'album') {
        const album = await apiService.getAlbumById(id);
        setData({ album, tracks: album.tracks || [] });
      } else if (type === 'artist') {
        const artist = await apiService.getArtistById(id);
        setData({ artist, tracks: artist.tracks || [] });
      } else if (type === 'podcast') {
        const [shows, eps] = await Promise.all([
          apiService.getPodcasts(),
          apiService.getPodcastEpisodes(id),
        ]);
        const show = shows.find((s) => s.id === id) || {
          id,
          title: 'Podcast Show',
          coverUrl: undefined,
        };
        setData({ podcast: show, episodes: eps });
      }
    } catch (err) {
      console.error('Failed to load detail view:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAll = (shuffle = false) => {
    const list = data.tracks || [];
    if (list.length === 0) return;
    const tracksToPlay = shuffle ? [...list].sort(() => Math.random() - 0.5) : list;
    playTrack(tracksToPlay[0], tracksToPlay);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color="#f8fafc" />
        </TouchableOpacity>
        <LoadingState message="Loading details..." />
      </View>
    );
  }

  const title =
    data.playlist?.title ||
    data.album?.title ||
    data.artist?.name ||
    data.podcast?.title ||
    'Details';

  const albumArtistName =
    typeof data.album?.artist === 'string'
      ? data.album.artist
      : data.album?.artist?.name;

  const subtitle =
    data.playlist?.description ||
    albumArtistName ||
    (data.artist?.genres ? data.artist.genres.join(' • ') : undefined) ||
    data.podcast?.publisher ||
    data.podcast?.author ||
    '';

  const coverUrl =
    data.playlist?.coverUrl ||
    data.album?.coverUrl ||
    data.artist?.avatarUrl ||
    data.artist?.imageUrl ||
    data.podcast?.coverUrl;

  const tracks = data.tracks || [];
  const episodes = data.episodes || [];


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Bar with Back Button */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color="#f8fafc" />
        </TouchableOpacity>
      </View>

      {/* Hero Header */}
      <View style={[styles.hero, isTablet && styles.heroTablet]}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.heroCover} />
        ) : (
          <View style={[styles.heroCover, styles.heroPlaceholder]}>
            {type === 'artist' ? (
              <User size={48} color="#d946ef" />
            ) : type === 'podcast' ? (
              <Radio size={48} color="#06b6d4" />
            ) : (
              <Disc size={48} color="#d946ef" />
            )}
          </View>
        )}

        <View style={styles.heroInfo}>
          <Text style={styles.heroBadge}>{type.toUpperCase()}</Text>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.heroSubtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}

          {/* Action Buttons */}
          {tracks.length > 0 && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.playAllBtn}
                onPress={() => handlePlayAll(false)}
              >
                <Play size={18} color="#0f172a" fill="#0f172a" />
                <Text style={styles.playAllText}>Play</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shuffleBtn}
                onPress={() => handlePlayAll(true)}
              >
                <Shuffle size={18} color="#d946ef" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Item List: Tracks or Episodes */}
      <View style={styles.listSection}>
        {type === 'podcast' ? (
          episodes.length === 0 ? (
            <EmptyState
              title="No episodes found"
              description="This show does not have any episodes published yet."
            />
          ) : (
            episodes.map((ep) => (
              <EpisodeRow
                key={ep.id}
                episode={ep}
                isCurrent={currentTrack?.id === ep.id}
                isPlaying={isPlaying && currentTrack?.id === ep.id}
                onPlay={() => {
                  const track: Track = {
                    id: ep.id,
                    title: ep.title,
                    artist: title,
                    audioUrl: ep.audioUrl,
                    coverUrl: ep.coverUrl || coverUrl,
                    duration: ep.duration,
                  };
                  playTrack(track);
                }}
              />
            ))
          )
        ) : tracks.length === 0 ? (
          <EmptyState
            title="No tracks found"
            description="There are currently no songs available in this collection."
          />
        ) : (
          tracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              isCurrent={currentTrack?.id === track.id}
              isPlaying={isPlaying && currentTrack?.id === track.id}
              onPress={() => playTrack(track, tracks)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  topNav: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  heroTablet: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 28,
  },
  heroCover: {
    width: 160,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    marginBottom: 16,
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  heroInfo: {
    flex: 1,
    alignItems: 'center',
  },
  heroBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#d946ef',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d946ef',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  playAllText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  shuffleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listSection: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
