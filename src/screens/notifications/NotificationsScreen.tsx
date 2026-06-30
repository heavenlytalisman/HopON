import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView , RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { EmptyState } from '../../components/ui/EmptyState';
import { useNotifications } from '../../hooks/useNotifications';
import { acceptFriendRequest, deleteNotification, createNotification, joinGroup } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import type { RootStackScreenProps } from '../../types';
import { Image } from 'expo-image';


export default function NotificationsScreen({ navigation }: RootStackScreenProps<'Notifications'>) {

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const [activeTab, setActiveTab] = useState<'activity' | 'requests'>('requests');
  const { notifications, loading } = useNotifications();
  const { firebaseUser, profile } = useAuth();
  const { showToast } = useUI();

  const activityNotifs = notifications.filter(n => n.type !== 'friend_request' && n.type !== 'follow' && n.type !== 'squad_invite');
  const requestNotifs = notifications.filter(n => n.type === 'friend_request' || n.type === 'follow' || n.type === 'squad_invite');

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
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]} 
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>Requests</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]} 
          onPress={() => setActiveTab('activity')}
        >
          <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>Activity</Text>
        </TouchableOpacity>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} colors={[Colors.primaryLight]} />} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={{ marginTop: 80, alignItems: 'center' }}>
            <Text style={{ color: Colors.textMuted }}>Loading...</Text>
          </View>
        ) : activeTab === 'requests' ? (
          requestNotifs.length === 0 ? (
            <View style={{ marginTop: 80 }}>
              <EmptyState 
                iconName="person-add-outline" 
                title="No requests yet" 
                subtitle="You have no pending requests." 
              />
            </View>
          ) : (
            requestNotifs.map(follow => (
              <View key={follow.id} style={styles.notificationItem}>
                <Image source={{ uri: follow.data?.avatar  }} style={styles.notificationAvatar} />
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationUser}>{follow.title} <Text style={styles.notificationAction}>{follow.body}</Text></Text>
                </View>
                {follow.type === 'friend_request' && (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity 
                      style={styles.followBtn}
                      onPress={async () => {
                        if (firebaseUser && follow.data?.requestId && follow.data?.senderId) {
                          const success = await acceptFriendRequest(follow.data.requestId, firebaseUser.uid, follow.data.senderId);
                          if (success) {
                            await deleteNotification(follow.id);
                            if (profile) {
                              await createNotification(follow.data.senderId, {
                                type: 'friend_request_accepted',
                                title: profile.nickname || 'Someone',
                                body: 'accepted your friend request',
                                data: {
                                  userId: firebaseUser.uid,
                                  avatar: profile.avatar,
                                },
                                senderId: firebaseUser.uid
                              });
                            }
                          }
                        }
                      }}
                    >
                      <Text style={styles.followBtnText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.followBtn, { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderLight }]}
                      onPress={async () => {
                        await deleteNotification(follow.id);
                      }}
                    >
                      <Text style={[styles.followBtnText, { color: Colors.textPrimary }]}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {follow.type === 'squad_invite' && (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity 
                      style={styles.followBtn}
                      onPress={async () => {
                        if (firebaseUser && follow.data?.squadId) {
                          try {
                            await joinGroup(follow.data.squadId, firebaseUser.uid);
                            await deleteNotification(follow.id);
                            showToast({ title: 'Success', message: `You joined ${follow.data.squadName || 'the squad'}!`, type: 'success' });
                            
                            if (profile && follow.data?.senderId) {
                              await createNotification(follow.data.senderId, {
                                type: 'squad_invite_accepted',
                                title: profile.nickname || 'Someone',
                                body: `joined ${follow.data.squadName || 'your squad'}`,
                                data: {
                                  squadId: follow.data.squadId,
                                  squadName: follow.data.squadName || '',
                                  userId: firebaseUser.uid,
                                  avatar: profile.avatar || ''
                                },
                                senderId: firebaseUser.uid
                              });
                            }
                          } catch (error) {
                            showToast({ title: 'Error', message: 'Failed to join squad.', type: 'error' });
                          }
                        }
                      }}
                    >
                      <Text style={styles.followBtnText}>Join</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.followBtn, { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderLight }]}
                      onPress={async () => {
                        await deleteNotification(follow.id);
                      }}
                    >
                      <Text style={[styles.followBtnText, { color: Colors.textPrimary }]}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
