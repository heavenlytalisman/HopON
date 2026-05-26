import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveValues {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** Max content width — keeps content readable on wide screens */
  contentWidth: number;
  /** Number of columns for grid layouts */
  columns: number;
  /** Horizontal padding that scales with screen size */
  horizontalPadding: number;
}

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();

  const breakpoint: Breakpoint =
    width >= 1024 ? 'desktop' : width >= 768 ? 'tablet' : 'mobile';

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';

  // On desktop, constrain content to a comfortable reading width
  const contentWidth = isDesktop ? 480 : isTablet ? Math.min(600, width - 64) : width;

  // Grid columns for list layouts
  const columns = isDesktop ? 2 : 1;

  // Padding scales up on larger screens
  const horizontalPadding = isDesktop ? 40 : isTablet ? 32 : 20;

  return {
    width,
    height,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    contentWidth,
    columns,
    horizontalPadding,
  };
}
