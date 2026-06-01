import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, FlatList, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';import { Image } from 'expo-image';


interface MusicSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSong: (songData: any) => void;
}

export default function MusicSearchModal({ visible, onClose, onSelectSong }: MusicSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [player, setPlayer] = useState<AudioPlayer | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Stop sound when modal closes
  useEffect(() => {
    if (!visible) {
      stopSound();
    }
  }, [visible]);

  useEffect(() => {
    return () => {
      if (player) {
        player.remove();
      }
    };
  }, [player]);

  useEffect(() => {
    if (visible && !query.trim() && results.length === 0) {
      fetchPopularMusic();
    }
  }, [visible]);

  const fetchPopularMusic = async () => {
    setLoading(true);
    try {
      const url = `https://itunes.apple.com/search?term=pop+hits+2024&entity=song&limit=20`;
      const fetchUrl = Platform.OS === 'web' 
        ? `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
        : url;
      
      const res = await fetch(fetchUrl);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Error fetching popular music:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchMusic = async () => {
    if (!query.trim()) {
      fetchPopularMusic();
      return;
    }
    setLoading(true);
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=20`;
      const fetchUrl = Platform.OS === 'web' 
        ? `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
        : url;
      
      const res = await fetch(fetchUrl);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Error fetching music:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopSound = async () => {
    if (player) {
      player.pause();
      player.remove();
      setPlayer(null);
      setPlayingId(null);
    }
  };

  const playPreview = async (previewUrl: string, trackId: string) => {
    try {
      if (playingId === trackId) {
        // Stop if clicking the same song
        await stopSound();
        return;
      }
      
      // Stop currently playing
      await stopSound();

      const newPlayer = createAudioPlayer(previewUrl);
      setPlayer(newPlayer);
      setPlayingId(trackId);
      newPlayer.play();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const handleSelect = (item: any) => {
    stopSound();
    onSelectSong({
      title: item.trackName,
      artist: item.artistName,
      albumArt: item.artworkUrl100,
      previewUrl: item.previewUrl,
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.resultItem}>
      <Image source={{ uri: item.artworkUrl100 }} style={styles.albumArt} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.trackName}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{item.artistName}</Text>
      </View>
      
      <View style={styles.actions}>
        {item.previewUrl && (
          <TouchableOpacity 
            style={styles.playBtn} 
            onPress={() => playPreview(item.previewUrl, item.trackId)}
          >
            <Ionicons 
              name={playingId === item.trackId ? "pause" : "play"} 
              size={20} 
              color="#FFF" 
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.addBtn} onPress={() => handleSelect(item)}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
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
            <Text style={styles.headerTitle}>Add Music</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search songs, artists..."
              placeholderTextColor={Colors.textPlaceholder}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={searchMusic}
              returnKeyType="search"
              autoFocus
            />
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginTop: Spacing.xl }} color={Colors.primaryLight} />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.trackId.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
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
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.border,
  },
  songInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  songTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  songArtist: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
