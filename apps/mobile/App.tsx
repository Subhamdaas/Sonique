import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuthStore } from './src/store/authStore';
import { usePlayerStore } from './src/store/playerStore';
import { Navigation } from './src/navigation/Navigation';

export default function App() {
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const hydratePlayer = usePlayerStore((state) => state.hydrate);

  useEffect(() => {
    // Restore session tokens and persistent player playback state
    hydrateAuth();
    hydratePlayer();
  }, [hydrateAuth, hydratePlayer]);

  return (
    <View style={styles.container}>
      <Navigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
});
