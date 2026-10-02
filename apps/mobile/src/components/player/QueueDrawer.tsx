import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { X, Play, Trash2, Music } from 'lucide-react-native';
import { usePlayerStore } from '../../store/playerStore';
import { Track } from '../../types';

interface QueueDrawerProps {
  visible?: boolean;
  isVisible?: boolean;
  onClose: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  visible,
  isVisible,
  onClose,
}) => {
  const showModal = visible !== undefined ? visible : !!isVisible;
  const { queue, queueIndex, current, setCurrent, removeFromQueue, clearQueue } =
    usePlayerStore();


  const formatDuration = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Modal
      visible={showModal}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >

      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Play Queue</Text>
              <Text style={styles.subtitle}>{queue.length} tracks in queue</Text>
            </View>
            <View style={styles.headerActions}>
              {queue.length > 0 && (
                <TouchableOpacity style={styles.clearBtn} onPress={clearQueue}>
                  <Text style={styles.clearText}>CLEAR</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          <FlatList
            data={queue}
            keyExtractor={(item, idx) => item.id + idx}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const isCurrent = current?.id === item.id;
              return (
                <TouchableOpacity
                  style={[styles.itemRow, isCurrent && styles.itemRowCurrent]}
                  onPress={() => setCurrent(item, queue)}
                >
                  <Text style={[styles.indexText, isCurrent && styles.indexCurrent]}>
                    {isCurrent ? '▶' : index + 1}
                  </Text>

                  {item.coverUrl ? (
                    <Image source={{ uri: item.coverUrl }} style={styles.thumb} />
                  ) : (
                    <View style={styles.thumbFallback}>
                      <Music size={14} color="#8b949e" />
                    </View>
                  )}

                  <View style={styles.meta}>
                    <Text
                      style={[styles.itemTitle, isCurrent && styles.titleCurrent]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.itemArtist} numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </View>

                  <Text style={styles.duration}>
                    {formatDuration(item.duration)}
                  </Text>

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeFromQueue(item.id)}
                    accessibilityLabel="Remove from queue"
                  >
                    <Trash2 size={14} color="#8b949e" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>The queue is empty.</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: '70%',
    backgroundColor: '#161b22',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#30363d',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#8b949e',
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#21262d',
  },
  clearText: {
    color: '#f85149',
    fontSize: 10,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  itemRowCurrent: {
    backgroundColor: '#21262d',
  },
  indexText: {
    color: '#8b949e',
    fontSize: 12,
    width: 24,
    textAlign: 'center',
  },
  indexCurrent: {
    color: '#ffffff',
    fontWeight: '800',
  },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: 4,
    marginRight: 10,
  },
  thumbFallback: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: '#0c0e12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  meta: {
    flex: 1,
  },
  itemTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  titleCurrent: {
    fontWeight: '800',
  },
  itemArtist: {
    color: '#8b949e',
    fontSize: 11,
    marginTop: 2,
  },
  duration: {
    color: '#8b949e',
    fontSize: 11,
    marginRight: 10,
  },
  removeBtn: {
    padding: 6,
  },
  emptyWrap: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8b949e',
    fontSize: 14,
  },
});
