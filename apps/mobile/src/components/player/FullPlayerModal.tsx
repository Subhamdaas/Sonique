import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  ListMusic,
  Volume2,
  VolumeX,
  Disc3,
} from 'lucide-react-native';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';
import { useResponsive } from '../../hooks/useResponsive';
import { QueueDrawer } from './QueueDrawer';

export interface FullPlayerModalProps {
  visible?: boolean;
  onClose?: () => void;
  onOpenQueue?: () => void;
}

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({
  visible: explicitVisible,
  onClose: explicitClose,
  onOpenQueue: explicitQueue,
}) => {
  const {
    current,
    isPlaying,
    progress,
    duration,
    shuffle,
    repeat,
    volume,
    isMuted,
    rpm,
    pitch,
    isFullPlayerVisible,
    isQueueVisible,
    togglePlay,
    next,
    previous,
    seek,
    toggleShuffle,
    toggleRepeat,
    setVolume,
    toggleMute,
    setRpm,
    setPitch,
    closeFullPlayer,
    toggleQueue,
  } = usePlayerStore();

  const { likedTrackIds, toggleLike } = useLibraryStore();
  const { isTablet } = useResponsive();

  const isVisible = explicitVisible !== undefined ? explicitVisible : isFullPlayerVisible;
  const handleClose = explicitClose || closeFullPlayer;
  const handleQueue = explicitQueue || toggleQueue;

  if (!current) return null;

  const isLiked = likedTrackIds.has(current.id);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, progress / duration)) : 0;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeContainer}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            accessibilityLabel="Collapse player"
          >
            <ChevronDown size={28} color="#ffffff" />
          </TouchableOpacity>


          <View style={styles.topCenterTitle}>
            <Text style={styles.playingFromText}>PLAYING FROM SONIQUE</Text>
            <Text style={styles.albumSubText} numberOfLines={1}>
              {current.album || 'Lossless Audio Stream'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.queueBtn}
            onPress={toggleQueue}
            accessibilityLabel="View queue"
          >
            <ListMusic size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isTablet && styles.scrollContentTablet,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Vinyl Deck Stage */}
          <View style={[styles.deckChassis, isTablet && styles.deckChassisTablet]}>
            <View style={styles.turntablePlatter}>
              {/* Rotating Vinyl Record Artwork */}
              <View
                style={[
                  styles.vinylRecord,
                  isPlaying && styles.vinylPlaying,
                  isTablet && styles.vinylRecordTablet,
                ]}
              >
                {current.coverUrl ? (
                  <Image source={{ uri: current.coverUrl }} style={styles.vinylCover} />
                ) : (
                  <View style={styles.vinylCenterLabel}>
                    <Disc3 size={40} color="#8b949e" />
                  </View>
                )}
                {/* Center Spindle */}
                <View style={styles.centerSpindle} />
              </View>

              {/* Tonearm */}
              <View style={[styles.tonearmBase, isPlaying && styles.tonearmPlaying]}>
                <View style={styles.tonearmArm} />
                <View style={styles.tonearmCartridge} />
              </View>
            </View>

            {/* Turntable RPM & Pitch Badge */}
            <View style={styles.rpmControlRow}>
              {([33, 45, 78] as const).map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[styles.rpmBadge, rpm === speed && styles.rpmBadgeActive]}
                  onPress={() => setRpm(speed)}
                >
                  <Text
                    style={[
                      styles.rpmBadgeText,
                      rpm === speed && styles.rpmBadgeTextActive,
                    ]}
                  >
                    {speed} RPM
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Track Details & Like Button */}
          <View style={styles.trackDetailsRow}>
            <View style={styles.titleArtistBox}>
              <Text style={styles.fullTitleText} numberOfLines={1}>
                {current.title}
              </Text>
              <Text style={styles.fullArtistText} numberOfLines={1}>
                {current.artist}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.heartBtn}
              onPress={() => toggleLike(current)}
              accessibilityLabel={isLiked ? 'Unlike song' : 'Like song'}
            >
              <Heart
                size={26}
                color={isLiked ? '#ffffff' : '#8b949e'}
                fill={isLiked ? '#ffffff' : 'none'}
              />
            </TouchableOpacity>
          </View>

          {/* Seek Bar */}
          <View style={styles.progressContainer}>
            <TouchableOpacity
              style={styles.scrubberTouch}
              activeOpacity={1}
              onPress={(e) => {
                const layoutWidth = 320; // approximate scrubber width
                const touchX = e.nativeEvent.locationX;
                const ratio = Math.max(0, Math.min(1, touchX / layoutWidth));
                seek(ratio * duration);
              }}
            >
              <View style={styles.scrubberBackground}>
                <View style={[styles.scrubberFill, { width: `${progressRatio * 100}%` }]} />
                <View style={[styles.scrubberHandle, { left: `${progressRatio * 100}%` }]} />
              </View>
            </TouchableOpacity>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(progress)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Main Controls Row */}
          <View style={styles.mainControlsRow}>
            <TouchableOpacity
              onPress={toggleShuffle}
              style={styles.secondaryControl}
              accessibilityLabel="Toggle shuffle"
            >
              <Shuffle size={20} color={shuffle ? '#ffffff' : '#6e7681'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={previous}
              style={styles.secondaryControl}
              accessibilityLabel="Previous track"
            >
              <SkipBack size={28} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={togglePlay}
              style={styles.bigPlayBtn}
              accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={28} color="#000" fill="#000" />
              ) : (
                <Play size={28} color="#000" fill="#000" style={{ marginLeft: 3 }} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={next}
              style={styles.secondaryControl}
              accessibilityLabel="Next track"
            >
              <SkipForward size={28} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleRepeat}
              style={styles.secondaryControl}
              accessibilityLabel="Toggle repeat"
            >
              <Repeat
                size={20}
                color={repeat !== 'off' ? '#ffffff' : '#6e7681'}
              />
            </TouchableOpacity>
          </View>

          {/* Volume Control Slider */}
          <View style={styles.volumeRow}>
            <TouchableOpacity onPress={toggleMute} accessibilityLabel="Mute toggle">
              {isMuted || volume === 0 ? (
                <VolumeX size={18} color="#8b949e" />
              ) : (
                <Volume2 size={18} color="#8b949e" />
              )}
            </TouchableOpacity>
            <View style={styles.volumeTrack}>
              <View
                style={[
                  styles.volumeFill,
                  { width: `${(isMuted ? 0 : volume) * 100}%` },
                ]}
              />
            </View>
          </View>
        </ScrollView>

        {/* Queue Drawer Modal */}
        <QueueDrawer isVisible={isQueueVisible} onClose={toggleQueue} />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0c0e12',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    padding: 6,
  },
  topCenterTitle: {
    alignItems: 'center',
  },
  playingFromText: {
    color: '#8b949e',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  albumSubText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    maxWidth: 200,
  },
  queueBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  scrollContentTablet: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  deckChassis: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 340,
    backgroundColor: '#161b22',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#30363d',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  deckChassisTablet: {
    maxHeight: 400,
  },
  turntablePlatter: {
    width: '90%',
    height: '90%',
    borderRadius: 200,
    backgroundColor: '#0c0e12',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  vinylRecord: {
    width: '90%',
    height: '90%',
    borderRadius: 200,
    backgroundColor: '#050608',
    borderWidth: 8,
    borderColor: '#1f242c',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  vinylRecordTablet: {
    width: '92%',
    height: '92%',
  },
  vinylPlaying: {
    borderColor: '#30363d',
  },
  vinylCover: {
    width: '50%',
    height: '50%',
    borderRadius: 100,
  },
  vinylCenterLabel: {
    width: '50%',
    height: '50%',
    borderRadius: 100,
    backgroundColor: '#21262d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSpindle: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#000000',
  },
  tonearmBase: {
    position: 'absolute',
    top: 10,
    right: 15,
    width: 20,
    height: 80,
    alignItems: 'center',
    transform: [{ rotate: '-15deg' }],
  },
  tonearmPlaying: {
    transform: [{ rotate: '15deg' }],
  },
  tonearmArm: {
    width: 3,
    height: 70,
    backgroundColor: '#c9d1d9',
  },
  tonearmCartridge: {
    width: 8,
    height: 14,
    backgroundColor: '#f0883e',
    borderRadius: 2,
  },
  rpmControlRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  rpmBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#21262d',
  },
  rpmBadgeActive: {
    backgroundColor: '#ffffff',
  },
  rpmBadgeText: {
    color: '#8b949e',
    fontSize: 10,
    fontWeight: '700',
  },
  rpmBadgeTextActive: {
    color: '#000000',
  },
  trackDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 14,
  },
  titleArtistBox: {
    flex: 1,
    marginRight: 16,
  },
  fullTitleText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  fullArtistText: {
    color: '#8b949e',
    fontSize: 15,
    marginTop: 4,
    fontWeight: '500',
  },
  heartBtn: {
    padding: 8,
  },
  progressContainer: {
    width: '100%',
    marginTop: 20,
  },
  scrubberTouch: {
    paddingVertical: 10,
  },
  scrubberBackground: {
    height: 4,
    backgroundColor: '#21262d',
    borderRadius: 2,
    position: 'relative',
  },
  scrubberFill: {
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  scrubberHandle: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    marginLeft: -6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeText: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: '600',
  },
  mainControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 24,
    paddingHorizontal: 12,
  },
  secondaryControl: {
    padding: 10,
  },
  bigPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    gap: 12,
    marginTop: 6,
  },
  volumeTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#21262d',
    borderRadius: 2,
  },
  volumeFill: {
    height: 4,
    backgroundColor: '#8b949e',
    borderRadius: 2,
  },
});
