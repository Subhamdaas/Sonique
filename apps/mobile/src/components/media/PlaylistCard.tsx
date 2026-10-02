import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Library, Disc3 } from 'lucide-react-native';
import { Playlist } from '../../types';

interface PlaylistCardProps {
  playlist: Playlist;
  cardWidth?: number;
  onPress: () => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  cardWidth = 140,
  onPress,
}) => {
  const count =
    playlist.songCount ||
    (Array.isArray(playlist.tracks) ? playlist.tracks.length : 0);

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`View playlist ${playlist.title}`}
    >
      <View style={styles.imageContainer}>
        {playlist.coverUrl || playlist.art ? (
          <Image
            source={{ uri: (playlist.coverUrl || playlist.art)! }}
            style={styles.coverImg}
          />
        ) : (
          <View style={styles.fallbackCover}>
            <Library size={30} color="#8b949e" />
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {playlist.title}
      </Text>
      <Text style={styles.countText}>{count} tracks</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 14,
    marginBottom: 14,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  fallbackCover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0c0e12',
  },
  title: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  countText: {
    color: '#8b949e',
    fontSize: 11,
    marginTop: 2,
  },
});
