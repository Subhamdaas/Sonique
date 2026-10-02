import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Radio, Mic, Play, Clock, Sparkles } from 'lucide-react-native';
import { apiService } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useResponsive } from '../hooks/useResponsive';
import { PodcastShow, PodcastEpisode, Track } from '../types';
import { EpisodeRow } from '../components/media/EpisodeRow';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';

interface PodcastsScreenProps {
  onNavigateDetail?: (type: 'podcast', id: string) => void;
}

export const PodcastsScreen: React.FC<PodcastsScreenProps> = ({ onNavigateDetail }) => {
  const { isTablet, columns } = useResponsive();
  const { currentTrack, isPlaying, playTrack } = usePlayerStore();

  const [shows, setShows] = useState<PodcastShow[]>([]);
  const [featuredEpisodes, setFeaturedEpisodes] = useState<PodcastEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPodcasts();
  }, []);

  const loadPodcasts = async () => {
    setIsLoading(true);
    try {
      const showList = await apiService.getPodcasts();
      setShows(showList);
      if (showList.length > 0) {
        // Fetch episodes from first few shows
        const epPromises = showList.slice(0, 3).map((s) =>
          apiService.getPodcastEpisodes(s.id).catch(() => [])
        );
        const epResults = await Promise.all(epPromises);
        setFeaturedEpisodes(epResults.flat());
      }
    } catch (err) {
      console.error('Failed to load podcasts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayEpisode = (episode: PodcastEpisode) => {
    // Map episode to Track interface for the unified player
    const trackEpisode: Track = {
      id: episode.id,
      title: episode.title,
      artist: episode.showTitle || 'Podcast',
      album: episode.showTitle,
      audioUrl: episode.audioUrl,
      coverUrl: episode.coverUrl,
      duration: episode.duration,
    };
    playTrack(trackEpisode);
  };

  if (isLoading) {
    return <LoadingState message="Loading podcasts & shows..." />;
  }

  if (shows.length === 0 && featuredEpisodes.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="No Podcasts Available"
          description="Check back soon for curated audio shows and creator episodes."
          actionLabel="Refresh"
          onAction={loadPodcasts}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Featured Shows Carousel */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Shows</Text>
          <Radio size={20} color="#06b6d4" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.showsScroll}
        >
          {shows.map((show) => (
            <TouchableOpacity
              key={show.id}
              style={styles.showCard}
              onPress={() => onNavigateDetail && onNavigateDetail('podcast', show.id)}
            >
              {show.coverUrl ? (
                <Image source={{ uri: show.coverUrl }} style={styles.showCover} />
              ) : (
                <View style={[styles.showCover, styles.showCoverPlaceholder]}>
                  <Mic size={32} color="#06b6d4" />
                </View>
              )}
              <Text style={styles.showTitle} numberOfLines={1}>
                {show.title}
              </Text>
              <Text style={styles.showHost} numberOfLines={1}>
                {show.host || show.publisher || 'Sonique Radio'}
              </Text>
              {show.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{show.category}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Latest Episodes List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Episodes</Text>
          <Clock size={18} color="#94a3b8" />
        </View>

        <View style={styles.episodesList}>
          {featuredEpisodes.map((episode) => (
            <EpisodeRow
              key={episode.id}
              episode={episode}
              isCurrent={currentTrack?.id === episode.id}
              isPlaying={isPlaying && currentTrack?.id === episode.id}
              onPlay={() => handlePlayEpisode(episode)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  section: {
    paddingVertical: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
  showsScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  showCard: {
    width: 150,
  },
  showCover: {
    width: 150,
    height: 150,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    marginBottom: 8,
  },
  showCoverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  showTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: 2,
  },
  showHost: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#06b6d4',
  },
  episodesList: {
    paddingHorizontal: 12,
  },
});
