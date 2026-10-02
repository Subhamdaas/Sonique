import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {
  Disc,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Sliders,
  Sparkles,
  Volume2,
} from 'lucide-react-native';
import { usePlayerStore } from '../store/playerStore';
import { useResponsive } from '../hooks/useResponsive';
import { Track } from '../types';
import { TrackRow } from '../components/media/TrackRow';

interface MusicScreenProps {
  onNavigateDetail?: (type: 'album' | 'artist' | 'playlist', id: string) => void;
}

export const MusicScreen: React.FC<MusicScreenProps> = ({ onNavigateDetail }) => {
  const { isTablet, isLargeTablet } = useResponsive();
  const {
    currentTrack,
    isPlaying,
    queue,
    queueIndex,
    rpm,
    pitch,
    isShuffle,
    repeatMode,
    togglePlayPause,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    setRpm,
    setPitch,
    playTrack,
  } = usePlayerStore();

  const [activeTab, setActiveTab] = useState<'deck' | 'queue'>('deck');

  return (
    <View style={styles.container}>
      {/* Top Deck Mode Switcher on phone */}
      {!isTablet && (
        <View style={styles.topTabs}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'deck' && styles.tabBtnActive]}
            onPress={() => setActiveTab('deck')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'deck' && styles.tabBtnTextActive]}>
              Turntable Deck
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'queue' && styles.tabBtnActive]}
            onPress={() => setActiveTab('queue')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'queue' && styles.tabBtnTextActive]}>
              Deck Queue ({queue.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content: Adaptive Split on Tablet / Tabs on Phone */}
      <View style={[styles.contentLayout, isTablet && styles.contentLayoutTablet]}>
        {/* Left Side: Turntable Deck */}
        {(isTablet || activeTab === 'deck') && (
          <ScrollView
            style={[styles.deckPane, isTablet && styles.deckPaneTablet]}
            contentContainerStyle={styles.deckScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Vinyl Record Visual */}
            <View style={styles.turntableCard}>
              <View style={styles.platterRing}>
                <View
                  style={[
                    styles.vinylBody,
                    { transform: [{ rotate: isPlaying ? '25deg' : '0deg' }] },
                  ]}
                >
                  <View style={styles.vinylGroove1} />
                  <View style={styles.vinylGroove2} />
                  {currentTrack?.coverUrl ? (
                    <Image
                      source={{ uri: currentTrack.coverUrl }}
                      style={styles.vinylCenterLabel}
                    />
                  ) : (
                    <View style={[styles.vinylCenterLabel, styles.vinylCenterPlaceholder]}>
                      <Disc size={36} color="#d946ef" />
                    </View>
                  )}
                  <View style={styles.spindleHole} />
                </View>
              </View>

              {/* Tonearm graphic overlay */}
              <View
                style={[
                  styles.tonearm,
                  isPlaying ? styles.tonearmPlaying : styles.tonearmResting,
                ]}
              >
                <View style={styles.tonearmPivot} />
                <View style={styles.tonearmBar} />
                <View style={styles.tonearmCartridge} />
              </View>
            </View>

            {/* Current Track Metadata */}
            <View style={styles.trackInfoSection}>
              <Text style={styles.trackTitle} numberOfLines={1}>
                {currentTrack?.title || 'No Track Selected'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (currentTrack?.artistId && onNavigateDetail) {
                    onNavigateDetail('artist', currentTrack.artistId);
                  }
                }}
              >
                <Text style={styles.artistName} numberOfLines={1}>
                  {currentTrack?.artist || 'Select a song from your library'}
                </Text>
              </TouchableOpacity>
              {currentTrack?.album && (
                <Text style={styles.albumName} numberOfLines={1}>
                  {currentTrack.album}
                </Text>
              )}
            </View>

            {/* Analog Controls: RPM and Pitch */}
            <View style={styles.analogControls}>
              {/* RPM Selector */}
              <View style={styles.rpmControl}>
                <Text style={styles.controlLabel}>RPM MODE</Text>
                <View style={styles.rpmButtons}>
                  {([33, 45, 78] as const).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      style={[
                        styles.rpmBtn,
                        rpm === mode && styles.rpmBtnActive,
                      ]}
                      onPress={() => setRpm(mode)}
                    >
                      <Text
                        style={[
                          styles.rpmBtnText,
                          rpm === mode && styles.rpmBtnTextActive,
                        ]}
                      >
                        {mode}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

              </View>

              {/* Pitch Adjuster */}
              <View style={styles.pitchControl}>
                <Text style={styles.controlLabel}>
                  PITCH {pitch > 0 ? `+${pitch}%` : `${pitch}%`}
                </Text>
                <View style={styles.pitchButtons}>
                  <TouchableOpacity
                    style={styles.pitchBtn}
                    onPress={() => setPitch(Math.max(-8, pitch - 1))}
                  >
                    <Text style={styles.pitchBtnText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pitchResetBtn}
                    onPress={() => setPitch(0)}
                  >
                    <Text style={styles.pitchResetText}>RESET</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pitchBtn}
                    onPress={() => setPitch(Math.min(8, pitch + 1))}
                  >
                    <Text style={styles.pitchBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Deck Playback Transport Buttons */}
            <View style={styles.transportRow}>
              <TouchableOpacity
                style={[styles.modeBtn, isShuffle && styles.modeBtnActive]}
                onPress={toggleShuffle}
              >
                <Shuffle size={18} color={isShuffle ? '#d946ef' : '#94a3b8'} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.transportBtn} onPress={prevTrack}>
                <SkipBack size={24} color="#f8fafc" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mainPlayBtn}
                onPress={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause size={28} color="#0f172a" />
                ) : (
                  <Play size={28} color="#0f172a" />
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.transportBtn} onPress={nextTrack}>
                <SkipForward size={24} color="#f8fafc" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeBtn, repeatMode !== 'off' && styles.modeBtnActive]}
                onPress={toggleRepeat}
              >
                <Repeat
                  size={18}
                  color={repeatMode !== 'off' ? '#d946ef' : '#94a3b8'}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* Right Side: Track Queue / Playlist on Deck */}
        {(isTablet || activeTab === 'queue') && (
          <View style={[styles.queuePane, isTablet && styles.queuePaneTablet]}>
            <View style={styles.queueHeader}>
              <Text style={styles.queueTitle}>Deck Queue</Text>
              <Text style={styles.queueSubtitle}>
                {queue.length} track{queue.length === 1 ? '' : 's'} loaded
              </Text>
            </View>

            {queue.length === 0 ? (
              <View style={styles.emptyQueueContainer}>
                <Disc size={40} color="#64748b" />
                <Text style={styles.emptyQueueText}>Queue is empty</Text>
                <Text style={styles.emptyQueueSubtext}>
                  Browse music and tap a song to start the turntable
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.queueList}
                showsVerticalScrollIndicator={false}
              >
                {queue.map((track, idx) => {
                  const isCurrent = idx === queueIndex;
                  return (
                    <TrackRow
                      key={`${track.id}-${idx}`}
                      track={track}
                      index={idx}
                      isCurrent={isCurrent}
                      isPlaying={isCurrent && isPlaying}
                      onPress={() => playTrack(track, queue)}
                    />
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  topTabs: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#d946ef',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabBtnTextActive: {
    color: '#d946ef',
  },
  contentLayout: {
    flex: 1,
  },
  contentLayoutTablet: {
    flexDirection: 'row',
  },
  deckPane: {
    flex: 1,
  },
  deckPaneTablet: {
    flex: 1.1,
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
  },
  deckScrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  turntableCard: {
    width: '100%',
    maxWidth: 360,
    aspectRatio: 1,
    backgroundColor: '#111827',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 12,
    shadowColor: '#d946ef',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  platterRing: {
    width: '84%',
    height: '84%',
    borderRadius: 999,
    backgroundColor: '#0b0f19',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#1f2937',
  },
  vinylBody: {
    width: '92%',
    height: '92%',
    borderRadius: 999,
    backgroundColor: '#030712',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  vinylGroove1: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  vinylGroove2: {
    position: 'absolute',
    width: '60%',
    height: '60%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  vinylCenterLabel: {
    width: '38%',
    height: '38%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  vinylCenterPlaceholder: {
    backgroundColor: '#1e1b4b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spindleHole: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#374151',
  },
  tonearm: {
    position: 'absolute',
    right: 28,
    top: 20,
    width: 60,
    height: 140,
    alignItems: 'flex-end',
  },
  tonearmPlaying: {
    transform: [{ rotate: '18deg' }],
  },
  tonearmResting: {
    transform: [{ rotate: '0deg' }],
  },
  tonearmPivot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#475569',
    borderWidth: 2,
    borderColor: '#94a3b8',
  },
  tonearmBar: {
    width: 4,
    height: 90,
    backgroundColor: '#cbd5e1',
    marginRight: 10,
  },
  tonearmCartridge: {
    width: 14,
    height: 20,
    backgroundColor: '#f43f5e',
    borderRadius: 2,
    marginRight: 5,
  },
  trackInfoSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    width: '100%',
    paddingHorizontal: 16,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
  },
  artistName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#d946ef',
    marginTop: 4,
    textAlign: 'center',
  },
  albumName: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  analogControls: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 360,
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 20,
  },
  rpmControl: {
    alignItems: 'center',
    flex: 1,
  },
  pitchControl: {
    alignItems: 'center',
    flex: 1,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 6,
  },
  rpmButtons: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 2,
  },
  rpmBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rpmBtnActive: {
    backgroundColor: '#d946ef',
  },
  rpmBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  rpmBtnTextActive: {
    color: '#ffffff',
  },
  pitchButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 2,
  },
  pitchBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pitchBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#cbd5e1',
  },
  pitchResetBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  pitchResetText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 6,
  },
  modeBtn: {
    padding: 10,
    borderRadius: 999,
  },
  modeBtnActive: {
    backgroundColor: 'rgba(217, 70, 239, 0.15)',
  },
  transportBtn: {
    padding: 12,
  },
  mainPlayBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#d946ef',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d946ef',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  queuePane: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  queuePaneTablet: {
    flex: 1,
  },
  queueHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  queueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  queueSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  queueList: {
    flex: 1,
  },
  emptyQueueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyQueueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginTop: 12,
  },
  emptyQueueSubtext: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
});
