import React, { useState } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Text, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeedPost from '../../components/feed/FeedPost';
import { useFeed } from '../../hooks/useFeed';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';
import type { MainTabScreenProps } from '../../types';

export default function FeedScreen({ navigation }: MainTabScreenProps<'Feed'>) {
  const { posts, loading, isPosting, publishPost } = useFeed();
  const { profile } = useAuth();
  const { contentWidth, horizontalPadding } = useResponsive();
  const [postText, setPostText] = useState('');

  const handlePost = async () => {
    try {
      await publishPost(postText);
      setPostText('');
    } catch {
      Alert.alert('Error', 'Could not create post. Please try again.');
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.pageTitle}>Squad Feed</Text>
      <View style={styles.composeBox}>
        <Image source={{ uri: profile?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704z' }} style={styles.composeAvatar} />
        <TextInput
          style={styles.composeInput}
          placeholder="What's on your mind?"
          placeholderTextColor={Colors.textPlaceholder}
          value={postText}
          onChangeText={setPostText}
          multiline
          maxLength={280}
        />
        {postText.trim().length > 0 && (
          <TouchableOpacity style={styles.postButton} onPress={handlePost} disabled={isPosting}>
            {isPosting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={16} color="#FFF" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryLight} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FeedPost post={item} />}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, alignSelf: 'center', width: '100%' }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  listContent: { 
    paddingBottom: 40 
  },
  headerContainer: { 
    marginBottom: Spacing.xl 
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  composeBox: { 
    flexDirection: 'row', 
    backgroundColor: Colors.surface, 
    borderRadius: BorderRadius.xl, 
    paddingHorizontal: Spacing.md, 
    paddingVertical: Spacing.md, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: Colors.border,
  },
  composeAvatar: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: Colors.border, 
    marginRight: Spacing.md 
  },
  composeInput: { 
    flex: 1, 
    fontSize: 15, 
    color: Colors.textPrimary, 
    maxHeight: 100 
  },
  postButton: { 
    backgroundColor: Colors.primary, 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: Spacing.sm,
  },
});
