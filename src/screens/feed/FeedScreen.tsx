import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, TextInput, ActivityIndicator, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FeedPost from '../../components/feed/FeedPost';
import { useFeed } from '../../hooks/useFeed';
import { useAuth } from '../../context/AuthContext';
import { useFriends } from '../../hooks/useFriends';
import { EmptyState } from '../../components/ui/EmptyState';
import { useUI } from '../../context/UIContext';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';
import type { MainTabScreenProps } from '../../types';

import MusicSearchModal from '../../components/feed/MusicSearchModal';
import GifPickerModal from '../../components/feed/GifPickerModal';
import MovieSearchModal from '../../components/feed/MovieSearchModal';
import GameSearchModal from '../../components/feed/GameSearchModal';
import * as ImagePicker from 'expo-image-picker';import { Image } from 'expo-image';


export default function FeedScreen({ navigation }: MainTabScreenProps<'Feed'>) {
  const { posts, loading, isPosting, publishPost } = useFeed();
  const { profile } = useAuth();
  const { friends } = useFriends();
  const { showToast } = useUI();

  const feedPosts = posts.filter(post => {
    if (post.author.name === profile?.nickname) return true;
    return friends.some(friend => friend.nickname === post.author.name);
  });
  const { contentWidth, horizontalPadding } = useResponsive();
  const [postTexts, setPostTexts] = useState<string[]>(['']);
  const [attachedMedia, setAttachedMedia] = useState<any>(null);
  const [attachedMediaType, setAttachedMediaType] = useState<'song' | 'movie' | 'meme' | 'anime' | 'game' | null>(null);

  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [isMusicSearchVisible, setIsMusicSearchVisible] = useState(false);
  const [isMovieSearchVisible, setIsMovieSearchVisible] = useState(false);
  const [isGameSearchVisible, setIsGameSearchVisible] = useState(false);
  const [isAddMenuVisible, setIsAddMenuVisible] = useState(false);
  const [isGifPickerVisible, setIsGifPickerVisible] = useState(false);

  const handlePost = async () => {
    try {
      await publishPost(postTexts, attachedMediaType || undefined, attachedMedia);
      setPostTexts(['']);
      setAttachedMedia(null);
      setAttachedMediaType(null);
      setIsComposeVisible(false);
    } catch {
      showToast({ title: 'Error', message: 'Could not create post. Please try again.', type: 'error' });
    }
  };

  const updatePostText = (text: string, index: number) => {
    const newTexts = [...postTexts];
    newTexts[index] = text;
    setPostTexts(newTexts);
  };

  const pickImage = async () => {
    setIsAddMenuVisible(false);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setAttachedMedia({ url: result.assets[0].uri });
      setAttachedMediaType('meme');
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.pageTitle}>Feed</Text>
      <TouchableOpacity style={styles.headerAddBtn} onPress={() => setIsComposeVisible(true)}>
        <Ionicons name="add" size={28} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryLight} />
        </View>
      ) : (
        <FlatList
          data={feedPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => navigation.navigate('PostDetail', { postId: item.id, postData: item })}
            >
              <FeedPost post={item} />
            </TouchableOpacity>
          )}
          contentContainerStyle={[styles.listContent, { maxWidth: contentWidth, alignSelf: 'center', width: '100%' }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={{ marginTop: 80 }}>
              <EmptyState 
                iconName="newspaper-outline"
                title="Nothing here yet"
                subtitle="Follow friends or join squads to see their latest updates, or be the first to post something!"
              />
            </View>
          }
        />
      )}

      <Modal visible={isComposeVisible} animationType="slide" transparent={true} onRequestClose={() => setIsComposeVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsComposeVisible(false)} />
          <SafeAreaView style={styles.modalBottomSheet}>
            <View style={styles.dragHandle} />
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsComposeVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Post</Text>
              <View style={{ width: 50 }} />
            </View>
            <ScrollView style={styles.composeContainer} showsVerticalScrollIndicator={false}>
              {postTexts.map((text, index) => (
                <View key={index} style={styles.composeBoxRow}>
                  <View style={styles.composeLeft}>
                    <Image source={{ uri: profile?.avatar  }} style={styles.composeAvatar} />
                    {index < postTexts.length - 1 && <View style={styles.composeThreadLine} />}
                  </View>
                  <View style={styles.composeInputContainer}>
                    <TextInput
                      style={styles.composeInput}
                      placeholder={index === 0 ? "What's on your mind?" : "Add another thread..."}
                      placeholderTextColor={Colors.textPlaceholder}
                      value={text}
                      onChangeText={(val) => updatePostText(val, index)}
                      multiline
                      maxLength={280}
                      autoFocus={index === 0}
                    />
                  </View>
                </View>
              ))}

              {attachedMedia && (
                <View style={[styles.attachedMediaCard, attachedMediaType === 'meme' && { padding: 0, overflow: 'hidden' }]}>
                  {attachedMediaType === 'meme' ? (
                    <>
                      <Image 
                        source={{ uri: attachedMedia.url }} 
                        style={{ width: '100%', height: 200, resizeMode: 'cover' }} 
                      />
                      <TouchableOpacity 
                        onPress={() => { setAttachedMedia(null); setAttachedMediaType(null); }} 
                        style={[styles.removeMediaBtn, { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 }]}
                      >
                        <Ionicons name="close-circle" size={24} color="#FFF" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Image 
                        source={{ uri: attachedMediaType === 'song' ? attachedMedia.albumArt : (attachedMedia.poster || attachedMedia.cover) }} 
                        style={
                          attachedMediaType === 'song' ? styles.attachedSongCover : 
                          attachedMediaType === 'game' ? styles.attachedGameCover : 
                          styles.attachedMovieCover
                        } 
                      />
                      <View style={styles.attachedMediaInfo}>
                        <Text style={styles.attachedMediaTitle}>{attachedMedia.title}</Text>
                        <Text style={styles.attachedMediaSubtitle}>
                          {attachedMediaType === 'song' ? attachedMedia.artist : `${attachedMedia.source || 'Letterboxd'} • ★ ${attachedMedia.rating}`}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => { setAttachedMedia(null); setAttachedMediaType(null); }} style={styles.removeMediaBtn}>
                        <Ionicons name="close-circle" size={24} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </ScrollView>

            <View style={styles.composeActionsRow}>
                <View style={styles.actionButtonsLeft}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => setIsAddMenuVisible(!isAddMenuVisible)}>
                    <Ionicons name={isAddMenuVisible ? "close" : "add"} size={24} color={Colors.primaryLight} />
                  </TouchableOpacity>

                  {isAddMenuVisible && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.addMenuHorizontal}>
                      <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
                        <Ionicons name="image-outline" size={22} color={Colors.textPrimary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => { setIsAddMenuVisible(false); setIsGifPickerVisible(true); }}>
                        <View style={styles.gifIconBorder}>
                          <Text style={styles.gifIconText}>GIF</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => { setIsAddMenuVisible(false); setIsMusicSearchVisible(true); }}>
                        <Ionicons name="musical-notes-outline" size={22} color={Colors.textPrimary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => { setIsAddMenuVisible(false); setIsMovieSearchVisible(true); }}>
                        <Ionicons name="film-outline" size={22} color={Colors.textPrimary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => { setIsAddMenuVisible(false); setIsGameSearchVisible(true); }}>
                        <Ionicons name="game-controller-outline" size={22} color={Colors.textPrimary} />
                      </TouchableOpacity>
                    </ScrollView>
                  )}
                </View>

                <View style={styles.actionButtonsRight}>
                  <TouchableOpacity 
                    style={[
                      styles.postButton, 
                      (!postTexts.some(t => t.trim().length > 0) && !attachedMedia) && styles.postButtonDisabled
                    ]} 
                    onPress={handlePost} 
                    disabled={isPosting || (!postTexts.some(t => t.trim().length > 0) && !attachedMedia)}
                  >
                    {isPosting ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.postButtonText}>Post</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      <MusicSearchModal 
        visible={isMusicSearchVisible}
        onClose={() => setIsMusicSearchVisible(false)}
        onSelectSong={(songData) => {
          setAttachedMedia(songData);
          setAttachedMediaType('song');
          setIsMusicSearchVisible(false);
        }}
      />

      <GifPickerModal 
        visible={isGifPickerVisible}
        onClose={() => setIsGifPickerVisible(false)}
        onSelectGif={(gifData) => {
          setAttachedMedia(gifData);
          setAttachedMediaType('meme');
          setIsGifPickerVisible(false);
        }}
      />

      <MovieSearchModal 
        visible={isMovieSearchVisible}
        onClose={() => setIsMovieSearchVisible(false)}
        onSelectMedia={(mediaData, type) => {
          setAttachedMedia(mediaData);
          setAttachedMediaType(type);
          setIsMovieSearchVisible(false);
        }}
      />

      <GameSearchModal 
        visible={isGameSearchVisible}
        onClose={() => setIsGameSearchVisible(false)}
        onSelectGame={(gameData) => {
          setAttachedMedia(gameData);
          setAttachedMediaType('game');
          setIsGameSearchVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  listContent: { 
    paddingBottom: 40 
  },
  headerContainer: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  headerAddBtn: {
    padding: Spacing.xs,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 13, 23, 0.7)',
  },
  modalBottomSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCancelText: {
    color: Colors.textMuted,
    fontSize: 16,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  composeContainer: { 
    backgroundColor: Colors.background, 
    padding: Spacing.lg, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.border,
  },
  composeBoxRow: {
    flexDirection: 'row',
  },
  composeLeft: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  composeThreadLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
    marginBottom: -Spacing.md, // Reach down to next avatar
  },
  composeInputContainer: {
    flex: 1,
    paddingBottom: Spacing.md,
  },
  composeAvatar: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: Colors.border, 
  },
  composeInput: { 
    flex: 1, 
    fontSize: 15, 
    color: Colors.textPrimary, 
    minHeight: 40,
    maxHeight: 100,
    marginTop: 4,
  },
  composeActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  actionButtonsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  addMenuHorizontal: {
    flexDirection: 'row',
    marginLeft: Spacing.xs,
  },
  gifIconBorder: {
    borderWidth: 1.5,
    borderColor: Colors.textPrimary,
    borderRadius: 4,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  gifIconText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  attachedMediaCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginLeft: 36 + Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attachedSongCover: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.border,
    marginRight: Spacing.md,
  },
  attachedMovieCover: {
    width: 40,
    height: 60,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.border,
    marginRight: Spacing.md,
  },
  attachedGameCover: {
    width: 100,
    height: 46,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.border,
    marginRight: Spacing.md,
  },
  attachedMediaInfo: {
    flex: 1,
  },
  attachedMediaTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  attachedMediaSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  removeMediaBtn: {
    marginLeft: Spacing.sm,
  },
  actionButtonsRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButton: { 
    backgroundColor: Colors.primary, 
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  postButtonDisabled: {
    backgroundColor: Colors.surfaceAlt,
    opacity: 0.5,
  },
  postButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
