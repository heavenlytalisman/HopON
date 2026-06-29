import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal, Vibration, Alert , RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';
import type { MainTabScreenProps } from '../../types';

const { width } = Dimensions.get('window');

import { EmptyState } from '../../components/ui/EmptyState';
import { useFriends } from '../../hooks/useFriends';
import { useFeed } from '../../hooks/useFeed';
import { useSquads } from '../../hooks/useSquads';
import { useNotifications } from '../../hooks/useNotifications';
import { Image } from 'expo-image';



export default function DashboardScreen({ navigation }: MainTabScreenProps<'Home'>) {

  const { profile } = useAuth();
  const { isDesktop, contentWidth, horizontalPadding, columns } = useResponsive();
  const { friends, loadingFriends , refreshFriends } = useFriends();
  const { posts, loading: feedLoading } = useFeed();
  const { notifications } = useNotifications();

  const [showFriends, setShowFriends] = useState(false);

  const displayAvatar = profile?.avatar;

  const onlineFriends = friends.filter((f: any) => f.isOnline);

  const { squads , refreshSquads } = useSquads();
  const isSquadOnline = squads.some(squad =>
    squad.members.some(memberId => memberId !== profile?.uid)
  );

  const recentActivityPosts = posts.filter(post =>
    post.author.name === profile?.nickname || friends.some(f => f.nickname === post.author.name)
  );

  const isProfileSetup = !!profile?.avatar && !profile.avatar.includes('ui-avatars.com');
  const hasFriends = friends.length > 0;
  const hasSquads = squads.length > 0;
  const onboardingProgress = [isProfileSetup, hasFriends, hasSquads].filter(Boolean).length;
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (refreshSquads) await refreshSquads();
    if (refreshFriends) await refreshFriends();
    setRefreshing(false);
  }, [refreshSquads, refreshFriends]);


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} colors={[Colors.primaryLight]} />} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, alignSelf: 'center', width: '100%' }]}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications' as any)}>
              <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
              {notifications.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notifications.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
              <Image source={{ uri: displayAvatar }} style={styles.profileAvatar} />
              <View style={styles.onlineIndicator} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Yo, {profile?.nickname || 'Arjun'}</Text>
          <Text style={styles.greetingSubtitle}>
            Your squad is <Text style={{ color: isSquadOnline ? Colors.success : Colors.textMuted }}>
              {isSquadOnline ? '● ONLINE' : '○ OFFLINE'}
            </Text>
          </Text>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#1A1B26', '#0F1219']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroSubtitle}>Squad is</Text>
            <Text style={[styles.heroTitle, !isSquadOnline && { color: Colors.textMuted }]}>{isSquadOnline ? 'ONLINE' : 'OFFLINE'}</Text>
            <Text style={styles.heroDesc}>{isSquadOnline ? "See who's around and\nHopON to play!" : "Nobody's around right now.\nCheck back later!"}</Text>
            <TouchableOpacity style={styles.heroButton} onPress={() => navigation.navigate('Squads')}>
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.heroButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.heroButtonText}>View Squad</Text>
                <Ionicons name="chevron-forward" size={16} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.heroAbstractShape} />
        </View>

        {/* Friends Online */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Friends <Text style={{ color: onlineFriends.length > 0 ? Colors.success : Colors.textMuted, fontSize: 12 }}>
              {onlineFriends.length > 0 ? `● ${onlineFriends.length} Online` : `○ OFFLINE`}
            </Text>
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('FriendList')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {onlineFriends.length === 0 && !loadingFriends ? (
          <EmptyState
            iconName="people-outline"
            title="No friends yet"
            subtitle="Add friends to see who's online and hop into games together!"
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
            {onlineFriends.map((user) => (
              <TouchableOpacity
                key={user.uid}
                style={styles.onlineUserItem}
                onPress={() => navigation.navigate('FriendProfile', { friendId: user.uid, friendName: user.nickname, friendAvatar: user.avatar || '' })}
              >
                <View style={[styles.avatarRing, { borderColor: Colors.success }]}>
                  <Image source={{ uri: user.avatar }} style={styles.onlineAvatar} />
                  <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
                </View>
                <Text style={styles.onlineUserName} numberOfLines={1}>{user.nickname}</Text>
                <Text style={[styles.onlineUserStatus, { color: Colors.success }]}>Online</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.onlineUserItem}>
              <View style={[styles.avatarRing, { borderColor: '#1E293B', borderStyle: 'dashed' }]}>
                <Image source={{ uri: displayAvatar }} style={[styles.onlineAvatar, { opacity: 0.5 }]} />
                <View style={styles.addIconBadge}>
                  <Ionicons name="add" size={14} color="#FFF" />
                </View>
              </View>
              <Text style={styles.onlineUserName}>You</Text>
              <Text style={[styles.onlineUserStatus, { color: Colors.success }]}>Online</Text>
            </View>
          </ScrollView>
        )}

        {/* Onboarding Checklist */}
        {onboardingProgress < 3 && (
          <View style={styles.onboardingContainer}>
            <View style={styles.onboardingHeader}>
              <Text style={styles.onboardingTitle}>Getting Started</Text>
              <Text style={styles.onboardingProgress}>{onboardingProgress}/3 completed</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(onboardingProgress / 3) * 100}%` }]} />
            </View>

            <TouchableOpacity style={styles.onboardingTask} onPress={() => navigation.navigate('Profile')}>
              <View style={[styles.taskCheckbox, isProfileSetup && styles.taskCheckboxDone]}>
                {isProfileSetup && <Ionicons name="checkmark" size={12} color="#FFF" />}
              </View>
              <Text style={[styles.taskText, isProfileSetup && styles.taskTextDone]}>Set up your profile avatar</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.onboardingTask} onPress={() => navigation.navigate('FriendList')}>
              <View style={[styles.taskCheckbox, hasFriends && styles.taskCheckboxDone]}>
                {hasFriends && <Ionicons name="checkmark" size={12} color="#FFF" />}
              </View>
              <Text style={[styles.taskText, hasFriends && styles.taskTextDone]}>Add your first friend</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.onboardingTask} onPress={() => navigation.navigate('Squads')}>
              <View style={[styles.taskCheckbox, hasSquads && styles.taskCheckboxDone]}>
                {hasSquads && <Ionicons name="checkmark" size={12} color="#FFF" />}
              </View>
              <Text style={[styles.taskText, hasSquads && styles.taskTextDone]}>Create or join a squad</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Lists Row */}
        <View style={[styles.twoColumnRow, columns === 2 && styles.desktopTwoColumnRow]}>


          {/* Recent Activity */}
          <View style={styles.column}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate('RecentActivity' as any)}><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
            </View>
            {recentActivityPosts.length === 0 && !feedLoading ? (
              <EmptyState
                iconName="pulse-outline"
                title="No recent activity"
                subtitle="Follow more people or join squads to see what's happening."
              />
            ) : (
              <View style={styles.listContainer}>
                {recentActivityPosts.slice(0, 3).map(post => (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.listItem}
                    onPress={() => navigation.navigate('PostDetail' as any, { postId: post.id })}
                  >
                    <Image source={{ uri: post.author.avatar }} style={styles.activityAvatar} />
                    <View style={styles.listInfo}>
                      <Text style={styles.activityUserText}>
                        <Text style={{ color: Colors.textPrimary, fontWeight: '600' }}>{post.author.name}</Text> posted
                      </Text>
                      <Text style={styles.activityGameText} numberOfLines={1}>{post.content}</Text>
                    </View>
                    <View style={styles.activityRight}>
                      <Text style={styles.activityTime}>{post.timestamp}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100, // Space for tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  iconButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  profileButton: {
    position: 'relative',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  greetingSection: {
    marginBottom: Spacing.lg,
  },
  greetingTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  greetingSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  heroCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: Spacing.xxl,
    minHeight: 180,
  },
  heroContent: {
    padding: Spacing.lg,
    zIndex: 2,
  },
  heroSubtitle: {
    color: Colors.textMuted,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  heroDesc: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  heroButton: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  heroButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  heroButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: FontSizes.sm,
  },
  heroAbstractShape: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primary,
    opacity: 0.2,
    zIndex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: Colors.primaryLight,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  horizontalList: {
    marginLeft: -Spacing.xl,
    paddingLeft: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  onlineUserItem: {
    alignItems: 'center',
    marginRight: Spacing.lg,
    width: 64,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  onlineAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  statusIconBadge: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  addIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  onlineUserName: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  onlineUserStatus: {
    fontSize: 10,
  },
  actionRow: {
    marginBottom: Spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1E2E',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  actionCardSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151928',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  actionIconBoxSecondary: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  actionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    paddingRight: Spacing.lg,
  },
  actionRowContainer: {
    flexDirection: 'column',
  },
  desktopActionRowItem: {
    marginBottom: Spacing.md,
  },
  twoColumnRow: {
    flexDirection: 'column',
    gap: Spacing.xl,
    marginTop: Spacing.md,
  },
  desktopTwoColumnRow: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  listContainer: {
    backgroundColor: '#151928',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: Spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  listIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  activityAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: Spacing.md,
  },
  listInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  listTitle: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  listSubtitle: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  activityUserText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  activityGameText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  joinBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  joinBtnPurple: {
    backgroundColor: '#7C3AED',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  joinBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityTime: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  onboardingContainer: {
    backgroundColor: '#151928',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  onboardingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  onboardingTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
  onboardingProgress: {
    color: Colors.primaryLight,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  onboardingTask: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  taskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#334155',
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckboxDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  taskText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  taskTextDone: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  sosOverlay: {
    flex: 1,
    backgroundColor: '#0F1219',
  },
  sosContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: Spacing.xxl,
  },
  sosContentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  sosIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  sosTitle: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  sosBody: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  sosMessage: {
    color: '#94A3B8',
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: Spacing.xl,
  },
  sosTime: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  sosButtonGroup: {
    flexDirection: 'column',
    gap: Spacing.md,
    width: '100%',
    paddingBottom: Spacing.xl,
  },
  sosDeclineBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  sosDeclineText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  sosAcceptBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  sosAcceptText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    zIndex: 1,
  },
  quickRepliesContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  quickReplyPrompt: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: Spacing.xl,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  replyChip: {
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  replyChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  cancelReplyButton: {
    marginTop: Spacing.xl,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelReplyText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  notificationsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 18, 25, 0.7)',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: Spacing.md,
  },
  notificationsContainer: {
    backgroundColor: '#151928',
    width: '100%',
    maxHeight: '80%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  notificationsTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  friendListItem: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    alignItems: 'center',
  },
  friendListInfo: {
    flex: 1,
  },
  friendListName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  friendListStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  friendListAction: {
    padding: Spacing.sm,
  },
});
