import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';

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

export default function FriendListScreen({ navigation }: RootStackScreenProps<'FriendList'>) {
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
        {MOCK_FRIENDS.map((friend) => (
          <TouchableOpacity 
            key={friend.id} 
            style={styles.friendListItem}
            onPress={() => navigation.navigate('FriendProfile', { 
              friendId: friend.id, 
              friendName: friend.name, 
              friendAvatar: friend.avatar 
            })}
          >
            <View style={[styles.avatarRing, { borderColor: friend.statusColor }]}>
              <Image source={{ uri: friend.avatar }} style={styles.avatarImage} />
              <View style={[styles.statusDot, { backgroundColor: friend.statusColor }]} />
            </View>
            <View style={styles.friendListInfo}>
              <Text style={styles.friendListName}>{friend.name}</Text>
              <Text style={[styles.friendListStatus, { color: friend.statusColor }]}>{friend.status}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
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
