import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';

const MOCK_FOLLOWERS = [
  { id: '1', name: 'Vasif', handle: '@vasif', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Rahid', handle: '@rahid', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Aman', handle: '@aman', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Prem', handle: '@prem', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'Karan', handle: '@karan', avatar: 'https://i.pravatar.cc/150?u=5' },
];

const MOCK_FOLLOWING = [
  { id: '1', name: 'Vasif', handle: '@vasif', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '6', name: 'Jake', handle: '@jake', avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: '7', name: 'Mia', handle: '@mia', avatar: 'https://i.pravatar.cc/150?u=7' },
];

export default function FollowListScreen({ route, navigation }: RootStackScreenProps<'FollowList'>) {
  const { type, userName } = route.params;
  const isFollowers = type === 'followers';
  const listData = isFollowers ? MOCK_FOLLOWERS : MOCK_FOLLOWING;

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
        {listData.map((user) => (
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
        ))}
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
