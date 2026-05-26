import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import type { FeedPostData } from '../../types';

interface FeedPostProps {
  post: FeedPostData;
}

export default function FeedPost({ post }: FeedPostProps) {
  const { author, timestamp, content, mediaType, mediaData } = post;

  const renderMedia = () => {
    if (!mediaType || !mediaData) return null;

    switch (mediaType) {
      case 'meme':
        return (
          <Image
            source={{ uri: mediaData.url }}
            style={styles.memeImage}
            resizeMode="cover"
          />
        );
      case 'anime':
        return (
          <View style={styles.mediaCard}>
            <Image source={{ uri: mediaData.cover }} style={styles.mediaCover} />
            <View style={styles.mediaInfo}>
              <Text style={styles.mediaTitle}>{mediaData.title}</Text>
              <Text style={styles.mediaSubtitle}>Anime • ★ {mediaData.rating}</Text>
            </View>
          </View>
        );
      case 'movie':
        return (
          <View style={styles.mediaCard}>
            <Image source={{ uri: mediaData.poster }} style={styles.mediaCover} />
            <View style={styles.mediaInfo}>
              <Text style={styles.mediaTitle}>{mediaData.title}</Text>
              <Text style={styles.mediaSubtitle}>Letterboxd • ★ {mediaData.rating}</Text>
            </View>
          </View>
        );
      case 'song':
        return (
          <View style={styles.songCard}>
            <Image source={{ uri: mediaData.albumArt }} style={styles.songCover} />
            <View style={styles.mediaInfo}>
              <Text style={styles.songTitle}>{mediaData.title}</Text>
              <Text style={styles.songArtist}>{mediaData.artist}</Text>
            </View>
            <Ionicons name="play-circle" size={32} color={Colors.primaryLight} style={{ marginLeft: 'auto' }} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.postContainer}>
      <Image source={{ uri: author.avatar }} style={styles.avatar} />

      <View style={styles.postContent}>
        <View style={styles.headerRow}>
          <Text style={styles.authorName}>{author.name}</Text>
          <Text style={styles.authorHandle}>{author.handle}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>

        {content ? <Text style={styles.bodyText}>{content}</Text> : null}

        {renderMedia()}

        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="chatbubble-outline" size={20} color={Colors.textMuted} />
            <Text style={styles.actionCount}>{post.comments || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="repeat-outline" size={22} color={Colors.textMuted} />
            <Text style={styles.actionCount}>{post.reposts || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="heart-outline" size={22} color={Colors.secondary} />
            <Text style={[styles.actionCount, { color: Colors.secondary }]}>{post.likes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="share-outline" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: { 
    flexDirection: 'row', 
    padding: Spacing.lg, 
    backgroundColor: Colors.surface, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.lg, 
    borderWidth: 1, 
    borderColor: Colors.border 
  },
  avatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: Colors.border, 
    marginRight: Spacing.md 
  },
  postContent: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  authorName: { fontWeight: 'bold', color: Colors.textPrimary, fontSize: 15, marginRight: 4 },
  authorHandle: { color: Colors.textMuted, fontSize: 13 },
  dot: { color: Colors.textMuted, marginHorizontal: 4 },
  timestamp: { color: Colors.textMuted, fontSize: 13 },
  bodyText: { color: '#E2E8F0', fontSize: 14, lineHeight: 22, marginBottom: Spacing.md },
  memeImage: { width: '100%', height: 200, borderRadius: BorderRadius.md, marginBottom: Spacing.md, backgroundColor: Colors.surfaceAlt },
  mediaCard: { flexDirection: 'row', backgroundColor: Colors.surfaceAlt, borderRadius: BorderRadius.md, overflow: 'hidden', marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  songCard: { flexDirection: 'row', backgroundColor: Colors.surfaceAlt, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  mediaCover: { width: 80, height: 120, backgroundColor: Colors.border },
  songCover: { width: 48, height: 48, borderRadius: BorderRadius.sm, backgroundColor: Colors.border, marginRight: Spacing.md },
  mediaInfo: { flex: 1, padding: Spacing.md, justifyContent: 'center' },
  mediaTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  mediaSubtitle: { color: Colors.textMuted, fontSize: 13 },
  songTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: 'bold' },
  songArtist: { color: Colors.textMuted, fontSize: 12 },
  actionBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginRight: Spacing.xl },
  actionIcon: { flexDirection: 'row', alignItems: 'center' },
  actionCount: { color: Colors.textMuted, marginLeft: 6, fontSize: 12, fontWeight: '600' },
});
