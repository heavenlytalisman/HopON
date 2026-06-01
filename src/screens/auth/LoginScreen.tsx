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
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* Temporarily disabled
const DiscordIcon = () => (
  <Ionicons name="logo-discord" size={24} color="#FFFFFF" />
);

const GoogleIcon = () => (
  <Ionicons name="logo-google" size={24} color="#FFFFFF" />
);
*/

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B0D17', '#0A0A0A']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Background Glow Effect */}
      <View style={[styles.glowCircle, isDesktop && styles.glowCircleDesktop]} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { maxWidth: contentWidth, alignSelf: 'center', width: '100%' },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>

            <View style={styles.topSection}>
              {/* Sleek Minimalist Logo */}
              <View style={styles.logoContainer}>
                <View style={styles.logoDot} />
                <Text style={[styles.brandTitle, isDesktop && styles.brandTitleDesktop]}>
                  HOP<Text style={styles.brandTitleAccent}>ON</Text>
                </Text>
              </View>

              <Text style={styles.subtitle}>Your squad is waiting.</Text>
              <Text style={styles.subtitleAccent}>
                hopon <Text style={{ color: Colors.textSecondary }}>and never miss a moment.</Text>
              </Text>
            </View>

            <View style={styles.authSection}>
              {/* Temporarily disabled
              <TouchableOpacity style={styles.authButtonContainer} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.discordButton}
                >
                  <DiscordIcon />
                  <Text style={styles.authButtonText}>Continue with Discord</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" style={styles.chevronIcon} />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.glassButton} activeOpacity={0.7}>
                <View style={styles.glassButtonContent}>
                  <GoogleIcon />
                  <Text style={styles.glassButtonText}>Continue with Google</Text>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" style={styles.chevronIcon} />
                </View>
              </TouchableOpacity>
              */}

              <TouchableOpacity style={styles.glassButton} activeOpacity={0.7} onPress={() => navigation.navigate('EmailLogin')}>
                <View style={styles.glassButtonContent}>
                  <Ionicons name="mail-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.glassButtonText}>Continue with Email</Text>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" style={styles.chevronIcon} />
                </View>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.glassButton} activeOpacity={0.7} onPress={handleGuestLogin} disabled={loading}>
                <View style={styles.glassButtonContent}>
                  <Ionicons name="person-outline" size={24} color={Colors.primaryLight} />
                  <Text style={[styles.glassButtonText, { color: Colors.primaryLight }]}>Continue as Guest</Text>
                  {loading ? (
                    <ActivityIndicator color={Colors.primaryLight} style={styles.chevronIcon} />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={Colors.primaryLight} style={styles.chevronIcon} />
                  )}
                </View>
              </TouchableOpacity>
            </View>


            <Text style={styles.footerText}>
              By continuing, you agree to our <Text style={styles.footerLink}>Terms of Service</Text> and <Text style={styles.footerLink}>Privacy Policy</Text>.
            </Text>

          </View>
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryLight,
    marginRight: Spacing.md,
    shadowColor: Colors.primaryLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: '300', // Sleek, light font
    color: '#E2E8F0',
    letterSpacing: 8,
  },
  brandTitleDesktop: {
    fontSize: 56,
  },
  brandTitleAccent: {
    color: '#FFFFFF',
    fontWeight: '700', // Sharp contrast
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    fontWeight: '400',
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  subtitleAccent: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
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
