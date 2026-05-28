import React, { useState } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Text, TextInput, Image, ActivityIndicator, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeedPost from '../../components/feed/FeedPost';
import { useFeed } from '../../hooks/useFeed';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';
import type { MainTabScreenProps } from '../../types';

import MusicSearchModal from '../../components/feed/MusicSearchModal';
import GifPickerModal from '../../components/feed/GifPickerModal';
import MovieSearchModal from '../../components/feed/MovieSearchModal';
import * as ImagePicker from 'expo-image-picker';

export default function FeedScreen({ navigation }: MainTabScreenProps<'Feed'>) {
  const { posts, loading, isPosting, publishPost } = useFeed();
  const { profile } = useAuth();
  const { contentWidth, horizontalPadding } = useResponsive();
  const [postTexts, setPostTexts] = useState<string[]>(['']);
  const [attachedMedia, setAttachedMedia] = useState<any>(null);
  const [attachedMediaType, setAttachedMediaType] = useState<'song' | 'movie' | 'meme' | 'anime' | null>(null);

  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [isMusicSearchVisible, setIsMusicSearchVisible] = useState(false);
  const [isMovieSearchVisible, setIsMovieSearchVisible] = useState(false);
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
      Alert.alert('Error', 'Could not create post. Please try again.');
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
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => navigation.navigate('PostDetail', { postId: item.id, mockData: item })}
            >
              <FeedPost post={item} />
            </TouchableOpacity>
          )}
          contentContainerStyle={[styles.listContent, { maxWidth: contentWidth, alignSelf: 'center', width: '100%' }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
        />
      )}

      <Modal visible={isComposeVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsComposeVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
                    <Image source={{ uri: profile?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704z' }} style={styles.composeAvatar} />
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
                        style={attachedMediaType === 'song' ? styles.attachedSongCover : styles.attachedMovieCover} 
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

              <View style={styles.composeActionsRow}>
                <View style={styles.actionButtonsLeft}>
                  <View style={{ position: 'relative' }}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => setIsAddMenuVisible(!isAddMenuVisible)}>
                      <Ionicons name="add-circle" size={16} color={Colors.primaryLight} />
                      <Text style={styles.actionBtnText}>Add</Text>
                    </TouchableOpacity>

                    {isAddMenuVisible && (
                      <View style={styles.addMenu}>
                        <TouchableOpacity style={styles.addMenuItem} onPress={pickImage}>
                          <Ionicons name="image" size={18} color={Colors.primaryLight} />
                          <Text style={styles.addMenuText}>Photo/Video</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.addMenuItem} 
                          onPress={() => { setIsAddMenuVisible(false); setIsGifPickerVisible(true); }}
                        >
                          <Ionicons name="gif" size={18} color={Colors.primaryLight} />
                          <Text style={styles.addMenuText}>GIF</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity style={styles.actionBtn} onPress={() => setIsMusicSearchVisible(true)}>
                    <Ionicons name="musical-notes" size={16} color={attachedMediaType === 'song' ? Colors.success : Colors.primaryLight} />
                    <Text style={[styles.actionBtnText, attachedMediaType === 'song' && { color: Colors.success }]}>Music</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtn} onPress={() => setIsMovieSearchVisible(true)}>
                    <Ionicons name="film" size={16} color={(attachedMediaType === 'movie' || attachedMediaType === 'anime') ? Colors.success : Colors.primaryLight} />
                    <Text style={[styles.actionBtnText, (attachedMediaType === 'movie' || attachedMediaType === 'anime') && { color: Colors.success }]}>Movie</Text>
                  </TouchableOpacity>
                </View>

                {postTexts.some(t => t.trim().length > 0) && (
                  <TouchableOpacity style={styles.postButton} onPress={handlePost} disabled={isPosting}>
                    {isPosting ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.postButtonText}>Post</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
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
    marginTop: Spacing.sm,
    paddingLeft: 36 + Spacing.md, // align with inputs
  },
  actionButtonsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
  },
  actionBtnText: {
    color: Colors.primaryLight,
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
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
  postButton: { 
    backgroundColor: Colors.primary, 
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  postButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  addMenu: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xs,
    width: 150,
    zIndex: 10,
    elevation: 5,
  },
  addMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  addMenuText: {
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    fontSize: 14,
  }
});
