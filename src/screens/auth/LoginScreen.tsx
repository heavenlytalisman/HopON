import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DiscordIcon = () => (
  <Ionicons name="logo-discord" size={24} color="#FFFFFF" />
);

const GoogleIcon = () => (
  <Ionicons name="logo-google" size={24} color="#FFFFFF" />
);

export default function LoginScreen({ navigation }: RootStackScreenProps<'Login'>) {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isMobile, isDesktop, contentWidth } = useResponsive();

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await login(`Guest${Math.floor(Math.random() * 1000)}`);
      navigation.replace('MainTabs', { screen: 'Home' } as any);
    } catch (error: any) {
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  glowCircle: {
    position: 'absolute',
    top: -100,
    left: SCREEN_WIDTH / 2 - 150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
    opacity: 0.15,
    transform: [{ scale: 1.5 }],
  },
  glowCircleDesktop: {
    left: '50%' as any,
    transform: [{ translateX: -150 }, { scale: 1.5 }],
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    marginBottom: Spacing.md,
  },
  brandTitle: {
    fontSize: FontSizes.display,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  brandTitleDesktop: {
    fontSize: 52,
  },
  brandTitleAccent: {
    color: Colors.primaryLight,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitleAccent: {
    fontSize: FontSizes.lg,
    color: Colors.primaryLight,
    marginBottom: Spacing.xxl,
  },
  floatingIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.xl,
    width: '100%',
  },
  iconBubbleContainer: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  iconBubble: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 25, 40, 0.5)',
  },
  authSection: {
    width: '100%',
    gap: Spacing.md,
  },
  authButtonContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  discordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  glassButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#11131A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  glassButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  authButtonText: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  glassButtonText: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  chevronIcon: {
    position: 'absolute',
    right: Spacing.xl,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  dividerText: {
    color: Colors.textMuted,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F1219',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.xl,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureIconBox: {
    marginRight: Spacing.sm,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
  },
  featureDesc: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  footerText: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    marginTop: Spacing.xl,
  },
  footerLink: {
    color: Colors.primaryLight,
    fontWeight: '600',
  },
});
