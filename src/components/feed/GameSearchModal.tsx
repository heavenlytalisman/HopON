import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

interface GameSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectGame: (gameData: any) => void;
}

export default function GameSearchModal({ visible, onClose, onSelectGame }: GameSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && !query.trim()) {
      fetchPopularGames();
    }
  }, [visible]);

  const fetchWithProxy = async (url: string) => {
    const fetchUrl = Platform.OS === 'web' 
      ? `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
      : url;
    const res = await fetch(fetchUrl);
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  };

  const fetchPopularGames = async () => {
    setLoading(true);
    setResults([]);
    try {
      const url = `https://store.steampowered.com/api/storesearch/?term=&l=english&cc=US`;
      const data = await fetchWithProxy(url);
      const mapped = (data.items || []).map((item: any) => ({
        id: item.id.toString(),
        title: item.name,
        poster: item.tiny_image ? item.tiny_image.replace('capsule_231x87', 'header') : null,
        rating: item.metascore ? item.metascore.toString() : 'N/A',
        type: 'game',
        source: 'Steam',
      }));
      setResults(mapped);
    } catch (error) {
      console.error('Error fetching popular games:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchGames = async () => {
    if (!query.trim()) {
      fetchPopularGames();
      return;
    }
    setLoading(true);
    setResults([]);
    try {
      const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`;
      const data = await fetchWithProxy(url);
      const mapped = (data.items || []).map((item: any) => ({
        id: item.id.toString(),
        title: item.name,
        poster: item.tiny_image ? item.tiny_image.replace('capsule_231x87', 'header') : null,
        rating: item.metascore ? item.metascore.toString() : 'N/A',
        type: 'game',
        source: 'Steam',
      }));
      setResults(mapped);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: any) => {
    const mediaData = {
      title: item.title || '',
      poster: item.poster || 'https://via.placeholder.com/460x215?text=No+Image',
      rating: item.rating || 'N/A',
      source: item.source || 'Steam',
    };
    onSelectGame(mediaData);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.resultItem}>
      <Image 
        source={{ uri: item.poster || 'https://via.placeholder.com/100x100?text=NA' }} 
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
            <Text style={styles.headerTitle}>Add Game</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search games..."
              placeholderTextColor={Colors.textPlaceholder}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={searchGames}
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
    width: 100,
    height: 46, // Steam capsule aspect ratio
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.border,
    margin: Spacing.sm,
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
