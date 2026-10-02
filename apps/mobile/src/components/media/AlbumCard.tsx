import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Disc3 } from 'lucide-react-native';
import { Album } from '../../types';

interface AlbumCardProps {
  album: Album;
  cardWidth?: number;
  onPress: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  cardWidth = 140,
  onPress,
}) => {
  const artistName =
    typeof album.artist === 'object' ? album.artist?.name : album.artist || 'Artist';

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`View album ${album.title}`}
    >
      <View style={styles.imageContainer}>
        {album.coverUrl || album.art ? (
          <Image
            source={{ uri: (album.coverUrl || album.art)! }}
            style={styles.coverImg}
          />
        ) : (
          <View style={styles.fallbackCover}>
            <Disc3 size={32} color="#8b949e" />
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {album.title}
      </Text>
      <Text style={styles.artist} numberOfLines={1}>
        {artistName}
      </Text>
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
  artist: {
    color: '#8b949e',
    fontSize: 11,
    marginTop: 2,
  },
});
