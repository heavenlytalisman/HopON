import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FeedPost from '../../components/feed/FeedPost';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { RootStackScreenProps, FeedPostData } from '../../types';

const { width } = Dimensions.get('window');

const MOCK_FRIEND_POSTS: FeedPostData[] = [
  {
    id: 'f1',
    author: {
      name: '', // Will be injected from route params
      handle: '', // Will be injected
      avatar: '', // Will be injected
    },
    timestamp: '2h',
    content: 'Just had the craziest clutch in Valorant! 1v4 defuse while blind. Still shaking! 🎯🔥',
    likes: 42,
    comments: 8,
    reposts: 2,
  },
  {
    id: 'f2',
    author: {
      name: '',
      handle: '',
      avatar: '',
    },
    timestamp: '1d',
    content: 'Anyone down to run some duos later tonight? Need a solid teammate to grind to Diamond.',
    likes: 15,
    comments: 5,
    reposts: 0,
    mediaType: 'song',
    mediaData: {
      title: 'STARGAZING',
      artist: 'Travis Scott',
      albumArt: 'https://i.scdn.co/image/ab67616d0000b273072e9faef2ef7b6db63834a3',
    }
  },
];

export default function FriendProfileScreen({ route, navigation }: RootStackScreenProps<'FriendProfile'>) {
  const { friendId, friendName, friendAvatar } = route.params;
  const [isFollowing, setIsFollowing] = useState(false);

  // Derive handle from name if not provided
  const friendHandle = `@${friendName.toLowerCase().replace(/\\s+/g, '')}`;

  // Mock banner image (gaming related)
  const bannerUri = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  
  // Mock bio
  const bio = 'FPS Enthusiast | Hardstuck Ascendant | Coffee addict ☕ | Always down to hop on!';

  // Inject author data into mock posts
  const posts = MOCK_FRIEND_POSTS.map(p => ({
    ...p,
    author: {
      name: friendName,
      handle: friendHandle,
      avatar: friendAvatar,
    }
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{friendName}</Text>
        <View style={{ width: 40 }} /> {/* Placeholder for balance */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: bannerUri }} style={styles.bannerImage} />
          <LinearGradient
            colors={['transparent', Colors.background]}
            style={styles.bannerGradient}
          />
        </View>

        {/* Profile Info Section */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatarRow}>
            <Image source={{ uri: friendAvatar }} style={styles.avatar} />
            <TouchableOpacity 
              style={[styles.actionButton, isFollowing && styles.actionButtonFollowing]} 
              onPress={() => setIsFollowing(!isFollowing)}
            >
              {!isFollowing && <Ionicons name="person-add" size={16} color="#FFF" style={{ marginRight: 6 }} />}
              <Text style={[styles.actionButtonText, isFollowing && styles.actionButtonTextFollowing]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.name}>{friendName}</Text>
          <Text style={styles.handle}>{friendHandle}</Text>
          
          <Text style={styles.bio}>{bio}</Text>
          
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('FollowList', { type: 'following', userName: friendName })}>
              <Text style={styles.statValue}>142</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('FollowList', { type: 'followers', userName: friendName })}>
              <Text style={styles.statValue}>89</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feed Posts Section */}
        <View style={styles.postsSection}>
          <Text style={styles.postsSectionTitle}>Recent Posts</Text>
          {posts.map(post => (
            <FeedPost key={post.id} post={post} />
          ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    zIndex: 10,
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
  bannerContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  profileInfoContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: -40,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.background,
    backgroundColor: Colors.surface,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.pill,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  actionButtonFollowing: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButtonTextFollowing: {
    color: Colors.textPrimary,
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  handle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  bio: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  postsSection: {
    paddingTop: Spacing.lg,
  },
  postsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
});
