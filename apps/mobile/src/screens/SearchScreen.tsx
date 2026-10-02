import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { Search, X, Music, User, Disc, Radio, Clock } from 'lucide-react-native';
import { apiService } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useResponsive } from '../hooks/useResponsive';
import { Track, Artist, Album, PodcastShow } from '../types';
import { TrackRow } from '../components/media/TrackRow';
import { ArtistCard } from '../components/media/ArtistCard';
import { AlbumCard } from '../components/media/AlbumCard';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';

type SearchFilter = 'all' | 'tracks' | 'artists' | 'albums' | 'podcasts';

interface SearchScreenProps {
  onNavigateDetail?: (type: 'album' | 'artist' | 'playlist' | 'podcast', id: string) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onNavigateDetail }) => {
  const { isTablet, columns } = useResponsive();
  const { currentTrack, isPlaying, playTrack } = usePlayerStore();

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    tracks: Track[];
    artists: Artist[];
    albums: Album[];
    podcasts?: PodcastShow[];
  }>({
    tracks: [],
    artists: [],
    albums: [],
    podcasts: [],
  });

  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Synthwave',
    'Daft Punk',
    'Midnight City',
    'Retro Electro',
  ]);

  const performSearch = useCallback(async (text: string, filter: SearchFilter) => {
    if (!text.trim()) {
      setResults({ tracks: [], artists: [], albums: [], podcasts: [] });
      return;
    }
    setIsLoading(true);
    try {
      const typeParam = filter === 'all' ? undefined : filter;
      const res = await apiService.search(text, typeParam);
      setResults(res);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query, activeFilter);
    }, 350);
    return () => clearTimeout(timer);
  }, [query, activeFilter, performSearch]);

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    performSearch(term, activeFilter);
  };

  const hasResults =
    results.tracks.length > 0 ||
    results.artists.length > 0 ||
    results.albums.length > 0 ||
    (results.podcasts && results.podcasts.length > 0);

  const filters: { id: SearchFilter; label: string; icon: any }[] = [
    { id: 'all', label: 'All', icon: SparkleIcon },
    { id: 'tracks', label: 'Songs', icon: Music },
    { id: 'artists', label: 'Artists', icon: User },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'podcasts', label: 'Podcasts', icon: Radio },
  ];

  function SparkleIcon(props: any) {
    return <Search {...props} />;
  }

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.inputWrapper}>
          <Search size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs, artists, albums, podcasts..."
            placeholderTextColor="#64748b"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPills}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setActiveFilter(filter.id)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Body Content */}
      {isLoading ? (
        <LoadingState message="Searching Sonique catalog..." />
      ) : query.trim().length === 0 ? (
        <ScrollView style={styles.recentSection} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionHeader}>Recent Searches</Text>
          {recentSearches.map((term, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentRow}
              onPress={() => handleSelectRecent(term)}
            >
              <Clock size={16} color="#64748b" />
              <Text style={styles.recentText}>{term}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : !hasResults ? (
        <EmptyState
          title={`No results for "${query}"`}
          description="Try searching for a different song, artist, album, or keyword."
        />
      ) : (
        <ScrollView style={styles.resultsScroll} showsVerticalScrollIndicator={false}>
          {/* Songs Section */}
          {(activeFilter === 'all' || activeFilter === 'tracks') &&
            results.tracks.length > 0 && (
              <View style={styles.resultsSection}>
                <Text style={styles.sectionHeader}>Songs</Text>
                {results.tracks.map((track, idx) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={idx}
                    isCurrent={currentTrack?.id === track.id}
                    isPlaying={isPlaying && currentTrack?.id === track.id}
                    onPress={() => playTrack(track, results.tracks)}
                  />
                ))}
              </View>
            )}

          {/* Artists Section */}
          {(activeFilter === 'all' || activeFilter === 'artists') &&
            results.artists.length > 0 && (
              <View style={styles.resultsSection}>
                <Text style={styles.sectionHeader}>Artists</Text>
                <ScrollView
                  horizontal={!isTablet}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={
                    isTablet ? styles.gridContainer : styles.horizontalScroll
                  }
                >
                  {results.artists.map((artist) => (
                    <ArtistCard
                      key={artist.id}
                      artist={artist}
                      onPress={() =>
                        onNavigateDetail && onNavigateDetail('artist', artist.id)
                      }
                    />
                  ))}
                </ScrollView>
              </View>
            )}

          {/* Albums Section */}
          {(activeFilter === 'all' || activeFilter === 'albums') &&
            results.albums.length > 0 && (
              <View style={styles.resultsSection}>
                <Text style={styles.sectionHeader}>Albums</Text>
                <ScrollView
                  horizontal={!isTablet}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={
                    isTablet ? styles.gridContainer : styles.horizontalScroll
                  }
                >
                  {results.albums.map((album) => (
                    <AlbumCard
                      key={album.id}
                      album={album}
                      onPress={() =>
                        onNavigateDetail && onNavigateDetail('album', album.id)
                      }
                    />
                  ))}
                </ScrollView>
              </View>
            )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 15,
  },
  clearBtn: {
    padding: 6,
  },
  filterPills: {
    flexDirection: 'row',
    paddingVertical: 10,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  pillActive: {
    backgroundColor: '#d946ef',
    borderColor: '#d946ef',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  recentSection: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 12,
  },
  recentText: {
    fontSize: 15,
    color: '#cbd5e1',
  },
  resultsScroll: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  resultsSection: {
    marginBottom: 24,
  },
  horizontalScroll: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
});
