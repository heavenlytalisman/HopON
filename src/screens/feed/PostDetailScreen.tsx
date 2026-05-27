import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeedPost from '../../components/feed/FeedPost';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { RootStackScreenProps, FeedPostData } from '../../types';

const { width } = Dimensions.get('window');

const DEFAULT_MOCK_POST: FeedPostData = {
  id: 'pd1',
  author: {
    name: 'Rahid',
    handle: '@rahid',
    avatar: 'https://i.pravatar.cc/150?u=2',
  },
  timestamp: 'Just now',
  content: 'Anyone down to run some duos? Need a solid teammate for the weekend grind!',
  likes: 12,
  comments: 3,
  reposts: 0,
};

const MOCK_COMMENTS: FeedPostData[] = [
  {
    id: 'c1',
    author: {
      name: 'Viper',
      handle: '@viper_main',
      avatar: 'https://i.pravatar.cc/150?u=v',
    },
    timestamp: '5m',
    content: 'I\'m down! Hop in my room when you\'re ready.',
    likes: 2,
    comments: 0,
    reposts: 0,
  },
  {
    id: 'c2',
    author: {
      name: 'Aman',
      handle: '@aman007',
      avatar: 'https://i.pravatar.cc/150?u=3',
    },
    timestamp: '12m',
    content: 'Bruh I would but I\'m stuck at work rn 😭',
    likes: 5,
    comments: 0,
    reposts: 0,
  }
];

export default function PostDetailScreen({ route, navigation }: RootStackScreenProps<'PostDetail'>) {
  const { mockData } = route.params;

  // Use the passed mockData if available, otherwise fallback to default
  const post: FeedPostData = mockData || DEFAULT_MOCK_POST;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Post */}
        <View style={styles.mainPostContainer}>
          <FeedPost post={post} />
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>Replies</Text>
          {MOCK_COMMENTS.map(comment => (
            <FeedPost key={comment.id} post={comment} />
          ))}
        </View>
      </ScrollView>

      {/* Floating Reply Input placeholder */}
      <View style={styles.replyInputContainer}>
        <View style={styles.replyInput}>
          <Text style={styles.replyPlaceholder}>Post your reply...</Text>
        </View>
        <TouchableOpacity style={styles.replyButton}>
          <Text style={styles.replyButtonText}>Reply</Text>
        </TouchableOpacity>
      </View>
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
  mainPostContainer: {
    borderBottomWidth: 4,
    borderBottomColor: Colors.border, // Makes it visually separated from comments
  },
  commentsSection: {
    paddingTop: Spacing.sm,
  },
  commentsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  replyInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  replyPlaceholder: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  replyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.pill,
  },
  replyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
