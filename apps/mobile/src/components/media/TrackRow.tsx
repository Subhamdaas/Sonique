import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Heart, Music, Play, Pause } from 'lucide-react-native';
import { Track } from '../../types';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';

interface TrackRowProps {
  track: Track;
  index?: number;
  playlistContext?: Track[];
  isCurrent?: boolean;
  isPlaying?: boolean;
  onPress?: () => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  index,
  playlistContext,
  isCurrent: explicitCurrent,
  isPlaying: explicitPlaying,
  onPress,
}) => {
  const { current, isPlaying: storePlaying, setCurrent, togglePlay } = usePlayerStore();
  const { likedTrackIds, toggleLike } = useLibraryStore();

  const isCurrent = explicitCurrent !== undefined ? explicitCurrent : current?.id === track.id;
  const isPlaying = explicitPlaying !== undefined ? explicitPlaying : (isCurrent && storePlaying);
  const isLiked = likedTrackIds.has(track.id);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (isCurrent) {
      togglePlay();
    } else {
      setCurrent(track, playlistContext);
    }
  };


  const formatDuration = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, isCurrent && styles.containerActive]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Play ${track.title} by ${track.artist}`}
    >
      {/* Index or Playing Indicator */}
      {typeof index === 'number' && (
        <View style={styles.indexBox}>
          {isCurrent && isPlaying ? (
            <Text style={styles.playingSymbol}>▶</Text>
          ) : (
            <Text style={[styles.indexText, isCurrent && styles.indexTextActive]}>
              {index + 1}
            </Text>
          )}
        </View>
      )}

      {/* Artwork */}
      <View style={styles.artworkBox}>
        {track.coverUrl ? (
          <Image source={{ uri: track.coverUrl }} style={styles.artworkImg} />
        ) : (
          <View style={styles.artworkFallback}>
            <Music size={14} color="#8b949e" />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text
          style={[styles.titleText, isCurrent && styles.titleTextActive]}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text style={styles.artistText} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>

      {/* Duration */}
      <Text style={styles.durationText}>{formatDuration(track.duration)}</Text>

      {/* Like Button */}
      <TouchableOpacity
        style={styles.likeBtn}
        onPress={(e) => {
          e.stopPropagation();
          toggleLike(track);
        }}
        accessibilityLabel={isLiked ? 'Unlike track' : 'Like track'}
      >
        <Heart
          size={16}
          color={isLiked ? '#ffffff' : '#484f58'}
          fill={isLiked ? '#ffffff' : 'none'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  containerActive: {
    backgroundColor: '#161b22',
  },
  indexBox: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '600',
  },
  indexTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  playingSymbol: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  artworkBox: {
    width: 40,
    height: 40,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#0c0e12',
    marginRight: 12,
  },
  artworkImg: {
    width: '100%',
    height: '100%',
  },
  artworkFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#21262d',
  },
  infoBox: {
    flex: 1,
    marginRight: 8,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  titleTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  artistText: {
    color: '#8b949e',
    fontSize: 11,
    marginTop: 2,
  },
  durationText: {
    color: '#8b949e',
    fontSize: 11,
    marginRight: 8,
  },
  likeBtn: {
    padding: 6,
  },
});
