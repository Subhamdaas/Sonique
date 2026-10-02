import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import {
  Heart,
  ListMusic,
  History,
  Plus,
  Play,
  Shuffle,
  Music,
  Trash2,
} from 'lucide-react-native';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { useResponsive } from '../hooks/useResponsive';
import { TrackRow } from '../components/media/TrackRow';
import { PlaylistCard } from '../components/media/PlaylistCard';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';

type LibraryTab = 'playlists' | 'liked' | 'history';

interface LibraryScreenProps {
  onNavigateDetail?: (type: 'album' | 'artist' | 'playlist', id: string) => void;
  onOpenAuth?: () => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  onNavigateDetail,
  onOpenAuth,
}) => {
  const { isTablet, columns } = useResponsive();
  const { user } = useAuthStore();
  const {
    playlists,
    likedTracks,
    history,
    isLoading,
    fetchPlaylists,
    fetchLikedTracks,
    fetchHistory,
    createPlaylist,
  } = useLibraryStore();
  const { currentTrack, isPlaying, playTrack, setQueue } = usePlayerStore();

  const [activeTab, setActiveTab] = useState<LibraryTab>('playlists');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  useEffect(() => {
    if (user) {
      fetchPlaylists();
      fetchLikedTracks();
      fetchHistory();
    }
  }, [user, fetchPlaylists, fetchLikedTracks, fetchHistory]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) return;
    try {
      await createPlaylist(newPlaylistTitle.trim(), newPlaylistDesc.trim() || undefined);
      setNewPlaylistTitle('');
      setNewPlaylistDesc('');
      setShowCreateModal(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to create playlist');
    }
  };

  const handlePlayLiked = (shuffle = false) => {
    if (likedTracks.length === 0) return;
    const tracksToPlay = shuffle
      ? [...likedTracks].sort(() => Math.random() - 0.5)
      : likedTracks;
    playTrack(tracksToPlay[0], tracksToPlay);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Sign in to view your library"
          description="Access your saved playlists, liked tracks, and listening history across all your devices."
          actionLabel="Sign In / Register"
          onAction={onOpenAuth}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Filter Tabs & Create Action */}
      <View style={styles.headerBar}>
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'playlists' && styles.tabBtnActive]}
            onPress={() => setActiveTab('playlists')}
          >
            <ListMusic
              size={16}
              color={activeTab === 'playlists' ? '#d946ef' : '#94a3b8'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'playlists' && styles.tabTextActive,
              ]}
            >
              Playlists ({playlists.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'liked' && styles.tabBtnActive]}
            onPress={() => setActiveTab('liked')}
          >
            <Heart
              size={16}
              color={activeTab === 'liked' ? '#f43f5e' : '#94a3b8'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'liked' && styles.tabTextActive,
              ]}
            >
              Liked ({likedTracks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
            onPress={() => setActiveTab('history')}
          >
            <History
              size={16}
              color={activeTab === 'history' ? '#06b6d4' : '#94a3b8'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'history' && styles.tabTextActive,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'playlists' && (
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={18} color="#f8fafc" />
            <Text style={styles.createBtnText}>New</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Tab Content */}
      {isLoading ? (
        <LoadingState message="Loading your library..." />
      ) : activeTab === 'playlists' ? (
        playlists.length === 0 ? (
          <EmptyState
            title="No Playlists Yet"
            description="Create your first playlist and start curating your favorite retro tracks."
            actionLabel="Create Playlist"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.playlistGrid,
              isTablet && styles.playlistGridTablet,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {playlists.map((pl) => (
              <PlaylistCard
                key={pl.id}
                playlist={pl}
                onPress={() =>
                  onNavigateDetail && onNavigateDetail('playlist', pl.id)
                }
              />
            ))}
          </ScrollView>
        )
      ) : activeTab === 'liked' ? (
        likedTracks.length === 0 ? (
          <EmptyState
            title="No Liked Songs"
            description="Tap the heart icon on any song to save it to your library."
          />
        ) : (
          <ScrollView style={styles.trackList} showsVerticalScrollIndicator={false}>
            {/* Liked Header Controls */}
            <View style={styles.likedHeader}>
              <View>
                <Text style={styles.likedTitle}>Liked Songs</Text>
                <Text style={styles.likedSubtitle}>
                  {likedTracks.length} song{likedTracks.length === 1 ? '' : 's'}
                </Text>
              </View>
              <View style={styles.likedActions}>
                <TouchableOpacity
                  style={styles.actionCircleBtn}
                  onPress={() => handlePlayLiked(true)}
                >
                  <Shuffle size={18} color="#d946ef" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionCircleBtn, styles.actionPlayBtn]}
                  onPress={() => handlePlayLiked(false)}
                >
                  <Play size={20} color="#0f172a" fill="#0f172a" />
                </TouchableOpacity>
              </View>
            </View>

            {likedTracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                isCurrent={currentTrack?.id === track.id}
                isPlaying={isPlaying && currentTrack?.id === track.id}
                onPress={() => playTrack(track, likedTracks)}
              />
            ))}
          </ScrollView>
        )
      ) : (
        /* History Tab */
        history.length === 0 ? (
          <EmptyState
            title="No Listening History"
            description="Songs you listen to will show up here."
          />
        ) : (
          <ScrollView style={styles.trackList} showsVerticalScrollIndicator={false}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Recently Played</Text>
            </View>
            {history.map((track, idx) => (
              <TrackRow
                key={`${track.id}-${idx}`}
                track={track}
                index={idx}
                isCurrent={currentTrack?.id === track.id}
                isPlaying={isPlaying && currentTrack?.id === track.id}
                onPress={() => playTrack(track, history)}
              />
            ))}
          </ScrollView>
        )
      )}

      {/* Create Playlist Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Playlist title"
              placeholderTextColor="#64748b"
              value={newPlaylistTitle}
              onChangeText={setNewPlaylistTitle}
              autoFocus
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              placeholder="Description (optional)"
              placeholderTextColor="#64748b"
              value={newPlaylistDesc}
              onChangeText={setNewPlaylistDesc}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveModalBtn,
                  !newPlaylistTitle.trim() && styles.saveModalBtnDisabled,
                ]}
                disabled={!newPlaylistTitle.trim()}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.saveModalText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1f2937',
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#d946ef',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#f8fafc',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d946ef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  playlistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  playlistGridTablet: {
    padding: 20,
    gap: 20,
  },
  trackList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  likedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    marginBottom: 8,
  },
  likedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  likedSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  likedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPlayBtn: {
    backgroundColor: '#d946ef',
  },
  historyHeader: {
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#1f2937',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 12,
  },
  modalTextarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelModalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelModalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  saveModalBtn: {
    backgroundColor: '#d946ef',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveModalBtnDisabled: {
    opacity: 0.5,
  },
  saveModalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
