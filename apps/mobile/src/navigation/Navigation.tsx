import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { Header } from '../components/common/Header';
import { TabBar, TabType } from '../components/common/TabBar';
import { MiniPlayer } from '../components/player/MiniPlayer';
import { FullPlayerModal } from '../components/player/FullPlayerModal';
import { QueueDrawer } from '../components/player/QueueDrawer';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { MusicScreen } from '../screens/MusicScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { PodcastsScreen } from '../screens/PodcastsScreen';
import { ListenTogetherScreen } from '../screens/ListenTogetherScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { DetailScreen } from '../screens/DetailScreens';
import { AuthModal } from '../screens/AuthModal';

export const Navigation: React.FC = () => {
  const { isTablet } = useResponsive();

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [detailView, setDetailView] = useState<{
    type: 'playlist' | 'album' | 'artist' | 'podcast';
    id: string;
  } | null>(null);

  // Modals
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleTabChange = (tab: TabType) => {
    setDetailView(null);
    setActiveTab(tab);
  };

  const handleNavigateDetail = (
    type: 'playlist' | 'album' | 'artist' | 'podcast',
    id: string
  ) => {
    setDetailView({ type, id });
  };

  const handleBackFromDetail = () => {
    setDetailView(null);
  };

  const renderActiveScreen = () => {
    if (detailView) {
      return (
        <DetailScreen
          type={detailView.type}
          id={detailView.id}
          onBack={handleBackFromDetail}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigateDetail={(type, id) => handleNavigateDetail(type, id)}
            onNavigateTab={(tab) => handleTabChange(tab as TabType)}
          />
        );
      case 'music':
        return (
          <MusicScreen
            onNavigateDetail={(type, id) => handleNavigateDetail(type, id)}
          />
        );
      case 'search':
        return (
          <SearchScreen
            onNavigateDetail={(type, id) => handleNavigateDetail(type, id)}
          />
        );
      case 'library':
        return (
          <LibraryScreen
            onNavigateDetail={(type, id) => handleNavigateDetail(type, id)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        );
      case 'podcasts':
        return (
          <PodcastsScreen
            onNavigateDetail={(type, id) => handleNavigateDetail(type, id)}
          />
        );
      case 'rooms':
        return (
          <ListenTogetherScreen onOpenAuth={() => setIsAuthOpen(true)} />
        );
      case 'profile':
        return (
          <ProfileScreen onOpenAuth={() => setIsAuthOpen(true)} />
        );
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />

      <View style={[styles.rootContainer, isTablet && styles.rootContainerTablet]}>
        {/* Tablet Navigation Rail (Left side) */}
        {isTablet && (
          <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
        )}

        {/* Main Content Viewport */}
        <View style={styles.viewport}>
          {/* Top Branding Header */}
          <Header
            onOpenProfile={() => handleTabChange('profile')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />

          {/* Active Screen View */}
          <View style={styles.screenContainer}>{renderActiveScreen()}</View>

          {/* Docked MiniPlayer */}
          <MiniPlayer
            onExpand={() => setIsFullPlayerOpen(true)}
            onOpenQueue={() => setIsQueueOpen(true)}
          />

          {/* Mobile Phone Bottom TabBar */}
          {!isTablet && (
            <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
          )}
        </View>
      </View>

      {/* Global Overlays & Modals */}
      <FullPlayerModal
        visible={isFullPlayerOpen}
        onClose={() => setIsFullPlayerOpen(false)}
        onOpenQueue={() => {
          setIsFullPlayerOpen(false);
          setIsQueueOpen(true);
        }}
      />

      <QueueDrawer
        visible={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
      />

      <AuthModal
        visible={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  rootContainer: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  rootContainerTablet: {
    flexDirection: 'row',
  },
  viewport: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  screenContainer: {
    flex: 1,
  },
});
