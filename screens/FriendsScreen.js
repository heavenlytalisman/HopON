import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchUsersByHandle, sendFriendRequest, getUserFriends } from '../services/FirebaseService';
import { auth } from '../firebaseConfig';

export default function FriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const userFriends = await getUserFriends(auth.currentUser.uid);
      setFriends(userFriends);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      setIsSearching(true);
      const results = await searchUsersByHandle(text);
      // Filter out the current user from search results
      setSearchResults(results.filter(u => u.id !== auth.currentUser?.uid));
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleAddFriend = async (userId) => {
    if (auth.currentUser) {
      const success = await sendFriendRequest(auth.currentUser.uid, userId);
      if (success) {
        alert('Friend request sent!');
      }
    }
  };

  const renderFriend = ({ item }) => (
    <View style={styles.friendCard}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineBadge} />}
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.nickname || item.name || 'User'}</Text>
        <Text style={styles.friendHandle}>{item.handle}</Text>
      </View>
      {isSearching && (
        <TouchableOpacity style={styles.addButtonSmall} onPress={() => handleAddFriend(item.id)}>
          <Ionicons name="person-add" size={16} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by nickname..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="person-add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>
          {isSearching ? `Search Results (${searchResults.length})` : `My Squad (${friends.length})`}
        </Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#2C5282" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={isSearching ? searchResults : friends}
            keyExtractor={(item) => item.id}
            renderItem={renderFriend}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 40 }}>
                {isSearching ? 'No users found.' : 'You have no friends yet.'}
              </Text>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2C5282',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EBF8FF',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#2C5282',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#2C5282',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E2E8F0',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981', // Emerald green
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  friendHandle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  addButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
