import React from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeedPost from '../components/FeedPost';

const DUMMY_POSTS = [
  {
    id: '1',
    author: {
      name: 'RivenMain',
      handle: '@toxicblade',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    },
    timestamp: '15m',
    content: 'Just finished the new season of Demon Slayer. The animation is literally out of this world. Ufotable never misses! 🗡️🔥',
    mediaType: 'anime',
    mediaData: {
      title: 'Demon Slayer: Kimetsu no Yaiba',
      cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93DQl.jpg',
      rating: '4.8',
    },
    likes: 124,
    comments: 12,
    reposts: 5,
  },
  {
    id: '2',
    author: {
      name: 'JettDash',
      handle: '@instalock',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
    },
    timestamp: '2h',
    content: 'Current vibes while grinding ranked. Don\'t disturb. 🎧',
    mediaType: 'song',
    mediaData: {
      title: 'STAR WALKIN\'',
      artist: 'Lil Nas X',
      albumArt: 'https://i.scdn.co/image/ab67616d0000b273b5df5b5e3240e4f8d227b2b8',
    },
    likes: 89,
    comments: 4,
    reposts: 2,
  },
  {
    id: '3',
    author: {
      name: 'SleepyGamer',
      handle: '@needcoffee',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
    },
    timestamp: '4h',
    content: 'Me pretending I didn\'t just whiff my entire spray on a stationary target:',
    mediaType: 'meme',
    mediaData: {
      url: 'https://i.imgflip.com/1g8my4.jpg',
    },
    likes: 342,
    comments: 45,
    reposts: 88,
  },
  {
    id: '4',
    author: {
      name: 'Cinephile99',
      handle: '@moviesnob',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704g',
    },
    timestamp: '1d',
    content: 'Rewatched this masterpiece for the 10th time. Nolan is a genius.',
    mediaType: 'movie',
    mediaData: {
      title: 'Interstellar',
      poster: 'https://a.ltrbxd.com/resized/film-poster/1/1/7/6/2/1/117621-interstellar-0-500-0-750-crop.jpg',
      rating: '5.0',
    },
    likes: 210,
    comments: 18,
    reposts: 12,
  }
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={DUMMY_POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedPost post={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#313338', // Discord Primary
  },
  listContent: {
    paddingBottom: 100, // Space for the FAB and Bottom Tabs
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5865F2', // Discord Blurple
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
