import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';

import { EmptyState } from '../../components/ui/EmptyState';
import { useFriends } from '../../hooks/useFriends';

export default function FollowListScreen({ route, navigation }: RootStackScreenProps<'FollowList'>) {
  const { type, userName } = route.params;
  const isFollowers = type === 'followers';
  const { friends } = useFriends();
  const listData: any[] = userName ? [] : friends;

  const headerTitle = userName ? `${userName}'s ${isFollowers ? 'Followers' : 'Following'}` : (isFollowers ? 'Followers' : 'Following');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg }}>
        {listData.length === 0 ? (
          <View style={{ marginTop: 60 }}>
            <EmptyState 
              iconName="people-outline" 
              title={`No ${isFollowers ? 'followers' : 'following'} yet`} 
              subtitle={userName ? `When ${userName} connects with others, they'll appear here.` : "No connections found."} 
            />
          </View>
        ) : (
          listData.map((user) => (
            <TouchableOpacity 
              key={user.id} 
              style={styles.listItem}
            onPress={() => navigation.navigate('FriendProfile', { 
              friendId: user.id, 
              friendName: user.name, 
              friendAvatar: user.avatar 
            })}
          >
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userHandle}>{user.handle}</Text>
            </View>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>{isFollowers ? 'Remove' : 'Following'}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userHandle: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  actionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  actionButtonText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});
