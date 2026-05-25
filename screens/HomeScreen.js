import React from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Text, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeedPost from '../components/FeedPost';

const DUMMY_POSTS = [
  {
    id: '1',
    author: {
      name: 'Alex Mercer',
      handle: '@alexm_gaming',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    },
    timestamp: '2h',
    content: 'This new OST is absolutely carrying my ranked climb tonight. 🔥',
    mediaType: 'song',
    mediaData: {
      title: 'Cybernetic Awakening',
      artist: 'Synthwave Collective',
      albumArt: 'https://i.scdn.co/image/ab67616d0000b273b5df5b5e3240e4f8d227b2b8', // Reusing placeholder
    },
    likes: 142,
    comments: 24,
    reposts: 5,
  },
  {
    id: '2',
    author: {
      name: 'Sarah K.',
      handle: '@sarah_weeb',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
    },
    timestamp: '4h',
    content: 'Just finished the season finale. The animation in this fight scene was INSANE! ✨⚔️',
    mediaType: 'meme',
    mediaData: {
      url: 'https://images.unsplash.com/photo-1542451313056-b7c8e626645f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Cool aesthetic placeholder
    },
    likes: 1200,
    comments: 89,
    reposts: 12,
  }
];

export default function HomeScreen() {
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <Image source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704z' }} style={styles.myAvatar} />
        <Text style={styles.headerTitle}>SquadUp</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.composeBox}>
        <Image source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704z' }} style={styles.composeAvatar} />
        <TextInput 
          style={styles.composeInput}
          placeholder="What's on your mind?"
          placeholderTextColor="#94A3B8"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={DUMMY_POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedPost post={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC', // Very light blue/gray background
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
  },
});
