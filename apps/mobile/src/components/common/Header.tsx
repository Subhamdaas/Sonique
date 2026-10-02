import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { User, LogIn, Disc3, Radio } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useResponsive } from '../../hooks/useResponsive';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  currentScreenTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenProfile,
  currentScreenTitle,
}) => {
  const { user } = useAuthStore();
  const { isTablet } = useResponsive();

  return (
    <View style={[styles.headerContainer, isTablet && styles.headerTablet]}>
      {/* Brand Logo & Tagline */}
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Disc3 size={18} color="#000" />
        </View>
        <Text style={styles.brandTitle}>SONIQUE</Text>
        <Text style={styles.brandSubtitle}>STUDIO</Text>
      </View>

      {/* Screen title on tablet */}
      {isTablet && currentScreenTitle && (
        <View style={styles.screenTitleContainer}>
          <Text style={styles.screenTitleText}>{currentScreenTitle}</Text>
        </View>
      )}

      {/* Auth & Profile Actions */}
      <View style={styles.actionRow}>
        {user ? (
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={onOpenProfile}
            accessibilityLabel="Open profile"
          >
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarLetter}>
                  {(user.name || user.email || 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
            {isTablet && (
              <Text style={styles.userName} numberOfLines={1}>
                {user.name || user.username || user.email.split('@')[0]}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={onOpenAuth}
            accessibilityLabel="Sign in"
          >
            <LogIn size={14} color="#000" />
            <Text style={styles.loginBtnText}>SIGN IN</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0c0e12',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1d24',
  },
  headerTablet: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8b949e',
    marginLeft: 6,
    letterSpacing: 1.5,
  },
  screenTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  screenTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e6edf3',
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  avatarImg: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarFallback: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#238636',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  userName: {
    color: '#c9d1d9',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    maxWidth: 120,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    gap: 6,
  },
  loginBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
