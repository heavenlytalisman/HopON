import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FeedPost({ post }) {
  const { author, timestamp, content, mediaType, mediaData } = post;

  const renderMedia = () => {
    if (!mediaType) return null;

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
            <Ionicons name="play-circle" size={32} color="#2C5282" style={{ marginLeft: 'auto' }} />
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
            <Ionicons name="chatbubble-outline" size={20} color="#64748B" />
            <Text style={styles.actionCount}>{post.comments || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="repeat-outline" size={22} color="#64748B" />
            <Text style={styles.actionCount}>{post.reposts || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="heart-outline" size={22} color="#EF4444" />
            <Text style={[styles.actionCount, { color: '#EF4444' }]}>{post.likes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="share-outline" size={22} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  postContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorName: {
    fontWeight: 'bold',
    color: '#1E293B',
    fontSize: 16,
    marginRight: 4,
  },
  authorHandle: {
    color: '#64748B',
    fontSize: 14,
  },
  dot: {
    color: '#94A3B8',
    marginHorizontal: 4,
  },
  timestamp: {
    color: '#94A3B8',
    fontSize: 14,
  },
  bodyText: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  memeImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#F1F5F9',
  },
  mediaCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  songCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mediaCover: {
    width: 80,
    height: 120,
    backgroundColor: '#E2E8F0',
  },
  songCover: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  mediaInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  mediaTitle: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mediaSubtitle: {
    color: '#64748B',
    fontSize: 14,
  },
  songTitle: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: 'bold',
  },
  songArtist: {
    color: '#64748B',
    fontSize: 13,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginRight: 16,
  },
  actionIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionCount: {
    color: '#64748B',
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
  },
});
