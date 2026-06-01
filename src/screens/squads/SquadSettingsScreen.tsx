import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { useUI } from '../../context/UIContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';import { Image } from 'expo-image';


const SOUNDS = [
  { id: 'default', name: 'Default', icon: 'notifications' },
  { id: 'radar', name: 'Radar', icon: 'radio' },
  { id: 'beacon', name: 'Beacon', icon: 'flash' },
  { id: 'siren', name: 'Siren', icon: 'warning' },
  { id: 'chime', name: 'Chime', icon: 'musical-notes' },
];

interface Track {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl60: string;
  previewUrl: string;
}

export default function SquadSettingsScreen({ route, navigation }: RootStackScreenProps<'SquadSettings'>) {
  const { squadId, squadName } = route.params;

  const [selectedSound, setSelectedSound] = useState<string | number>('default');
  
  // Apple Music Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);
  const [player, setPlayer] = useState<AudioPlayer | null>(null);
  
  const { showToast, showDialog } = useUI();

  useEffect(() => {
    return () => {
      if (player) {
        player.remove();
      }
    };
  }, [player]);

  const searchSongs = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const playPreview = async (track: Track) => {
    try {
      if (player) {
        player.pause();
        player.remove();
        setPlayer(null);
      }
      if (playingTrackId === track.trackId) {
        setPlayingTrackId(null);
        return; // Toggle off
      }
      
      const newPlayer = createAudioPlayer(track.previewUrl);
      setPlayer(newPlayer);
      setPlayingTrackId(track.trackId);
      newPlayer.play();
    } catch (error) {
      console.error("Error playing sound", error);
    }
  };

  const selectTrack = (track: Track) => {
    setSelectedSound(track.trackId);
    setSelectedTrack(track);
  };

  const handleSave = () => {
    showToast({
      title: 'Preferences updated',
      type: 'success',
    });
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  const handleLeaveSquad = () => {
    showDialog({
      title: 'Leave Squad',
      message: 'Are you sure you want to leave this squad? This action cannot be undone.',
      actions: [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        { text: 'Leave', style: 'destructive', onPress: () => navigation.navigate('MainTabs', { screen: 'Squads' } as any) }
      ]
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Squad Alert Settings</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Default Sounds</Text>
        <View style={styles.soundsContainer}>
          {SOUNDS.map((sound, index) => (
            <TouchableOpacity
              key={sound.id}
              style={[
                styles.soundItem,
                selectedSound === sound.id && styles.soundItemSelected,
                index === SOUNDS.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={() => {
                setSelectedSound(sound.id);
                if (player) {
                  player.pause();
                  player.remove();
                  setPlayer(null);
                  setPlayingTrackId(null);
                }
              }}
            >
              <View style={styles.soundItemLeft}>
                <Ionicons name={sound.icon as any} size={18} color={selectedSound === sound.id ? Colors.primaryLight : Colors.textMuted} />
                <Text style={[styles.soundItemText, selectedSound === sound.id && { color: '#FFF' }]}>{sound.name}</Text>
              </View>
              {selectedSound === sound.id && (
                <Ionicons name="checkmark" size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>Custom Apple Music Track</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color={Colors.textMuted} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search songs..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={searchSongs}
          />
          {isSearching && <ActivityIndicator size="small" color={Colors.primary} />}
        </View>
        
        {(searchResults.length > 0 || selectedTrack) && (
          <View style={[styles.soundsContainer, { marginTop: Spacing.sm }]}>
            {(searchResults.length > 0 ? searchResults : (selectedTrack ? [selectedTrack] : [])).map((track, index, arr) => (
              <TouchableOpacity
                key={track.trackId}
                style={[
                  styles.soundItem,
                  selectedSound === track.trackId && styles.soundItemSelected,
                  index === arr.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => selectTrack(track)}
              >
                <View style={styles.soundItemLeft}>
                  <Image source={{ uri: track.artworkUrl60 }} style={styles.trackArtwork} />
                  <View style={styles.trackInfo}>
                    <Text style={[styles.soundItemText, { marginLeft: 0 }, selectedSound === track.trackId && { color: '#FFF' }]} numberOfLines={1}>{track.trackName}</Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>{track.artistName}</Text>
                  </View>
                </View>
                <View style={styles.actionsRight}>
                  <TouchableOpacity style={styles.playBtn} onPress={() => playPreview(track)}>
                    <Ionicons name={playingTrackId === track.trackId ? "pause" : "play"} size={16} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  {selectedSound === track.trackId && (
                    <Ionicons name="checkmark" size={18} color={Colors.primary} style={{ marginLeft: Spacing.sm }} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.leaveBtn} onPress={handleLeaveSquad}>
            <Ionicons name="exit-outline" size={16} color={Colors.error} />
            <Text style={styles.leaveBtnText}>Leave Squad</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    paddingTop: Spacing.sm,
    flexGrow: 1,
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  soundsContainer: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#151928',
  },
  soundItemSelected: {
    backgroundColor: '#1A1E2E',
  },
  soundItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  soundItemText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginLeft: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151928',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSizes.sm,
    paddingVertical: 10,
    marginLeft: Spacing.sm,
  },
  trackArtwork: {
    width: 32,
    height: 32,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  trackArtist: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playBtn: {
    padding: Spacing.xs,
  },
  bottomActions: {
    marginTop: 'auto',
    paddingTop: Spacing.xl,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#334155',
  },
  leaveBtnText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
});
