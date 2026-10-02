import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Play, Pause, SkipForward, Disc3, Heart } from 'lucide-react-native';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';
import { useResponsive } from '../../hooks/useResponsive';

export interface MiniPlayerProps {
  onExpand?: () => void;
  onOpenQueue?: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand, onOpenQueue }) => {
  const { current, isPlaying, progress, duration, togglePlay, next, openFullPlayer } =
    usePlayerStore();
  const { likedTrackIds, toggleLike } = useLibraryStore();
  const { isTablet } = useResponsive();

  if (!current) return null;

  const isLiked = likedTrackIds.has(current.id);
  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, progress / duration)) : 0;
  const handleOpen = onExpand || openFullPlayer;


  return (
    <View style={[styles.wrapper, isTablet && styles.wrapperTablet]}>
      {/* Progress Line */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
      </View>

      <TouchableOpacity
        style={styles.container}
        onPress={handleOpen}
        activeOpacity={0.9}
        accessibilityLabel="Open now playing player"
      >

        {/* Track Thumbnail */}
        <View style={styles.thumbBox}>
          {current.coverUrl ? (
            <Image source={{ uri: current.coverUrl }} style={styles.thumbImg} />
          ) : (
            <View style={styles.thumbFallback}>
              <Disc3 size={20} color="#8b949e" />
            </View>
          )}
        </View>

        {/* Track Meta */}
        <View style={styles.infoBox}>
          <Text style={styles.titleText} numberOfLines={1}>
            {current.title}
          </Text>
          <Text style={styles.artistText} numberOfLines={1}>
            {current.artist}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.actionsBox}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={(e) => {
              e.stopPropagation();
              toggleLike(current);
            }}
            accessibilityLabel={isLiked ? 'Unlike song' : 'Like song'}
          >
            <Heart
              size={18}
              color={isLiked ? '#ffffff' : '#8b949e'}
              fill={isLiked ? '#ffffff' : 'none'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playBtn}
            onPress={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={18} color="#000" fill="#000" />
            ) : (
              <Play size={18} color="#000" fill="#000" style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={(e) => {
              e.stopPropagation();
              next();
            }}
            accessibilityLabel="Next track"
          >
            <SkipForward size={18} color="#8b949e" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#161b22',
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  wrapperTablet: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#30363d',
    overflow: 'hidden',
  },
  progressBarBackground: {
    height: 2,
    backgroundColor: '#21262d',
    width: '100%',
  },
  progressBarFill: {
    height: 2,
    backgroundColor: '#ffffff',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  thumbBox: {
    width: 44,
    height: 44,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#0c0e12',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  thumbFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#21262d',
  },
  infoBox: {
    flex: 1,
    marginLeft: 12,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  artistText: {
    color: '#8b949e',
    fontSize: 11,
    marginTop: 2,
  },
  actionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
