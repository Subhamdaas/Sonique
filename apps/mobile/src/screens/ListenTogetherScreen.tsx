import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Modal,
} from 'react-native';
import {
  Users,
  Plus,
  Radio,
  Send,
  Sparkles,
  LogOut,
  Play,
  Pause,
  Crown,
  Disc,
} from 'lucide-react-native';
import { useRoomStore } from '../store/roomStore';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import { useResponsive } from '../hooks/useResponsive';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';

const QUICK_REACTIONS = ['🔥', '🎧', '❤️', '✨', '🚀', '💯'];

interface ListenTogetherScreenProps {
  onOpenAuth?: () => void;
}

export const ListenTogetherScreen: React.FC<ListenTogetherScreenProps> = ({
  onOpenAuth,
}) => {
  const { isTablet } = useResponsive();
  const { user } = useAuthStore();
  const {
    currentRoom,
    messages,
    activeRooms,
    isConnected,
    isLoading,
    fetchRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendReaction,
    syncPlayback,
  } = useRoomStore();

  const { isPlaying, currentTrack, togglePlayPause } = usePlayerStore();

  const [newRoomName, setNewRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user && !currentRoom) {
      fetchRooms();
    }
  }, [user, currentRoom, fetchRooms]);

  const handleCreate = async () => {
    if (!newRoomName.trim()) return;
    try {
      await createRoom(newRoomName.trim());
      setNewRoomName('');
      setShowCreateModal(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to create room');
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    try {
      await joinRoom(joinCode.trim());
      setJoinCode('');
    } catch (err) {
      Alert.alert('Error', 'Room not found or invalid code');
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    sendMessage(chatInput.trim());
    setChatInput('');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Listen Together"
          description="Sign in to create or join listening parties with synchronized playback, live chat, and reactions."
          actionLabel="Sign In / Register"
          onAction={onOpenAuth}
        />
      </View>
    );
  }

  // Active in a room view
  if (currentRoom) {
    const isHost = currentRoom.hostId === user.id;

    return (
      <View style={styles.container}>
        {/* Room Header */}
        <View style={styles.roomHeader}>
          <View style={styles.roomMeta}>
            <Text style={styles.roomTitle} numberOfLines={1}>
              {currentRoom.name}
            </Text>
            <View style={styles.roomStatusRow}>
              <View style={styles.liveIndicator} />
              <Text style={styles.roomStatusText}>
                {currentRoom.members?.length || 1} listening • Code: {currentRoom.code || currentRoom.id.slice(0, 6)}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.leaveBtn} onPress={leaveRoom}>
            <LogOut size={16} color="#f43f5e" />
            <Text style={styles.leaveBtnText}>Leave</Text>
          </TouchableOpacity>
        </View>

        {/* Room Content: Adaptive layout for Tablet vs Phone */}
        <View style={[styles.roomBody, isTablet && styles.roomBodyTablet]}>
          {/* Left / Top: Current Track & Sync info */}
          <View style={[styles.stageSection, isTablet && styles.stageSectionTablet]}>
            <View style={styles.stageCard}>
              <View style={styles.platterGlow}>
                {currentRoom.currentTrack?.coverUrl ? (
                  <Image
                    source={{ uri: currentRoom.currentTrack.coverUrl }}
                    style={styles.stageCover}
                  />
                ) : (
                  <View style={[styles.stageCover, styles.stageCoverPlaceholder]}>
                    <Disc size={36} color="#d946ef" />
                  </View>
                )}
              </View>

              <Text style={styles.stageTrackTitle} numberOfLines={1}>
                {currentRoom.currentTrack?.title || 'Waiting for host to play...'}
              </Text>
              <Text style={styles.stageTrackArtist} numberOfLines={1}>
                {currentRoom.currentTrack?.artist || 'Synched Audio Session'}
              </Text>

              {isHost && (
                <View style={styles.hostControlNotice}>
                  <Crown size={14} color="#eab308" />
                  <Text style={styles.hostNoticeText}>You are the DJ / Host</Text>
                </View>
              )}
            </View>

            {/* Member Avatars */}
            <View style={styles.membersRow}>
              <Text style={styles.membersLabel}>In the room:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.avatarList}
              >
                {currentRoom.members?.map((member) => (
                  <View key={member.id} style={styles.memberAvatarWrapper}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitial}>
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </Text>
                    </View>
                    {member.isHost && (
                      <View style={styles.crownBadge}>
                        <Crown size={10} color="#000" />
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Quick Reactions Bar */}
            <View style={styles.reactionsBar}>
              {QUICK_REACTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.reactionBtn}
                  onPress={() => sendReaction(emoji)}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Right / Bottom: Live Chat Stream */}
          <View style={[styles.chatSection, isTablet && styles.chatSectionTablet]}>
            <ScrollView
              style={styles.chatStream}
              contentContainerStyle={styles.chatContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.length === 0 ? (
                <Text style={styles.emptyChatText}>
                  Welcome to the room! Send a message or react to the music.
                </Text>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.userId === user.id;
                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.chatBubble,
                        isMe ? styles.chatBubbleMe : styles.chatBubbleOther,
                      ]}
                    >
                      <Text style={styles.chatSender}>{msg.userName || 'Member'}</Text>
                      <Text style={styles.chatMessageText}>{msg.text}</Text>
                    </View>
                  );
                })
              )}
            </ScrollView>

            {/* Chat Input Bar */}
            <View style={styles.chatInputBar}>
              <TextInput
                style={styles.chatInput}
                placeholder="Say something to the room..."
                placeholderTextColor="#64748b"
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  !chatInput.trim() && styles.sendBtnDisabled,
                ]}
                disabled={!chatInput.trim()}
                onPress={handleSendMessage}
              >
                <Send size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Room Lobby View
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Lobby Hero & Actions */}
      <View style={styles.lobbyHero}>
        <View style={styles.heroHeader}>
          <Text style={styles.lobbyTitle}>Listen Together</Text>
          <Radio size={22} color="#d946ef" />
        </View>
        <Text style={styles.lobbySubtitle}>
          Host a virtual turntable session or join friends with real-time synchronized playback and chat.
        </Text>

        <View style={styles.lobbyActions}>
          <TouchableOpacity
            style={styles.createRoomBtn}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={18} color="#ffffff" />
            <Text style={styles.createRoomText}>Create Room</Text>
          </TouchableOpacity>

          <View style={styles.joinCodeBox}>
            <TextInput
              style={styles.joinInput}
              placeholder="Enter 6-digit room code"
              placeholderTextColor="#64748b"
              value={joinCode}
              onChangeText={setJoinCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.joinBtn, !joinCode.trim() && styles.joinBtnDisabled]}
              disabled={!joinCode.trim()}
              onPress={handleJoinByCode}
            >
              <Text style={styles.joinBtnText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Active Public Rooms */}
      <View style={styles.roomsSection}>
        <Text style={styles.sectionHeader}>Public Rooms</Text>
        {activeRooms.length === 0 ? (
          <EmptyState
            title="No Active Rooms"
            description="Be the first to create a room and start a synchronized listening session."
          />
        ) : (
          activeRooms.map((room) => (
            <TouchableOpacity
              key={room.id}
              style={styles.roomCard}
              onPress={() => joinRoom(room.id)}
            >
              <View style={styles.roomCardInfo}>
                <Text style={styles.roomCardTitle}>{room.name}</Text>
                <Text style={styles.roomCardSubtitle}>
                  Host: {room.hostName || 'DJ'} • {room.members?.length || 1} listening
                </Text>
              </View>
              <View style={styles.joinBadge}>
                <Text style={styles.joinBadgeText}>Join</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Create Room Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Listening Room</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Room name (e.g. Synthwave Night)"
              placeholderTextColor="#64748b"
              value={newRoomName}
              onChangeText={setNewRoomName}
              autoFocus
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
                  !newRoomName.trim() && styles.saveModalBtnDisabled,
                ]}
                disabled={!newRoomName.trim()}
                onPress={handleCreate}
              >
                <Text style={styles.saveModalText}>Create & Enter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  lobbyHero: {
    padding: 20,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  lobbyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
  },
  lobbySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 16,
  },
  lobbyActions: {
    gap: 12,
  },
  createRoomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d946ef',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createRoomText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  joinCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    paddingRight: 6,
  },
  joinInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
  },
  joinBtn: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinBtnDisabled: {
    opacity: 0.5,
  },
  joinBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  roomsSection: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 10,
  },
  roomCardInfo: {
    flex: 1,
  },
  roomCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  roomCardSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  joinBadge: {
    backgroundColor: 'rgba(217, 70, 239, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  joinBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#d946ef',
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  roomMeta: {
    flex: 1,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  roomStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  roomStatusText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  leaveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f43f5e',
  },
  roomBody: {
    flex: 1,
  },
  roomBodyTablet: {
    flexDirection: 'row',
  },
  stageSection: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  stageSectionTablet: {
    flex: 1,
    borderBottomWidth: 0,
    borderRightWidth: 1,
    borderRightColor: '#1f2937',
    justifyContent: 'center',
  },
  stageCard: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  platterGlow: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(217, 70, 239, 0.1)',
  },
  stageCover: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  stageCoverPlaceholder: {
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageTrackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: 12,
    textAlign: 'center',
  },
  stageTrackArtist: {
    fontSize: 14,
    color: '#d946ef',
    marginTop: 2,
    textAlign: 'center',
  },
  hostControlNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
  },
  hostNoticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#eab308',
  },
  membersRow: {
    width: '100%',
    marginTop: 8,
    marginBottom: 12,
  },
  membersLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  avatarList: {
    flexDirection: 'row',
    gap: 8,
  },
  memberAvatarWrapper: {
    position: 'relative',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d946ef',
  },
  memberInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
  },
  crownBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#eab308',
    borderRadius: 6,
    padding: 2,
  },
  reactionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#111827',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  reactionBtn: {
    padding: 6,
  },
  reactionEmoji: {
    fontSize: 20,
  },
  chatSection: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  chatSectionTablet: {
    flex: 1.2,
  },
  chatStream: {
    flex: 1,
    padding: 12,
  },
  chatContent: {
    gap: 8,
  },
  emptyChatText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 20,
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 12,
  },
  chatBubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#701a75',
  },
  chatBubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#1f2937',
  },
  chatSender: {
    fontSize: 11,
    fontWeight: '700',
    color: '#d946ef',
    marginBottom: 2,
  },
  chatMessageText: {
    fontSize: 14,
    color: '#f8fafc',
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#f8fafc',
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: '#d946ef',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
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
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
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
