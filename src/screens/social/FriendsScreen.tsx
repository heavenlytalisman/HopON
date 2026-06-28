import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity , RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/ui/EmptyState';
import { useFriends } from '../../hooks/useFriends';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { useUI } from '../../context/UIContext';
import type { MainTabScreenProps, Friend } from '../../types';
import { Image } from 'expo-image';


export default function FriendsScreen({ navigation }: any) {
  const { showToast } = useUI();
  const [searchQuery, setSearchQuery] = useState('');
  const [requestedUserIds, setRequestedUserIds] = useState<Set<string>>(new Set());
  const { friends, loadingFriends, searchResults, isSearching, search, sendRequest, refreshFriends } = useFriends();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (refreshFriends) await refreshFriends();
    setRefreshing(false);
  }, [refreshFriends]);
  const { contentWidth, horizontalPadding } = useResponsive();

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    search(text);
  };

  const handleAddFriend = async (userId: string) => {
    if (requestedUserIds.has(userId)) return;
    const success = await sendRequest(userId);
    if (success) {
      setRequestedUserIds(prev => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
      showToast({ title: 'Success', message: 'Friend request sent!', type: 'success' });
    } else {
      showToast({ title: 'Error', message: 'Failed to send friend request. Please try again.', type: 'error' });
    }
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.friendCard}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar  }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineBadge} />}
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.nickname || item.name}</Text>
        <Text style={styles.friendHandle}>{item.handle ? (item.handle.startsWith('@') ? item.handle : `@${item.handle}`) : `@${item.nickname || item.name}`}</Text>
      </View>
      {isSearching && !requestedUserIds.has(item.id) && (
        <TouchableOpacity style={styles.addButtonSmall} onPress={() => handleAddFriend(item.id)}>
          <Ionicons name="person-add" size={16} color="#FFF" />
        </TouchableOpacity>
      )}
      {isSearching && requestedUserIds.has(item.id) && (
        <View style={[styles.addButtonSmall, { backgroundColor: Colors.success }]}>
          <Ionicons name="checkmark" size={16} color="#FFF" />
        </View>
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
          {isSearching ? (
            <>
              <Text style={styles.sectionTitle}>Search Results ({searchResults.length})</Text>
              <FlatList refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} colors={[Colors.primaryLight]} />}
                keyboardShouldPersistTaps="handled"
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={renderFriend as any}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            </>
          ) : (
            <EmptyState 
              iconName="search-outline" 
              title="Find Friends" 
              subtitle="Search for users above by their username to send them a friend request." 
            />
          )}
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
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.3)', borderRadius: BorderRadius.pill, paddingHorizontal: Spacing.xl, height: 52, borderWidth: 1, borderColor: 'rgba(51, 65, 85, 0.5)' },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: { flex: 1, fontSize: 16, color: Colors.textPrimary },
  listContainer: { flex: 1, paddingTop: Spacing.md },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, paddingHorizontal: Spacing.xl, marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 1 },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  friendCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, marginBottom: 4 },
  avatarContainer: { position: 'relative', marginRight: Spacing.lg },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.border },
  onlineBadge: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.surface },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  friendHandle: { fontSize: 13, color: Colors.textMuted },
  addButtonSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: Spacing.md },
});
