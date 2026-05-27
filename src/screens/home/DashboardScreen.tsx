import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Dimensions, Modal, Vibration, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';
import type { MainTabScreenProps } from '../../types';

const { width } = Dimensions.get('window');

const MOCK_ONLINE = [
  { id: '1', name: 'Vasif', status: 'Online', statusColor: Colors.success, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Rahid', status: 'Online', statusColor: Colors.success, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Aman', status: 'Online', statusColor: Colors.success, avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Prem', status: 'Online', statusColor: Colors.success, avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'Karan', status: 'Online', statusColor: Colors.success, avatar: 'https://i.pravatar.cc/150?u=5' },
];

const MOCK_FRIENDS = [
  ...MOCK_ONLINE,
  { id: '6', name: 'Jake', status: 'Offline', statusColor: Colors.textMuted, avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: '7', name: 'Mia', status: 'Offline', statusColor: Colors.textMuted, avatar: 'https://i.pravatar.cc/150?u=7' },
];

const MOCK_ROOMS = [
  { id: '1', title: 'BGMI Rank Push', subtitle: '4 / 5', icon: 'game-controller' },
  { id: '2', title: 'Late Night Chill', subtitle: 'Chill talk & music • 8', icon: 'moon' },
  { id: '3', title: 'Football Match', subtitle: 'Man City vs Arsenal • 6', icon: 'football' },
];

const MOCK_ACTIVITY = [
  { id: '1', user: 'Rahid', action: 'posted a new post', game: '"Just hit Diamond in Valorant! Let\'s go 🔥"', time: '2m ago', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '2', user: 'Aman', action: 'posted a new post', game: '"Anyone looking for a duo in EA FC 24?"', time: '15m ago', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '3', user: 'Karan', action: 'posted a new post', game: '"Anyone up for late night chill?"', time: '1h ago', avatar: 'https://i.pravatar.cc/150?u=5' },
];

// Mock data removed (moved to respective screens where possible)

export default function DashboardScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const { profile } = useAuth();
  const { isDesktop, contentWidth, horizontalPadding, columns } = useResponsive();
  const [showSOS, setShowSOS] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  
  const displayAvatar = profile?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704z';

  const triggerSOS = () => {
    setShowSOS(true);
    // Vibrate pattern: 500ms on, 200ms off, repeat
    Vibration.vibrate([500, 200, 500, 200], true);
  };

  const cancelSOS = () => {
    setShowSOS(false);
    setShowQuickReplies(false);
    Vibration.cancel();
  };

  const handleAccept = () => {
    cancelSOS();
    navigation.navigate('SquadDetail' as any, { squadId: '1', squadName: 'Squad Alpha' });
  };

  const handleDecline = () => {
    setShowQuickReplies(true);
  };

  const handleQuickReply = (msg: string) => {
    cancelSOS();
    Alert.alert('Message Sent', `Sent "${msg}" to your squad.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, alignSelf: 'center', width: '100%' }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>HN</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications' as any)}>
              <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
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
            Your squad is <Text style={{ color: Colors.success }}>● ONLINE</Text>
          </Text>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#1A1B26', '#0F1219']}
            style={StyleSheet.absoluteFillObject}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroSubtitle}>Squad is</Text>
            <Text style={styles.heroTitle}>ONLINE</Text>
            <Text style={styles.heroDesc}>See who's around and{'\n'}HopON to play!</Text>
            <TouchableOpacity style={styles.heroButton} onPress={() => navigation.navigate('Squads')}>
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.heroButtonGradient} start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
                <Text style={styles.heroButtonText}>View Squad</Text>
                <Ionicons name="chevron-forward" size={16} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.heroAbstractShape} />
        </View>

        {/* Friends Online */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friends Online <Text style={{color: Colors.success, fontSize: 12}}>● 6 Online</Text></Text>
          <TouchableOpacity onPress={() => navigation.navigate('FriendList')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
          {MOCK_ONLINE.map((user) => (
            <TouchableOpacity 
              key={user.id} 
              style={styles.onlineUserItem}
              onPress={() => navigation.navigate('FriendProfile', { friendId: user.id, friendName: user.name, friendAvatar: user.avatar })}
            >
              <View style={[styles.avatarRing, { borderColor: user.statusColor }]}>
                <Image source={{ uri: user.avatar }} style={styles.onlineAvatar} />
                <View style={[styles.statusDot, { backgroundColor: user.statusColor }]} />
                {('icon' in user) && (
                  <View style={styles.statusIconBadge}>
                    <Ionicons name={(user as any).icon} size={10} color="#FFF" />
                  </View>
                )}
              </View>
              <Text style={styles.onlineUserName}>{user.name}</Text>
              <Text style={[styles.onlineUserStatus, { color: user.statusColor }]}>{user.status}</Text>
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

        {/* Action Buttons Row */}
        <View style={styles.actionRowContainer}>
          <View style={[styles.actionRow, isDesktop && styles.desktopActionRowItem]}>
            <TouchableOpacity style={styles.actionCard} onPress={triggerSOS}>
              <View style={styles.actionIconBox}>
                <Ionicons name="flash" size={24} color="#FFF" />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.actionTitle}>Hop On Now</Text>
                <Text style={styles.actionDesc}>Send an alert to your squad and get everyone together!</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Lists Row */}
        <View style={[styles.twoColumnRow, columns === 2 && styles.desktopTwoColumnRow]}>


          {/* Recent Activity */}
          <View style={styles.column}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate('RecentActivity' as any)}><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
            </View>
            <View style={styles.listContainer}>
              {MOCK_ACTIVITY.map(activity => (
                <View key={activity.id} style={styles.listItem}>
                  <Image source={{ uri: activity.avatar }} style={styles.activityAvatar} />
                  <View style={styles.listInfo}>
                    <Text style={styles.activityUserText}>
                      <Text style={{color: Colors.textPrimary, fontWeight: '600'}}>{activity.user}</Text> {activity.action}
                    </Text>
                    <Text style={styles.activityGameText} numberOfLines={1}>{activity.game}</Text>
                  </View>
                  <View style={styles.activityRight}>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                    {activity.showJoin && (
                      <TouchableOpacity style={styles.joinBtnPurple}>
                        <Text style={styles.joinBtnText}>Join</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

      </ScrollView>

      {/* SOS Alert Modal */}
      <Modal
        visible={showSOS}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelSOS}
      >
        <View style={styles.sosOverlay}>
          <View style={styles.sosContainer}>
            <View style={styles.sosHeader}>
              <Ionicons name="warning" size={32} color="#FFF" style={styles.sosIcon} />
              <Text style={styles.sosTitle}>SQUAD NOTIFICATION</Text>
              <Ionicons name="warning" size={32} color="#FFF" style={styles.sosIcon} />
            </View>
            
            <View style={styles.sosBody}>
              <Text style={styles.sosMessage}>
                {profile?.nickname || 'Arjun'} has requested the squad to hop on. Join the lobby now.
              </Text>
              <Text style={styles.sosTime}>{new Date().toLocaleTimeString()}</Text>
            </View>

            {!showQuickReplies ? (
              <View style={styles.sosButtonGroup}>
                <TouchableOpacity style={styles.sosDeclineBtn} onPress={handleDecline}>
                  <Text style={styles.sosDeclineText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sosAcceptBtn} onPress={handleAccept}>
                  <Text style={styles.sosAcceptText}>Accept</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.quickRepliesContainer}>
                <Text style={styles.quickReplyPrompt}>Send a quick reply:</Text>
                <View style={styles.chipsContainer}>
                  {['Busy rn', 'Give me 10 mins', 'In a match', 'Maybe later'].map((reply, index) => (
                    <TouchableOpacity key={index} style={styles.replyChip} onPress={() => handleQuickReply(reply)}>
                      <Text style={styles.replyChipText}>{reply}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.cancelReplyButton} onPress={() => setShowQuickReplies(false)}>
                  <Text style={styles.cancelReplyText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
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
  sosOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 18, 25, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  sosContainer: {
    backgroundColor: '#1A1E2E',
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  sosHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sosIcon: {
    opacity: 1,
  },
  sosTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  sosBody: {
    backgroundColor: '#151928',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: Spacing.xl,
  },
  sosMessage: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  sosTime: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: Spacing.md,
    fontWeight: '500',
  },
  sosButtonGroup: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  sosDeclineBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  sosDeclineText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: 'bold',
  },
  sosAcceptBtn: {
    flex: 1,
    backgroundColor: '#7C3AED',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  sosAcceptText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickRepliesContainer: {
    backgroundColor: '#151928',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  quickReplyPrompt: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  replyChip: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  replyChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cancelReplyButton: {
    marginTop: Spacing.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelReplyText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
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
