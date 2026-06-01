import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FeedPost from '../../components/feed/FeedPost';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useFeed } from '../../hooks/useFeed';
import type { RootStackScreenProps, FeedPostData } from '../../types';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

export default function PostDetailScreen({ route, navigation }: RootStackScreenProps<'PostDetail'>) {
  const { postData, postId } = route.params;
  const { profile } = useAuth();
  const { replyToPost, posts } = useFeed();

  // Initialize main post
  const [mainPost, setMainPost] = useState<FeedPostData | undefined>(() => {
    return postData || posts.find(p => p.id === postId);
  });
  const [replyText, setReplyText] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (postId) {
      const updated = posts.find(p => p.id === postId);
      if (updated) {
        setMainPost(updated);
      }
    }
  }, [posts, postId]);

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !postId) return;
    
    await replyToPost(postId, replyText.trim());
    
    setReplyText('');
    Keyboard.dismiss();
  };

  const handleCommentPress = () => {
    inputRef.current?.focus();
  };

  if (!mainPost) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
            <Image source={{ uri: profile?.avatar  }} style={styles.replyAvatar} />
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
