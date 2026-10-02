import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  Home,
  Disc3,
  Search,
  Library,
  Mic2,
  Users,
  User,
} from 'lucide-react-native';
import { useResponsive } from '../../hooks/useResponsive';

export type ScreenTab =
  | 'home'
  | 'music'
  | 'search'
  | 'library'
  | 'podcasts'
  | 'rooms'
  | 'live'
  | 'profile';

export type TabType = ScreenTab;

export interface TabBarProps {
  currentTab?: ScreenTab;
  activeTab?: ScreenTab;
  onSelectTab?: (tab: ScreenTab) => void;
  onTabChange?: (tab: ScreenTab) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  currentTab,
  activeTab,
  onSelectTab,
  onTabChange,
}) => {
  const { isTablet } = useResponsive();
  const selectedTab = activeTab || currentTab || 'home';
  const handleSelect = onTabChange || onSelectTab || (() => {});

  const tabs: { id: ScreenTab; label: string; Icon: any }[] = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'music', label: 'Turntable', Icon: Disc3 },
    { id: 'search', label: 'Search', Icon: Search },
    { id: 'library', label: 'Library', Icon: Library },
    { id: 'podcasts', label: 'Podcasts', Icon: Mic2 },
    { id: 'rooms', label: 'Listen Live', Icon: Users },
  ];

  if (isTablet) {
    return (
      <View style={styles.tabletRail}>
        {tabs.map(({ id, label, Icon }) => {
          const active = selectedTab === id;
          return (
            <TouchableOpacity
              key={id}
              style={[styles.tabletNavItem, active && styles.tabletNavItemActive]}
              onPress={() => handleSelect(id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Icon size={20} color={active ? '#d946ef' : '#94a3b8'} />
              <Text
                style={[
                  styles.tabletNavText,
                  active && styles.tabletNavTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.phoneTabBar}>
      {tabs.map(({ id, label, Icon }) => {
        const active = selectedTab === id;
        return (
          <TouchableOpacity
            key={id}
            style={styles.phoneNavItem}
            onPress={() => handleSelect(id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Icon size={20} color={active ? '#d946ef' : '#94a3b8'} />
            <Text
              style={[
                styles.phoneNavText,
                active && styles.phoneNavTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabletRail: {
    width: 90,
    backgroundColor: '#0b0f19',
    borderRightWidth: 1,
    borderRightColor: '#1f2937',
    paddingVertical: 24,
    alignItems: 'center',
    gap: 16,
  },
  tabletNavItem: {
    width: 74,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  tabletNavItemActive: {
    backgroundColor: 'rgba(217, 70, 239, 0.15)',
  },
  tabletNavText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  tabletNavTextActive: {
    color: '#d946ef',
    fontWeight: '700',
  },
  phoneTabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#0b0f19',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 4,
  },
  phoneNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  phoneNavText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 2,
  },
  phoneNavTextActive: {
    color: '#d946ef',
    fontWeight: '700',
  },
});
