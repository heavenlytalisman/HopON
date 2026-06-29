import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, FlatList, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Image } from 'expo-image';


interface MovieSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMedia: (mediaData: any, type: 'movie' | 'anime') => void;
}

type TabType = 'movie' | 'show' | 'anime';

export default function MovieSearchModal({ visible, onClose, onSelectMedia }: MovieSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('movie');

  useEffect(() => {
    if (visible && !query.trim()) {
      fetchPopularMedia();
    }
  }, [visible, activeTab]);

  const fetchWithProxy = async (url: string) => {
    const fetchUrl = Platform.OS === 'web' 
      ? `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
      : url;
    const res = await fetch(fetchUrl);
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  };

  const fetchPopularMedia = async () => {
    setLoading(true);
    setResults([]);
    try {
      if (activeTab === 'movie') {
        const url = `https://itunes.apple.com/search?term=marvel&limit=50`;
        const data = await fetchWithProxy(url);
        const mapped = (data.results || [])
          .filter((item: any) => item.kind === 'feature-movie')
          .slice(0, 20)
          .map((item: any) => ({
            id: item.trackId.toString(),
          title: item.trackName,
          poster: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : null,
          rating: item.contentAdvisoryRating || item.primaryGenreName,
          type: 'movie',
          source: 'iTunes',
        }));
        setResults(mapped);
      } else if (activeTab === 'show') {
        const url = `https://api.tvmaze.com/shows?page=0`;
        const data = await fetchWithProxy(url);
        const mapped = data.slice(0, 20).map((item: any) => ({
          id: item.id.toString(),
          title: item.name,
          poster: item.image ? item.image.medium : null,
          rating: item.rating?.average ? item.rating.average.toString() : 'N/A',
          type: 'movie',
          source: 'TVMaze',
        }));
        setResults(mapped);
      } else if (activeTab === 'anime') {
        const queryStr = `
          query {
            Page(page: 1, perPage: 20) {
              media(type: ANIME, sort: TRENDING_DESC) {
                id
                title { romaji english }
                coverImage { large }
                averageScore
              }
            }
          }
        `;
        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ query: queryStr })
        });
        const json = await res.json();
        const mapped = (json.data?.Page?.media || []).map((item: any) => ({
          id: item.id.toString(),
          title: item.title.english || item.title.romaji,
          poster: item.coverImage?.large || null,
          rating: item.averageScore ? (item.averageScore / 10).toString() : 'N/A',
          type: 'anime',
          source: 'AniList',
        }));
        setResults(mapped);
      }
    } catch (error) {
      console.error('Error fetching popular media:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchMedia = async () => {
    if (!query.trim()) {
      fetchPopularMedia();
      return;
    }
    setLoading(true);
    setResults([]);
    try {
      if (activeTab === 'movie') {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=50`;
        const data = await fetchWithProxy(url);
        const mapped = (data.results || [])
          .filter((item: any) => item.kind === 'feature-movie')
          .slice(0, 20)
          .map((item: any) => ({
            id: item.trackId.toString(),
          title: item.trackName,
          poster: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : null,
          rating: item.contentAdvisoryRating || item.primaryGenreName,
          type: 'movie',
          source: 'iTunes',
        }));
        setResults(mapped);
      } else if (activeTab === 'show') {
        const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
        const data = await fetchWithProxy(url);
        const mapped = data.map((item: any) => ({
          id: item.show.id.toString(),
          title: item.show.name,
          poster: item.show.image ? item.show.image.medium : null,
          rating: item.show.rating?.average ? item.show.rating.average.toString() : 'N/A',
          type: 'movie',
          source: 'TVMaze',
        }));
        setResults(mapped);
      } else if (activeTab === 'anime') {
        const queryStr = `
          query ($search: String) {
            Page(page: 1, perPage: 20) {
              media(type: ANIME, search: $search) {
                id
                title { romaji english }
                coverImage { large }
                averageScore
              }
            }
          }
        `;
        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ query: queryStr, variables: { search: query } })
        });
        const json = await res.json();
        const mapped = (json.data?.Page?.media || []).map((item: any) => ({
          id: item.id.toString(),
          title: item.title.english || item.title.romaji,
          poster: item.coverImage?.large || null,
          rating: item.averageScore ? (item.averageScore / 10).toString() : 'N/A',
          type: 'anime',
          source: 'AniList',
        }));
        setResults(mapped);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: any) => {
    const mediaType = item.type === 'anime' ? 'anime' : 'movie';
    const mediaData = {
      title: item.title,
      poster: item.poster || 'https://via.placeholder.com/600x900?text=No+Image', // Fallback for movies
      cover: item.poster || 'https://via.placeholder.com/600x900?text=No+Image',  // Fallback for anime
      rating: item.rating,
      source: item.source,
    };
    onSelectMedia(mediaData, mediaType);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.resultItem}>
      <Image 
        source={{ uri: item.poster || 'https://via.placeholder.com/100x150?text=NA' }} 
        style={styles.poster} 
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{item.source} • ★ {item.rating}</Text>
      </View>
      
      <TouchableOpacity style={styles.addBtn} onPress={() => handleSelect(item)}>
        <Text style={styles.addBtnText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Media</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, activeTab === 'movie' && styles.activeTab]} onPress={() => setActiveTab('movie')}>
              <Text style={[styles.tabText, activeTab === 'movie' && styles.activeTabText]}>Movies</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'show' && styles.activeTab]} onPress={() => setActiveTab('show')}>
              <Text style={[styles.tabText, activeTab === 'show' && styles.activeTabText]}>Shows</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'anime' && styles.activeTab]} onPress={() => setActiveTab('anime')}>
              <Text style={[styles.tabText, activeTab === 'anime' && styles.activeTabText]}>Anime</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeTab === 'movie' ? 'movies' : activeTab === 'show' ? 'TV shows' : 'anime'}...`}
              placeholderTextColor={Colors.textPlaceholder}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={searchMedia}
              returnKeyType="search"
              autoFocus
            />
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginTop: Spacing.xl }} color={Colors.primaryLight} />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                !loading && query ? <Text style={styles.emptyText}>No results found.</Text> : null
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  poster: {
    width: 60,
    height: 90,
    backgroundColor: Colors.border,
  },
  info: {
    flex: 1,
    padding: Spacing.md,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    marginRight: Spacing.md,
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    marginTop: Spacing.xl,
  }
});
