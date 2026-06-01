import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { EmptyState } from '../../components/ui/EmptyState';
import { useNotifications } from '../../hooks/useNotifications';
import { acceptFriendRequest, deleteNotification } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import type { RootStackScreenProps } from '../../types';import { Image } from 'expo-image';


export default function NotificationsScreen({ navigation }: RootStackScreenProps<'Notifications'>) {
  const [activeTab, setActiveTab] = useState<'activity' | 'follows'>('follows');
  const { notifications, loading } = useNotifications();
  const { firebaseUser } = useAuth();

  const activityNotifs = notifications.filter(n => n.type !== 'friend_request');
  const followNotifs = notifications.filter(n => n.type === 'friend_request');

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
        {loading ? (
          <View style={{ marginTop: 80, alignItems: 'center' }}>
            <Text style={{ color: Colors.textMuted }}>Loading...</Text>
          </View>
        ) : activeTab === 'follows' ? (
          followNotifs.length === 0 ? (
            <View style={{ marginTop: 80 }}>
              <EmptyState 
                iconName="person-add-outline" 
                title="No follows yet" 
                subtitle="You have no pending friend requests." 
              />
            </View>
          ) : (
            followNotifs.map(follow => (
              <View key={follow.id} style={styles.notificationItem}>
                <Image source={{ uri: follow.data?.avatar  }} style={styles.notificationAvatar} />
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationUser}>{follow.title} <Text style={styles.notificationAction}>{follow.body}</Text></Text>
                </View>
                <TouchableOpacity 
                  style={styles.followBtn}
                  onPress={async () => {
                    if (firebaseUser && follow.data?.requestId && follow.data?.senderId) {
                      const success = await acceptFriendRequest(follow.data.requestId, firebaseUser.uid, follow.data.senderId);
                      if (success) {
                        await deleteNotification(follow.id);
                        alert('Friend request accepted!');
                      }
                    }
                  }}
                >
                  <Text style={styles.followBtnText}>
                    Accept
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )
        ) : (
          activityNotifs.length === 0 ? (
            <View style={{ marginTop: 80 }}>
              <EmptyState 
                iconName="notifications-outline" 
                title="No activity yet" 
                subtitle="You have no new notifications." 
              />
            </View>
          ) : (
            activityNotifs.map(notif => (
              <TouchableOpacity 
                key={notif.id} 
                style={[styles.notificationItem, !notif.read && styles.notificationItemUnread]}
                onPress={() => {}}
              >
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationText}>
                    <Text style={{fontWeight: 'bold', color: Colors.textPrimary}}>{notif.title}</Text>
                  </Text>
                  {notif.body && (
                    <Text style={styles.notificationDetail}>"{notif.body}"</Text>
                  )}
                </View>
                {!notif.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))
          )
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
