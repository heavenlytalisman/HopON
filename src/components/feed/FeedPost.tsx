import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import type { FeedPostData } from '../../types';

interface FeedPostProps {
  post: FeedPostData;
  depth?: number;
  variant?: 'feed' | 'detail';
}

export default function FeedPost({ post, depth = 0, variant = 'feed' }: FeedPostProps) {
  const { author, timestamp, content, mediaType, mediaData } = post;
  
  // Cap depth to prevent squishing on narrow screens
  const currentDepth = Math.min(depth, 3);

  const renderMedia = (mediaType: string, mediaData: any) => {
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

  const hasThread = post.thread && post.thread.length > 0;
  const hasReplies = post.replies && post.replies.length > 0;

  if (variant === 'detail') {
    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <Image source={{ uri: author.avatar }} style={styles.avatar} />
          <View style={styles.detailAuthorInfo}>
            <Text style={styles.authorName}>{author.name}</Text>
            <Text style={styles.authorHandle}>{author.handle}</Text>
          </View>
          <TouchableOpacity style={{ marginLeft: 'auto' }}>
            <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {content ? <Text style={styles.detailBodyText}>{content}</Text> : null}
        
        {renderMedia(mediaType as any, mediaData)}

        <View style={styles.detailTimestampRow}>
          <Text style={styles.timestamp}>{timestamp} • HopON Web</Text>
        </View>

        <View style={styles.detailStatsRow}>
          <Text style={styles.statText}><Text style={styles.statNumber}>{post.reposts || 0}</Text> Reposts</Text>
          <Text style={styles.statText}><Text style={styles.statNumber}>{post.comments || 0}</Text> Quotes</Text>
          <Text style={styles.statText}><Text style={styles.statNumber}>{post.likes || 0}</Text> Likes</Text>
        </View>

        <View style={styles.detailActionBar}>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="chatbubble-outline" size={24} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="repeat-outline" size={26} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="heart-outline" size={24} color={Colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="arrow-redo-outline" size={24} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- Feed Variant Below ---

  const renderSinglePost = (p: FeedPostData, isLast: boolean, isThreadChild = false) => {
    return (
      <View key={p.id} style={[styles.singlePostRow, isThreadChild && { marginTop: Spacing.md }]}>
        <View style={styles.leftCol}>
          <Image source={{ uri: p.author.avatar }} style={styles.avatar} />
          {/* Thread line for flat author continuations */}
          {!isLast && <View style={styles.threadLine} />}
        </View>

        <View style={styles.postContent}>
          <View style={styles.headerRow}>
            <Text style={styles.authorName}>{p.author.name}</Text>
            <Text style={styles.authorHandle}>{p.author.handle}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.timestamp}>{p.timestamp}</Text>
            <TouchableOpacity style={{ marginLeft: 'auto' }}>
              <Ionicons name="ellipsis-horizontal" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {p.content ? <Text style={styles.bodyText}>{p.content}</Text> : null}

          {renderMedia(p.mediaType as any, p.mediaData)}

          <View style={styles.actionBar}>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="chatbubble-outline" size={18} color={Colors.textMuted} />
              <Text style={styles.actionCount}>{p.comments || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="repeat-outline" size={20} color={Colors.textMuted} />
              <Text style={styles.actionCount}>{p.reposts || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="heart-outline" size={20} color={Colors.secondary} />
              <Text style={[styles.actionCount, { color: Colors.secondary }]}>{p.likes || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="arrow-redo-outline" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[
      styles.postContainer, 
      depth > 0 && styles.nestedPostContainer
    ]}>
      
      {/* Flat thread rendering (author continuation) */}
      {renderSinglePost(post, !hasThread, false)}
      {hasThread && post.thread!.map((child, index) => 
        renderSinglePost(child, index === post.thread!.length - 1, true)
      )}

      {/* Nested Replies Rendering (Child threads with branching lines) */}
      {hasReplies && (
        <View style={styles.repliesContainer}>
          <View style={styles.branchLine} />
          {post.replies!.map(reply => (
            <View key={reply.id} style={styles.replyWrapper}>
              <View style={styles.branchNotch} />
              <FeedPost post={reply} depth={currentDepth + 1} variant="feed" />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: { 
    flexDirection: 'column', 
    padding: Spacing.lg, 
    backgroundColor: Colors.surface, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.lg, 
    borderWidth: 1, 
    borderColor: Colors.border 
  },
  nestedPostContainer: {
    padding: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    marginBottom: 0,
    borderWidth: 0,
    marginTop: Spacing.md,
  },
  
  // Detail Layout Styles
  detailContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  detailAuthorInfo: {
    marginLeft: Spacing.md,
  },
  detailBodyText: {
    color: '#E2E8F0',
    fontSize: 20, // Larger text for detail view
    lineHeight: 28,
    marginBottom: Spacing.lg,
  },
  detailTimestampRow: {
    paddingVertical: Spacing.md,
  },
  detailStatsRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.lg,
  },
  statNumber: {
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  detailActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
  },

  // Feed Layout Styles
  singlePostRow: {
    flexDirection: 'row',
  },
  leftCol: {
    alignItems: 'center',
    marginRight: Spacing.md,
    zIndex: 2,
  },
  avatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: Colors.border,
  },
  threadLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
    marginBottom: -Spacing.md, // Connect to next avatar
  },
  repliesContainer: {
    paddingLeft: 22, // Half the avatar width to align line with center of avatar
    marginTop: Spacing.sm,
    position: 'relative',
  },
  branchLine: {
    position: 'absolute',
    left: 21, // Center it under the avatar
    top: -Spacing.sm,
    bottom: Spacing.xl, // Don't let it go all the way to the bottom of the last item
    width: 2,
    backgroundColor: '#334155',
    zIndex: 1,
  },
  replyWrapper: {
    position: 'relative',
    paddingLeft: Spacing.lg,
  },
  branchNotch: {
    position: 'absolute',
    left: 0,
    top: 22, // Center of the avatar height
    width: Spacing.lg,
    height: 2,
    backgroundColor: '#334155',
    zIndex: 1,
  },
  postContent: { flex: 1, paddingBottom: 4 },
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
