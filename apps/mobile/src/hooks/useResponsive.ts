import { useWindowDimensions } from 'react-native';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isTablet: boolean;
  isPhone: boolean;
  isLargeTablet: boolean;
  isLandscape: boolean;
  columns: number;
  cardWidth: number;
  contentPadding: number;
  sidebarWidth: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLargeTablet = width >= 1024;
  const isLandscape = width > height;
  const isPhone = !isTablet;

  const contentPadding = isLargeTablet ? 32 : isTablet ? 24 : 16;
  const sidebarWidth = isLargeTablet ? 260 : isTablet ? 220 : 0;

  let columns = 2;
  if (isLargeTablet) {
    columns = isLandscape ? 5 : 4;
  } else if (isTablet) {
    columns = isLandscape ? 4 : 3;
  } else {
    columns = isLandscape ? 3 : 2;
  }

  const availableWidth = width - sidebarWidth - contentPadding * 2;
  const gap = 14;
  const cardWidth = Math.floor((availableWidth - gap * (columns - 1)) / columns);

  return {
    width,
    height,
    isTablet,
    isPhone,
    isLargeTablet,
    isLandscape,
    columns,
    cardWidth,
    contentPadding,
    sidebarWidth,
  };
}
