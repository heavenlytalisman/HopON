import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, FlatList, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';import { Image } from 'expo-image';


// Standard public testing key for Tenor API
const TENOR_API_KEY = process.env.EXPO_PUBLIC_TENOR_API_KEY || 'LIVDSRZULELA'; 

interface GifPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectGif: (gifData: any) => void;
}

export default function GifPickerModal({ visible, onClose, onSelectGif }: GifPickerModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [recentGifs, setRecentGifs] = useState<any[]>([]);
  const [favoriteGifs, setFavoriteGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'recent' | 'favorites'>('search');

  useEffect(() => {
    if (visible) {
      loadLocalData();
      if (activeTab === 'search' && !query) {
        fetchTrendingGifs();
      }
    }
  }, [visible, activeTab]);

  const loadLocalData = async () => {
    try {
      const recentStr = await AsyncStorage.getItem('@hopon_recent_gifs');
      const favStr = await AsyncStorage.getItem('@hopon_fav_gifs');
      if (recentStr) setRecentGifs(JSON.parse(recentStr));
      if (favStr) setFavoriteGifs(JSON.parse(favStr));
    } catch (e) {
      console.error(e);
    }
  };

  const saveLocalData = async (key: string, data: any[]) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTrendingGifs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://g.tenor.com/v1/trending?key=${TENOR_API_KEY}&limit=20`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Error fetching trending gifs:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async () => {
    if (!query.trim()) {
      fetchTrendingGifs();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=20`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Error fetching gifs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (item: any) => {
    // Save to recents
    const newRecents = [item, ...recentGifs.filter(g => g.id !== item.id)].slice(0, 20);
    setRecentGifs(newRecents);
    saveLocalData('@hopon_recent_gifs', newRecents);

    onSelectGif({
      url: item.media[0].gif.url,
      id: item.id
    });
  };

  const toggleFavorite = async (item: any) => {
    const isFav = favoriteGifs.some(g => g.id === item.id);
    let newFavs = [];
    if (isFav) {
      newFavs = favoriteGifs.filter(g => g.id !== item.id);
    } else {
      newFavs = [item, ...favoriteGifs];
    }
    setFavoriteGifs(newFavs);
    saveLocalData('@hopon_fav_gifs', newFavs);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isFav = favoriteGifs.some(g => g.id === item.id);
    
    return (
      <View style={styles.gifWrapper}>
        <TouchableOpacity style={styles.gifItem} onPress={() => handleSelect(item)}>
          <Image source={{ uri: item.media[0].gif.url }} style={styles.gifImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favBtn} onPress={() => toggleFavorite(item)}>
          <Ionicons name={isFav ? "heart" : "heart-outline"} size={20} color={isFav ? Colors.secondary : '#FFF'} />
        </TouchableOpacity>
      </View>
    );
  };

  const getActiveData = () => {
    switch (activeTab) {
      case 'recent': return recentGifs;
      case 'favorites': return favoriteGifs;
      default: return results;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>GIF Search</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, activeTab === 'search' && styles.activeTab]} onPress={() => setActiveTab('search')}>
              <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'recent' && styles.activeTab]} onPress={() => setActiveTab('recent')}>
              <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>Recent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'favorites' && styles.activeTab]} onPress={() => setActiveTab('favorites')}>
              <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>Favorites</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'search' && (
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Tenor..."
                placeholderTextColor={Colors.textPlaceholder}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={searchGifs}
                returnKeyType="search"
                autoFocus
              />
            </View>
          )}

          {loading ? (
            <ActivityIndicator style={{ marginTop: Spacing.xl }} color={Colors.primaryLight} />
          ) : (
            <FlatList
              data={getActiveData()}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No GIFs found.</Text>
              }
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  closeText: {
    color: Colors.textMuted,
    fontSize: 16,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    color: Colors.textMuted,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: Colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.pill,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  row: {
    justifyContent: 'space-between',
  },
  gifWrapper: {
    width: '48%',
    marginBottom: Spacing.md,
    position: 'relative',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  gifItem: {
    width: '100%',
    aspectRatio: 1,
  },
  gifImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    marginTop: Spacing.xl,
  }
});
