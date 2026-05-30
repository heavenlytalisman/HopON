import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../constants/theme';
import { EmptyState } from '../../components/ui/EmptyState';
import { useFriends } from '../../hooks/useFriends';
import type { RootStackScreenProps } from '../../types';

export default function FriendListScreen({ navigation }: RootStackScreenProps<'FriendList'>) {
  const { friends, loadingFriends } = useFriends();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg }}>
        {friends.length === 0 && !loadingFriends ? (
          <EmptyState 
            iconName="people-outline" 
            title="No friends found" 
            subtitle="Add friends to grow your network!" 
            actionTitle="Find Friends"
            onAction={() => navigation.navigate('SearchUsers')}
          />
        ) : (
          friends.map((user) => (
            <TouchableOpacity 
              key={user.uid} 
              style={styles.friendListItem}
              onPress={() => navigation.navigate('FriendProfile', { 
                friendId: user.uid, 
                friendName: user.nickname, 
                friendAvatar: user.avatar || '' 
              })}
            >
              <View style={[styles.avatarRing, { borderColor: Colors.success }]}>
                <Image source={{ uri: user.avatar || 'https://i.pravatar.cc/150?u=' + user.uid }} style={styles.avatarImage} />
                <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
              </View>
              <View style={styles.friendListInfo}>
                <Text style={styles.friendListName}>{user.nickname}</Text>
                <Text style={[styles.friendListStatus, { color: Colors.success }]}>Online</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
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
  friendListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  avatarRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    marginRight: Spacing.md,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  friendListInfo: {
    flex: 1,
  },
  friendListName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  friendListStatus: {
    fontSize: 14,
  },
});
