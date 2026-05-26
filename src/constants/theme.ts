/**
 * Premium Dark Theme tokens for HopON
 * Matches the neon purple/indigo aesthetic
 */

export const Colors = {
  // Brand
  primary: '#7C3AED', // Neon Purple
  primaryLight: '#A78BFA',
  secondary: '#EC4899', // Neon Pink
  accent: '#10B981', // Neon Green (Status)

  // Backgrounds
  background: '#0B0D17', // Deep dark blue/black
  surface: '#151928', // Slightly lighter for cards
  surfaceAlt: '#1A1E2E',
  
  // Neon Glow Colors
  glowPurple: 'rgba(124, 58, 237, 0.5)',
  glowBlue: 'rgba(59, 130, 246, 0.4)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8', // Slate 400
  textMuted: '#64748B', // Slate 500
  textPlaceholder: '#475569',

  // Borders
  border: '#1E293B',
  borderLight: '#334155',

  // Status
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',

  // Overlay
  dimOverlay: 'rgba(0, 0, 0, 0.7)',
  glassOverlay: 'rgba(21, 25, 40, 0.65)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 15,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  hero: 28,
  display: 42,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 9999,
  circle: (size: number) => size / 2,
} as const;
