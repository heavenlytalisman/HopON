import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, Image, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeedPost from '../../components/feed/FeedPost';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import type { RootStackScreenProps, FeedPostData } from '../../types';

const { width } = Dimensions.get('window');

const DEFAULT_MOCK_POST: FeedPostData = {
  id: 'pd1',
  author: {
    name: 'Rahid',
    handle: '@rahid',
    avatar: 'https://i.pravatar.cc/150?u=2',
  },
  timestamp: '11:46 AM • Oct 11, 2022',
  content: 'Anyone down to run some duos? Need a solid teammate for the weekend grind!',
  likes: 24600,
  comments: 137,
  reposts: 6550,
};

const MOCK_COMMENTS_THREAD: FeedPostData = {
  id: 'c0',
  author: {
    name: 'Rahid',
    handle: '@rahid',
    avatar: 'https://i.pravatar.cc/150?u=2',
  },
  timestamp: '1m',
  content: 'Just hopped on! Join my squad.',
  likes: 2,
  comments: 0,
  reposts: 0,
  thread: [
    {
      id: 'c1',
      author: {
        name: 'Rahid',
        handle: '@rahid',
        avatar: 'https://i.pravatar.cc/150?u=2',
      },
      timestamp: 'Just now',
      content: 'Room is almost full, grab the last spot!',
      likes: 1,
      comments: 0,
      reposts: 0,
    }
  ]
};

export default function PostDetailScreen({ route, navigation }: RootStackScreenProps<'PostDetail'>) {
  const { mockData } = route.params;
  const { profile } = useAuth();

  // Initialize main post and inject mock comments into its replies array if missing
  const [mainPost, setMainPost] = useState<FeedPostData>(() => {
    const post = mockData || DEFAULT_MOCK_POST;
    if (!post.replies) {
      post.replies = [MOCK_COMMENTS_THREAD];
    }
    return post;
  });
  const [replyText, setReplyText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    
    const userHandle = profile?.handle ? profile.handle : '@user';
    const newReply: FeedPostData = {
      id: `new_${Date.now()}`,
      author: {
        name: profile?.nickname || 'You',
        handle: userHandle,
        avatar: profile?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704z'
      },
      content: replyText.trim(),
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      reposts: 0,
    };

    setMainPost(prev => {
      // Follow parent-child thread logic
      if (userHandle === prev.author.handle) {
        // Flat author continuation (Thread)
        return {
          ...prev,
          thread: [newReply, ...(prev.thread || [])]
        };
      } else {
        // Nested child comment (Replies)
        return {
          ...prev,
          replies: [newReply, ...(prev.replies || [])]
        };
      }
    });

    setReplyText('');
    Keyboard.dismiss();
  };

  const handleCommentPress = () => {
    inputRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Main Post (Detail Variant) */}
          <FeedPost post={mainPost} variant="detail" onCommentPress={handleCommentPress} />

          {/* Inline Reply Input (X Style) */}
          <View style={styles.inlineReplyContainer}>
            <Image source={{ uri: profile?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704z' }} style={styles.replyAvatar} />
            <TextInput 
              ref={inputRef}
              style={styles.replyInputBox}
              placeholder="Post your reply!"
              placeholderTextColor={Colors.textMuted}
              value={replyText}
              onChangeText={setReplyText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.replyButtonSmall, !replyText.trim() && { opacity: 0.5 }]} 
              onPress={handleSubmitReply}
              disabled={!replyText.trim()}
            >
              <Text style={styles.replyButtonTextSmall}>Reply</Text>
            </TouchableOpacity>
          </View>

          {/* Thread (Author Continuations) */}
          {mainPost.thread && mainPost.thread.length > 0 && (
            <View style={styles.threadSection}>
               {mainPost.thread.map(child => (
                 <FeedPost key={child.id} post={child} variant="feed" />
               ))}
            </View>
          )}

          {/* Replies (Nested Child Comments) */}
          {mainPost.replies && mainPost.replies.length > 0 && (
            <View style={styles.repliesSection}>
               {mainPost.replies.map(reply => (
                 <FeedPost key={reply.id} post={reply} variant="feed" />
               ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  inlineReplyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  replyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: Spacing.md,
  },
  replyInputBox: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  replyButtonSmall: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    marginLeft: Spacing.md,
  },
  replyButtonTextSmall: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  threadSection: {
    paddingTop: Spacing.sm,
  },
  repliesSection: {
    paddingTop: Spacing.sm,
  }
});
