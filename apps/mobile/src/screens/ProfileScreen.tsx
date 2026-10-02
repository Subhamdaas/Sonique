import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {
  User,
  Crown,
  Shield,
  Settings,
  Headphones,
  Sliders,
  LogOut,
  Sparkles,
  Heart,
  ListMusic,
} from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { useLibraryStore } from '../store/libraryStore';
import { useResponsive } from '../hooks/useResponsive';
import { EmptyState } from '../components/common/EmptyState';

interface ProfileScreenProps {
  onOpenAuth?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenAuth }) => {
  const { isTablet } = useResponsive();
  const { user, subscription, logout } = useAuthStore();
  const { likedTracks, playlists, history } = useLibraryStore();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Sonique?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Sonique Profile"
          description="Sign in to view your profile, manage your subscription plan, and sync your music settings."
          actionLabel="Sign In / Register"
          onAction={onOpenAuth}
        />
      </View>
    );
  }

  const isPremium =
    subscription?.status === 'active' ||
    subscription?.plan === 'premium' ||
    user.role === 'ADMIN';


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={[styles.headerCard, isTablet && styles.headerCardTablet]}>
        <View style={styles.avatarWrapper}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={36} color="#d946ef" />
            </View>
          )}
          {isPremium && (
            <View style={styles.planBadge}>
              <Crown size={12} color="#000" />
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name || user.email.split('@')[0]}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.tierPill}>
            <Text style={styles.tierText}>
              {isPremium ? 'SONIQUE PREMIUM' : 'SONIQUE FREE TIER'}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Heart size={20} color="#f43f5e" />
          <Text style={styles.statValue}>{likedTracks.length}</Text>
          <Text style={styles.statLabel}>Liked Songs</Text>
        </View>

        <View style={styles.statCard}>
          <ListMusic size={20} color="#d946ef" />
          <Text style={styles.statValue}>{playlists.length}</Text>
          <Text style={styles.statLabel}>Playlists</Text>
        </View>

        <View style={styles.statCard}>
          <Headphones size={20} color="#06b6d4" />
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statLabel}>Played</Text>
        </View>
      </View>

      {/* Settings / Preferences Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.menuHeader}>Playback & Audio</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Sliders size={20} color="#94a3b8" />
            <Text style={styles.menuItemText}>Audio Quality</Text>
          </View>
          <Text style={styles.menuItemValue}>Lossless 320kbps</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Sparkles size={20} color="#94a3b8" />
            <Text style={styles.menuItemText}>Turntable DSP Mode</Text>
          </View>
          <Text style={styles.menuItemValue}>Tube Warmth</Text>
        </TouchableOpacity>

        <Text style={styles.menuHeader}>Account</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Shield size={20} color="#94a3b8" />
            <Text style={styles.menuItemText}>Subscription Plan</Text>
          </View>
          <Text style={styles.menuItemValue}>
            {isPremium ? 'Active' : 'Upgrade'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#f43f5e" />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  headerCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  headerCardTablet: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d946ef',
  },
  planBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#eab308',
    padding: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#111827',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  userEmail: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
  },
  tierPill: {
    backgroundColor: 'rgba(217, 70, 239, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#d946ef',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  menuSection: {
    padding: 16,
  },
  menuHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
  },
  menuItemValue: {
    fontSize: 13,
    color: '#94a3b8',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    padding: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f43f5e',
  },
});
