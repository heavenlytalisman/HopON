import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFriends } from '../../hooks/useFriends';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { MainTabScreenProps, Friend } from '../../types';

const DUMMY_FRIENDS: Friend[] = [
  { id: '1', name: 'Alex Mercer', handle: '@alexm_gaming', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', isOnline: true },
  { id: '2', name: 'Sarah K.', handle: '@sarah_weeb', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', isOnline: false },
  { id: '3', name: 'Marcus Chen', handle: '@marcus_c', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f', isOnline: true },
];

export default function FriendsScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchResults, isSearching, search, sendRequest } = useFriends();
  const { contentWidth, horizontalPadding } = useResponsive();

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    search(text);
  };

  const handleAddFriend = async (userId: string) => {
    const success = await sendRequest(userId);
    if (success) alert('Friend request sent!');
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.friendCard}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineBadge} />}
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.nickname || item.name}</Text>
        <Text style={styles.friendHandle}>{item.nickname ? `@${item.nickname}` : item.handle}</Text>
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
      <View style={[styles.content, { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Friends</Text>
          <View style={{width: 24}} />
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
            <TextInput style={styles.searchInput} placeholder="Search by username..." placeholderTextColor={Colors.textMuted} value={searchQuery} onChangeText={handleSearch} />
          </View>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>{isSearching ? `Search Results (${searchResults.length})` : `My Squad (${DUMMY_FRIENDS.length})`}</Text>
          <FlatList
            data={isSearching ? searchResults : DUMMY_FRIENDS}
            keyExtractor={(item) => item.id}
            renderItem={renderFriend}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingTop: Spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: Spacing.md },
  backButton: { },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  searchContainer: { flexDirection: 'row', marginBottom: Spacing.xl, alignItems: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, height: 48, borderWidth: 1, borderColor: Colors.border },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: { flex: 1, fontSize: 16, color: Colors.textPrimary },
  listContainer: { flex: 1, backgroundColor: Colors.surfaceAlt, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: Spacing.xxl, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textMuted, paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  listContent: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },
  friendCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.borderLight },
  avatarContainer: { position: 'relative', marginRight: Spacing.lg },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.border },
  onlineBadge: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.surface },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  friendHandle: { fontSize: 13, color: Colors.textMuted },
  addButtonSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: Spacing.md },
});
