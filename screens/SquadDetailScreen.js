import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeedPost from '../components/FeedPost';

const SQUAD_DUMMY_POSTS = [
  {
    id: '101',
    author: {
      name: 'Riden',
      handle: '@ridengod',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704z',
    },
    timestamp: '5m',
    content: 'Who is down for some comp matches tonight? I am 1 game away from ranking up.',
    likes: 4,
    comments: 2,
    reposts: 0,
  },
  {
    id: '102',
    author: {
      name: 'ToxicTeammate',
      handle: '@yellingsince99',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704y',
    },
    timestamp: '1h',
    content: 'Literally my setup right now:',
    mediaType: 'meme',
    mediaData: {
      url: 'https://i.imgflip.com/1g8my4.jpg', // Reusing dummy meme
    },
    likes: 12,
    comments: 5,
    reposts: 1,
  }
];

export default function SquadDetailScreen({ route, navigation }) {
  // Use safe fallbacks in case navigation params are missing during dev
  const squadName = route?.params?.squadName || 'Squad';

  const handleHopOn = () => {
    alert(`Notifying ${squadName} to HOP ON!`);
    // Push notification logic goes here in Phase 6
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#F2F3F5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{squadName}</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#F2F3F5" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={SQUAD_DUMMY_POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedPost post={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* The massive HOP ON Button pinned at the bottom */}
      <View style={styles.hopOnContainer}>
        <TouchableOpacity style={styles.hopOnButton} onPress={handleHopOn}>
          <Ionicons name="game-controller" size={32} color="#FFF" style={styles.hopOnIcon} />
          <Text style={styles.hopOnText}>HOP ON</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#313338', // Discord Primary
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1F22',
    backgroundColor: '#313338',
  },
  backButton: {
    paddingRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F2F3F5',
  },
  settingsButton: {
    paddingLeft: 16,
  },
  listContent: {
    paddingBottom: 120, // Space for the Hop On button
  },
  hopOnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32, // Safe area padding
    backgroundColor: 'rgba(49, 51, 56, 0.95)', // Semi-transparent Discord Primary
    borderTopWidth: 1,
    borderTopColor: '#1E1F22',
  },
  hopOnButton: {
    backgroundColor: '#23A559', // Discord Green
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#23A559',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  hopOnIcon: {
    marginRight: 12,
  },
  hopOnText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
