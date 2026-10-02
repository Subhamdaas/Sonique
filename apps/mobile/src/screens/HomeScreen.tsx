import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Sparkles, Disc3, Radio, ArrowRight } from 'lucide-react-native';
import { api } from '../services/api';
import { Album, Artist, Playlist, Track } from '../types';
import { TrackRow } from '../components/media/TrackRow';
import { AlbumCard } from '../components/media/AlbumCard';
import { ArtistCard } from '../components/media/ArtistCard';
import { PlaylistCard } from '../components/media/PlaylistCard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { useResponsive } from '../hooks/useResponsive';

export interface HomeScreenProps {
  onNavigateDetail?: (type: 'album' | 'artist' | 'playlist' | 'podcast', id: string) => void;
  onNavigateTab?: (tab: string) => void;
  onNavigateToAlbum?: (album: Album) => void;
  onNavigateToArtist?: (artist: Artist) => void;
  onNavigateToPlaylist?: (playlist: Playlist) => void;
  onNavigateToSearch?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateDetail,
  onNavigateTab,
  onNavigateToAlbum: explicitAlbum,
  onNavigateToArtist: explicitArtist,
  onNavigateToPlaylist: explicitPlaylist,
  onNavigateToSearch: explicitSearch,
}) => {
  const handleAlbumPress = (album: Album) => {
    if (explicitAlbum) explicitAlbum(album);
    else if (onNavigateDetail) onNavigateDetail('album', album.id);
  };

  const handleArtistPress = (artist: Artist) => {
    if (explicitArtist) explicitArtist(artist);
    else if (onNavigateDetail) onNavigateDetail('artist', artist.id);
  };

  const handlePlaylistPress = (playlist: Playlist) => {
    if (explicitPlaylist) explicitPlaylist(playlist);
    else if (onNavigateDetail) onNavigateDetail('playlist', playlist.id);
  };

  const handleSearchPress = () => {
    if (explicitSearch) explicitSearch();
    else if (onNavigateTab) onNavigateTab('search');
  };

  const [featuredTracks, setFeaturedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newReleases, setNewReleases] = useState<Album[]>([]);
  const [popularArtists, setPopularArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isTablet, cardWidth, contentPadding } = useResponsive();

  const fetchHomeData = async () => {
    setError(null);
    try {
      const data = await api.getFeatured();
      setFeaturedTracks(data.featuredTracks || []);
      setPlaylists(data.topPlaylists || []);
      setNewReleases(data.newReleases || []);
      setPopularArtists(data.popularArtists || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load featured catalog');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  if (loading) {
    return <LoadingState message="Connecting to Sonique high-fidelity catalog..." />;
  }

  if (error && featuredTracks.length === 0) {
    return <ErrorState message={error} onRetry={fetchHomeData} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingHorizontal: contentPadding },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#ffffff"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Welcome Banner */}
      <View style={[styles.heroBanner, isTablet && styles.heroBannerTablet]}>
        <View style={styles.heroBadge}>
          <Sparkles size={13} color="#000" />
          <Text style={styles.heroBadgeText}>RETRO HIGH-FIDELITY</Text>
        </View>
        <Text style={styles.heroTitle}>Pure Analog Warmth on Mobile</Text>
        <Text style={styles.heroSubtitle}>
          Studio-mastered Bollywood, Indian Classical, Odia Classics, and 90's English Hits.
        </Text>
      </View>

      {/* Featured Soundtracks Section */}
      {featuredTracks.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>FEATURED DISCOGRAPHY</Text>
            <TouchableOpacity onPress={handleSearchPress} style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>SEE ALL</Text>
              <ArrowRight size={12} color="#8b949e" />
            </TouchableOpacity>
          </View>

          <View style={styles.trackListCard}>
            {featuredTracks.slice(0, 6).map((track, idx) => (
              <TrackRow
                key={track.id || idx}
                track={track}
                index={idx}
                playlistContext={featuredTracks}
              />
            ))}
          </View>
        </View>
      )}

      {/* Fresh Vinyl & Album Releases */}
      {newReleases.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>NEW VINYL & ALBUMS</Text>
          </View>

          <FlatList
            data={newReleases}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <AlbumCard
                album={item}
                cardWidth={isTablet ? 160 : 135}
                onPress={() => handleAlbumPress(item)}
              />
            )}
          />
        </View>
      )}

      {/* Top Curated Playlists */}
      {playlists.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>POPULAR PLAYLISTS</Text>
          </View>

          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <PlaylistCard
                playlist={item}
                cardWidth={isTablet ? 160 : 135}
                onPress={() => handlePlaylistPress(item)}
              />
            )}
          />
        </View>
      )}

      {/* Featured Master Artists */}
      {popularArtists.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>FEATURED ARTISTS</Text>
          </View>

          <FlatList
            data={popularArtists}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <ArtistCard
                artist={item}
                cardWidth={isTablet ? 140 : 120}
                onPress={() => handleArtistPress(item)}
              />
            )}
          />
        </View>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0e12',
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  heroBanner: {
    backgroundColor: '#161b22',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#30363d',
    marginBottom: 24,
  },
  heroBannerTablet: {
    padding: 24,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    color: '#8b949e',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: '700',
  },
  trackListCard: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
