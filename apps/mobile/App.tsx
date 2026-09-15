import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';

const API_BASE = 'http://localhost:4000/api';

export default function App() {
  const [tab, setTab] = useState<'home' | 'search' | 'library'>('home');
  const [tracks, setTracks] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/catalog/featured`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.featuredTracks) {
          setTracks(data.featuredTracks);
          if (data.featuredTracks.length > 0) {
            setCurrentTrack(data.featuredTracks[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>SONIQUE</Text>
        <Text style={styles.sublogo}>MUSIC</Text>
      </View>

      {/* Main Content Area */}
      <ScrollView style={styles.content}>
        <Text style={styles.heading}>Featured Soundtracks</Text>
        <Text style={styles.subheading}>
          Immerse yourself in calm, luminous music.
        </Text>

        <View style={styles.trackList}>
          {tracks.map((t, idx) => (
            <TouchableOpacity
              key={t.id || idx}
              style={styles.trackItem}
              onPress={() => {
                setCurrentTrack(t);
                setIsPlaying(true);
              }}
            >
              <Image
                source={{
                  uri:
                    t.coverUrl ||
                    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=80',
                }}
                style={styles.trackThumb}
              />
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{t.title}</Text>
                <Text style={styles.trackArtist}>{t.artist}</Text>
              </View>
              <Text style={styles.duration}>
                {Math.floor(t.duration / 60)}:
                {String(t.duration % 60).padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating Mini Player */}
      {currentTrack && (
        <View style={styles.miniPlayer}>
          <Image
            source={{
              uri:
                currentTrack.coverUrl ||
                'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=80',
            }}
            style={styles.playerThumb}
          />
          <View style={styles.playerInfo}>
            <Text style={styles.playerTitle} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.playerArtist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Text style={styles.playButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setTab('home')}
        >
          <Text style={[styles.tabText, tab === 'home' && styles.tabActive]}>
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setTab('search')}
        >
          <Text style={[styles.tabText, tab === 'search' && styles.tabActive]}>
            Search
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setTab('library')}
        >
          <Text style={[styles.tabText, tab === 'library' && styles.tabActive]}>
            Library
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
  },
  sublogo: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    marginLeft: 6,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 20,
  },
  trackList: {
    marginBottom: 80,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  trackThumb: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 14,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  trackArtist: {
    color: '#a1a1aa',
    fontSize: 13,
    marginTop: 2,
  },
  duration: {
    color: '#71717a',
    fontSize: 13,
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 60,
    left: 12,
    right: 12,
    backgroundColor: '#18181b',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  playerThumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  playerArtist: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  tabBar: {
    height: 60,
    backgroundColor: '#09090b',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#18181b',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    color: '#71717a',
    fontSize: 13,
    fontWeight: '500',
  },
  tabActive: {
    color: '#6366f1',
    fontWeight: '700',
  },
});
