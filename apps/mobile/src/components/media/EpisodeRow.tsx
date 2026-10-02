import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Play, Pause, Mic2 } from 'lucide-react-native';
import { PodcastEpisode } from '../../types';
import { usePlayerStore } from '../../store/playerStore';

interface EpisodeRowProps {
  episode: PodcastEpisode;
  showTitle?: string;
  showCover?: string | null;
  isCurrent?: boolean;
  isPlaying?: boolean;
  onPlay?: () => void;
}

export const EpisodeRow: React.FC<EpisodeRowProps> = ({
  episode,
  showTitle,
  showCover,
  isCurrent: explicitCurrent,
  isPlaying: explicitPlaying,
  onPlay,
}) => {
  const { current, isPlaying: storePlaying, setCurrent, togglePlay } = usePlayerStore();
  const isCurrent = explicitCurrent !== undefined ? explicitCurrent : current?.id === episode.id;
  const isPlaying = explicitPlaying !== undefined ? explicitPlaying : (isCurrent && storePlaying);

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    } else if (isCurrent) {
      togglePlay();
    } else {
      setCurrent({
        id: episode.id,
        title: episode.title,
        artist: showTitle || 'Podcast Host',
        duration: episode.duration,
        audioUrl: episode.audioUrl,
        coverUrl: episode.coverUrl || showCover,
        type: 'episode',
      });
    }
  };


  const formatDuration = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={[styles.container, isCurrent && styles.containerActive]}>
      <TouchableOpacity
        style={styles.playBtn}
        onPress={handlePlay}
        accessibilityLabel={`Play episode ${episode.title}`}
      >
        {isCurrent && isPlaying ? (
          <Pause size={18} color="#000" fill="#000" />
        ) : (
          <Play size={18} color="#000" fill="#000" style={{ marginLeft: 2 }} />
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, isCurrent && styles.titleActive]} numberOfLines={2}>
          {episode.title}
        </Text>
        {episode.description && (
          <Text style={styles.description} numberOfLines={2}>
            {episode.description}
          </Text>
        )}
        <View style={styles.footerRow}>
          <Text style={styles.metaText}>{showTitle || 'Podcast Episode'}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.metaText}>{formatDuration(episode.duration)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#161b22',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  containerActive: {
    borderColor: '#ffffff',
    backgroundColor: '#1f242c',
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  titleActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  description: {
    color: '#8b949e',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaText: {
    color: '#6e7681',
    fontSize: 11,
    fontWeight: '600',
  },
  dot: {
    color: '#6e7681',
    marginHorizontal: 6,
  },
});
