import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading Sonique soundwaves...',
}) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#ffffff" />
    <Text style={styles.messageText}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  messageText: {
    color: '#8b949e',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
