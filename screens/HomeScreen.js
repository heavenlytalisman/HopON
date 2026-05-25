import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Text, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeedPost from '../components/FeedPost';
import { createPost, subscribeToFeed } from '../services/FirebaseService';
import { auth } from '../firebaseConfig';
import { serverTimestamp } from 'firebase/firestore';



export default function HomeScreen({ route, navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // We can pass nickname via route params from Login, or fetch from Firestore. 
  // For now, we will grab it from route if available, else fallback to 'Anonymous'
  const nickname = route?.params?.nickname || 'Anonymous';

  useEffect(() => {
    const unsubscribe = subscribeToFeed((livePosts) => {
      // Format timestamps for display before setting state
      const formattedPosts = livePosts.map(post => {
        let timeString = 'Just now';
        if (post.timestamp) {
           // Basic formatting: show minutes or hours ago
           const diffSeconds = Math.floor((new Date() - post.timestamp.toDate()) / 1000);
           if (diffSeconds < 60) timeString = 'Just now';
           else if (diffSeconds < 3600) timeString = `${Math.floor(diffSeconds / 60)}m`;
           else timeString = `${Math.floor(diffSeconds / 3600)}h`;
        }

        return {
          id: post.id,
          author: {
            name: post.authorName,
            handle: post.authorHandle,
            avatar: post.authorAvatar,
          },
          content: post.content,
          timestamp: timeString,
          likes: post.likes || 0,
          comments: post.comments || 0,
          reposts: post.reposts || 0,
          mediaType: post.mediaType,
          mediaData: post.mediaData,
        };
      });
      
      setPosts(formattedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!postText.trim()) return;
    
    setIsPosting(true);
    try {
      await createPost({
        authorId: auth.currentUser?.uid || 'unknown',
        authorName: nickname,
        authorHandle: `@${nickname.toLowerCase().replace(/\s+/g, '')}`,
        authorAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704z', // Current user's avatar
        content: postText.trim(),
        timestamp: serverTimestamp(),
      });
      setPostText('');
    } catch (error) {
      Alert.alert("Error", "Could not create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Removed redundant topBar as per user request */}
      

      
      <View style={styles.composeBox}>
        <Image source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704z' }} style={styles.composeAvatar} />
        <TextInput 
          style={styles.composeInput}
          placeholder="What's on your mind?"
          placeholderTextColor="#94A3B8"
          value={postText}
          onChangeText={setPostText}
          multiline
          maxLength={280}
        />
        {postText.trim().length > 0 && (
          <TouchableOpacity 
            style={styles.postButton} 
            onPress={handlePost}
            disabled={isPosting}
          >
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
          <ActivityIndicator size="large" color="#2C5282" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FeedPost post={item} />}
          contentContainerStyle={styles.listContent}
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
    backgroundColor: '#F4F7FC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  myAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C5282',
  },
  composeBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EBF8FF',
  },
  composeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  composeInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    maxHeight: 100, // Limit height if multiline gets too big
  },
  postButton: {
    backgroundColor: '#2C5282',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#2C5282',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

});
