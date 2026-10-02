import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { User } from 'lucide-react-native';
import { Artist } from '../../types';

interface ArtistCardProps {
  artist: Artist;
  cardWidth?: number;
  onPress: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
  artist,
  cardWidth = 120,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.container, { width: cardWidth }]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={`View artist ${artist.name}`}
  >
    <View style={styles.avatarContainer}>
      {artist.imageUrl || artist.art ? (
        <Image
          source={{ uri: (artist.imageUrl || artist.art)! }}
          style={styles.avatarImg}
        />
      ) : (
        <View style={styles.fallbackAvatar}>
          <User size={30} color="#8b949e" />
        </View>
      )}
    </View>
    <Text style={styles.name} numberOfLines={1}>
      {artist.name}
    </Text>
    <Text style={styles.tag}>Artist</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    marginRight: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  avatarContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: '#161b22',
    borderWidth: 1.5,
    borderColor: '#30363d',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  fallbackAvatar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0c0e12',
  },
  name: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  tag: {
    color: '#8b949e',
    fontSize: 10,
    marginTop: 2,
  },
});
