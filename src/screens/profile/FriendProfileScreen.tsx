import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FeedPost from '../../components/feed/FeedPost';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { RootStackScreenProps, FeedPostData } from '../../types';
import { Image } from 'expo-image';
import { EmptyState } from '../../components/ui/EmptyState';
import { useFeed } from '../../hooks/useFeed';
import { useFriends } from '../../hooks/useFriends';
import { useFollows } from '../../hooks/useFollows';
import { getUserProfile, subscribeToUserProfile } from '../../services/firebase';
import type { User } from '../../types';

const { width } = Dimensions.get('window');

export default function FriendProfileScreen({ route, navigation }: RootStackScreenProps<'FriendProfile'>) {
  const { friendId, friendName, friendAvatar } = route.params;

  const [friendProfile, setFriendProfile] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { friends, sendRequest, refreshFriends } = useFriends();
  const { follow, unfollow, isFollowingUser } = useFollows();
  const { posts, loading: feedLoading } = useFeed();

  const loadFriendData = React.useCallback(async () => {
    const following = await isFollowingUser(friendId);
    setIsFollowing(following);
  }, [friendId, isFollowingUser]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (refreshFriends) await refreshFriends();
    await loadFriendData();
    setRefreshing(false);
  }, [refreshFriends, loadFriendData]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    loadFriendData();
    const unsubscribe = subscribeToUserProfile(friendId, (data) => {
      if (data) setFriendProfile(data);
    });
    return () => unsubscribe();
  }, [loadFriendData, friendId]);

  const friendHandle = friendProfile?.handle || '@' + (friendName || 'user').toLowerCase().replace(/\s+/g, '');
  const bannerUri = friendProfile?.banner || null;
  const bio = friendProfile?.bio || null;

  const friendPosts = posts.filter(p => {
    const actorId = p.repostedBy ? p.repostedBy.uid : p.author.id;
    return actorId === friendId;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{friendName}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} colors={[Colors.primaryLight]} />} showsVerticalScrollIndicator={false}>
        <View style={[styles.bannerContainer, !bannerUri && { backgroundColor: Colors.surfaceAlt } ]}>
          {bannerUri ? <Image source={{ uri: bannerUri }} style={styles.bannerImage} /> : null}
          <LinearGradient colors={['transparent', Colors.background]} style={styles.bannerGradient} />
        </View>
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatarRow}>
            <Image source={{ uri: friendAvatar }} style={styles.avatar} />
            <TouchableOpacity style={[styles.actionButton, isFollowing ? styles.actionButtonFollowing : null]} onPress={async () => {
                if (!isFollowing) {
                  const success = await follow(friendId);
                  if (success) {
                    setIsFollowing(true);
                    setFriendProfile(prev => prev ? { ...prev, followers: [...(prev.followers || []), 'me'] } : prev);
                  }
                } else {
                  const success = await unfollow(friendId);
                  if (success) {
                    setIsFollowing(false);
                    setFriendProfile(prev => prev ? { ...prev, followers: (prev.followers || []).filter(id => id !== 'me') } : prev);
                  }
                }
              }}>
              {!isFollowing ? <Ionicons name="person-add" size={16} color="#FFF" style={{ marginRight: 6 }} /> : null}
              <Text style={[styles.actionButtonText, isFollowing ? styles.actionButtonTextFollowing : null]}>{isFollowing ? 'Following' : 'Follow'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{friendName}</Text>
          <Text style={styles.handle}>{friendHandle}</Text>
          {bio ? <Text style={styles.bio}>{bio}</Text> : null}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('FollowList', { type: 'following', userName: friendName, userId: friendId })}>
              <Text style={styles.statValue}>{friendProfile?.following?.length || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('FollowList', { type: 'followers', userName: friendName, userId: friendId })}>
              <Text style={styles.statValue}>{friendProfile?.followers?.length || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.postsSection}>
          <Text style={styles.postsSectionTitle}>Recent Posts</Text>
          {friendPosts.length === 0 && !feedLoading ? (
            <EmptyState iconName="game-controller-outline" title="Nothing to see here" subtitle={`${friendName} hasn't posted anything recently.`} />
          ) : (
            friendPosts.map(post => (
              <FeedPost key={post.id} post={post} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.background, zIndex: 10 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  bannerContainer: { width: '100%', height: 150, position: 'relative' },
  bannerImage: { width: '100%', height: '100%' },
  bannerGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  profileInfoContainer: { paddingHorizontal: Spacing.lg, marginTop: -40, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: Spacing.lg },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing.md },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: Colors.background, backgroundColor: Colors.surface },
  actionButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.pill, marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minWidth: 120 },
  actionButtonFollowing: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.borderLight },
  actionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  actionButtonTextFollowing: { color: Colors.textPrimary },
  name: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary },
  handle: { fontSize: 14, color: Colors.textMuted, marginBottom: Spacing.md },
  bio: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.xl },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  statLabel: { fontSize: 14, color: Colors.textMuted },
  postsSection: { paddingTop: Spacing.lg },
  postsSectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md }
});
