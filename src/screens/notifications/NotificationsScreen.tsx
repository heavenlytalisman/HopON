import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';

const MOCK_ACTIVITY = [
  { id: 'n1', type: 'mention', user: 'Viper', target: 'valorant-comp', action: 'mentioned you in', time: '5m ago', avatar: 'https://i.pravatar.cc/150?u=v', read: false },
  { id: 'n2', type: 'like', user: 'Rahid', target: 'your feed post', action: 'liked', time: '1h ago', avatar: 'https://i.pravatar.cc/150?u=2', read: false },
  { id: 'n3', type: 'comment', user: 'Aman', target: 'your feed post', action: 'commented on', detail: '"Bro you carried us hard!"', time: '2h ago', avatar: 'https://i.pravatar.cc/150?u=3', read: true },
];

const MOCK_FOLLOWS = [
  { id: 'f1', user: 'Alex Gaming', handle: '@alex_g', action: 'started following you', time: '10m ago', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', isFollowingBack: false },
  { id: 'f2', user: 'Sarah K.', handle: '@sarah_weeb', action: 'started following you', time: '1d ago', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', isFollowingBack: true },
];

export default function NotificationsScreen({ navigation }: RootStackScreenProps<'Notifications'>) {
  const [activeTab, setActiveTab] = useState<'activity' | 'follows'>('follows');
  const [followsData, setFollowsData] = useState(MOCK_FOLLOWS);

  const toggleFollowBack = (id: string) => {
    setFollowsData(prev => prev.map(f => 
      f.id === id ? { ...f, isFollowingBack: !f.isFollowingBack } : f
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'follows' && styles.activeTab]} 
          onPress={() => setActiveTab('follows')}
        >
          <Text style={[styles.tabText, activeTab === 'follows' && styles.activeTabText]}>Follows</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]} 
          onPress={() => setActiveTab('activity')}
        >
          <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>Activity</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'follows' ? (
          followsData.map(follow => (
            <View key={follow.id} style={styles.notificationItem}>
              <Image source={{ uri: follow.avatar }} style={styles.notificationAvatar} />
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationUser}>{follow.user} <Text style={styles.notificationAction}>{follow.action}</Text></Text>
                <Text style={styles.notificationTime}>{follow.time}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.followBtn, follow.isFollowingBack && styles.followingBtn]}
                onPress={() => toggleFollowBack(follow.id)}
              >
                <Text style={[styles.followBtnText, follow.isFollowingBack && styles.followingBtnText]}>
                  {follow.isFollowingBack ? 'Following' : 'Follow Back'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          MOCK_ACTIVITY.map(notif => (
            <View key={notif.id} style={[styles.notificationItem, !notif.read && styles.notificationItemUnread]}>
              <Image source={{ uri: notif.avatar }} style={styles.notificationAvatar} />
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationText}>
                  <Text style={{fontWeight: 'bold', color: Colors.textPrimary}}>{notif.user}</Text> {notif.action} <Text style={{fontWeight: 'bold', color: Colors.textPrimary}}>{notif.target}</Text>
                </Text>
                {notif.detail && (
                  <Text style={styles.notificationDetail}>"{notif.detail}"</Text>
                )}
                <Text style={styles.notificationTime}>{notif.time}</Text>
              </View>
              {!notif.read && <View style={styles.unreadDot} />}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    alignItems: 'center',
  },
  notificationItemUnread: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  notificationAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: Spacing.md,
  },
  notificationInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  notificationUser: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  notificationAction: {
    fontWeight: 'normal',
    color: Colors.textMuted,
  },
  notificationText: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  notificationDetail: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
  },
  notificationTime: {
    color: Colors.primaryLight,
    fontSize: 11,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },
  followBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
  },
  followingBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  followBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  followingBtnText: {
    color: Colors.textPrimary,
  }
});
