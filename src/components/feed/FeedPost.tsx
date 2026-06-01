import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { useNavigation } from '@react-navigation/native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import type { FeedPostData } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { createPost } from '../../services/firebase';
import { serverTimestamp } from 'firebase/firestore';
import { useUI } from '../../context/UIContext';import { Image } from 'expo-image';


interface FeedPostProps {
  post: FeedPostData;
  depth?: number;
  variant?: 'feed' | 'detail';
  onCommentPress?: () => void;
}

export default function FeedPost({ post, depth = 0, variant = 'feed', onCommentPress }: FeedPostProps) {
  const { author, timestamp, content, mediaType, mediaData } = post;
  
  const [player, setPlayer] = useState<AudioPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPostOptions, setSelectedPostOptions] = useState<FeedPostData | null>(null);
  const { showToast, showDialog } = useUI();

  useEffect(() => {
    return () => {
      if (player) {
        player.remove();
      }
    };
  }, [player]);

  const togglePlayback = async (previewUrl: string) => {
    if (!previewUrl) return;

    try {
      if (player) {
        if (isPlaying) {
          player.pause();
          setIsPlaying(false);
        } else {
          player.play();
          setIsPlaying(true);
        }
      } else {
        const newPlayer = createAudioPlayer(previewUrl);
        setPlayer(newPlayer);
        setIsPlaying(true);
        newPlayer.play();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };
  
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
            contentFit="cover"
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
      case 'game':
        return (
          <View style={styles.gameCardCol}>
            <Image source={{ uri: mediaData.poster }} style={styles.gameCoverLarge} contentFit="cover" />
            <View style={styles.gameInfoCol}>
              <Text style={styles.mediaTitle}>{mediaData.title}</Text>
              <Text style={styles.mediaSubtitle}>{mediaData.source} • ★ {mediaData.rating}</Text>
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
            {mediaData.previewUrl ? (
              <TouchableOpacity onPress={() => togglePlayback(mediaData.previewUrl)} style={{ marginLeft: 'auto' }}>
                <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={32} color={Colors.primaryLight} />
              </TouchableOpacity>
            ) : (
              <Ionicons name="musical-note" size={24} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
            )}
          </View>
        );
      default:
        return null;
    }
  };

  const hasThread = post.thread && post.thread.length > 0;
  const hasReplies = post.replies && post.replies.length > 0;

  const navigation = useNavigation<any>();
  const { profile } = useAuth();

  // Local state to handle interactions for the post and its thread
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [repostedPosts, setRepostedPosts] = useState<Record<string, boolean>>({});

  const handleLike = (id: string) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRepost = async (id: string) => {
    const isAlreadyReposted = repostedPosts[id];
    setRepostedPosts(prev => ({ ...prev, [id]: !isAlreadyReposted }));

    if (!isAlreadyReposted && profile) {
      try {
        await createPost({
          authorId: profile.uid,
          authorName: post.author.name,
          authorHandle: post.author.handle,
          authorAvatar: post.author.avatar,
          content: post.content || '',
          timestamp: serverTimestamp(),
          mediaType: post.mediaType as any,
          mediaData: post.mediaData,
          thread: post.thread as any,
          repostedBy: {
            name: profile.nickname,
            handle: `@${profile.nickname.toLowerCase().replace(/\s+/g, '')}`,
            uid: profile.uid,
          }
        });
      } catch (error) {
        console.error('Error reposting:', error);
      }
    }
  };

  const postRefs = useRef<Record<string, any>>({});
  const shareCardRef = useRef<View>(null);
  const [shareData, setShareData] = useState<FeedPostData | null>(null);

  const handleShare = async (id: string, p: FeedPostData) => {
    try {
      setShareData(p);
      setTimeout(async () => {
        try {
          if (shareCardRef.current) {
            const uri = await captureRef(shareCardRef.current, {
              format: 'png',
              quality: 1,
            });
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(uri, {
                dialogTitle: 'Share to Instagram Story',
                mimeType: 'image/png',
              });
            } else {
              showToast({ title: 'Share Debug', message: 'Sharing is not available on this device/platform.', type: 'error' });
            }
          } else {
            showToast({ title: 'Share Debug', message: 'shareCardRef is missing.', type: 'error' });
          }
        } catch (e: any) {
          console.error(e);
          showToast({ title: 'Share Error', message: e?.message || String(e), type: 'error' });
        } finally {
          setShareData(null);
        }
      }, 100);
    } catch (error: any) {
      console.error('Error sharing post screenshot:', error);
    }
  };

  const handleComment = (p: FeedPostData) => {
    if (variant === 'feed') {
      navigation.push('PostDetail', { postId: p.id, postData: p });
    } else {
      if (onCommentPress) onCommentPress();
    }
  };

  const handlePostOptions = (p: FeedPostData) => {
    setSelectedPostOptions(p);
  };

  const executePostOption = () => {
    if (!selectedPostOptions) return;
    const isOwnPost = profile ? selectedPostOptions.author.handle === `@${profile.nickname.toLowerCase().replace(/\s+/g, '')}` : false;
    
    setSelectedPostOptions(null);
    setTimeout(() => {
      showToast({ 
        title: isOwnPost ? 'Post Deleted' : 'Post Hidden', 
        message: isOwnPost ? 'Your post was removed.' : 'This post will no longer appear in your feed.', 
        type: 'info' 
      });
    }, 300);
  };

  const renderHiddenShareCard = () => {
    if (!shareData) return null;
    return (
      <View style={styles.hiddenShareContainer} collapsable={false}>
        <View ref={shareCardRef} style={styles.storyCard} collapsable={false}>
          <LinearGradient
            colors={['#0B0D17', '#1E293B']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={{ position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: Colors.primary, opacity: 0.2, top: '20%' }} />
          
          <View style={styles.storyContent}>
            <View style={styles.storyHeader}>
               <Image source={{ uri: shareData.author.avatar }} style={styles.storyAvatar} />
               <View>
                 <Text style={styles.storyAuthorName}>{shareData.author.name}</Text>
                 <Text style={styles.storyAuthorHandle}>{shareData.author.handle}</Text>
               </View>
            </View>
            {shareData.content ? <Text style={styles.storyText}>{shareData.content}</Text> : null}
            {renderMedia(shareData.mediaType as any, shareData.mediaData)}
          </View>
          <View style={styles.storyFooter}>
            <Text style={styles.storyBrand}>HOP<Text style={{color: Colors.primaryLight}}>ON</Text></Text>
          </View>
        </View>
      </View>
    );
  };

  if (variant === 'detail') {
    const isLiked = likedPosts[post.id];
    const isReposted = repostedPosts[post.id];
    const likesCount = (post.likes || 0) + (isLiked ? 1 : 0);
    const repostsCount = (post.reposts || 0) + (isReposted ? 1 : 0);

    return (
      <View style={styles.detailContainer} ref={el => { postRefs.current[post.id] = el; }} collapsable={false}>
        {post.repostedBy && (
          <View style={styles.repostHeader}>
            <Ionicons name="repeat" size={16} color={Colors.textMuted} />
            <Text style={styles.repostText}>
              {profile?.uid === post.repostedBy.uid ? 'You reposted' : `${post.repostedBy.name} reposted`}
            </Text>
          </View>
        )}
        <View style={styles.detailHeader}>
          <Image source={{ uri: author.avatar }} style={styles.avatar} />
          <View style={styles.detailAuthorInfo}>
            <Text style={styles.authorName}>{author.name}</Text>
            <Text style={styles.authorHandle}>{author.handle}</Text>
          </View>
            <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => handlePostOptions(post)}>
              <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
        </View>

        {content ? <Text style={styles.detailBodyText}>{content}</Text> : null}
        
        {renderMedia(mediaType as any, mediaData)}

        <View style={styles.detailTimestampRow}>
          <Text style={styles.timestamp}>{timestamp} • HopON Web</Text>
        </View>

        <View style={styles.detailStatsRow}>
          <Text style={styles.statText}><Text style={styles.statNumber}>{repostsCount}</Text> Reposts</Text>
          <Text style={styles.statText}><Text style={styles.statNumber}>{post.comments || 0}</Text> Quotes</Text>
          <Text style={styles.statText}><Text style={styles.statNumber}>{likesCount}</Text> Likes</Text>
        </View>

        <View style={styles.detailActionBar}>
          <TouchableOpacity style={styles.actionIcon} onPress={() => handleComment(post)}>
            <Ionicons name="chatbubble-outline" size={24} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon} onPress={() => handleRepost(post.id)}>
            <Ionicons name="repeat-outline" size={26} color={isReposted ? Colors.success : Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon} onPress={() => handleLike(post.id)}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? Colors.error : Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon} onPress={() => handleShare(post.id, post)}>
            <Ionicons name="arrow-redo-outline" size={24} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
        {renderHiddenShareCard()}
      </View>
    );
  }

  // --- Feed Variant Below ---

  const renderSinglePost = (p: FeedPostData, isLast: boolean, isThreadChild = false) => {
    const isLiked = likedPosts[p.id];
    const isReposted = repostedPosts[p.id];
    const likesCount = (p.likes || 0) + (isLiked ? 1 : 0);
    const repostsCount = (p.reposts || 0) + (isReposted ? 1 : 0);

    return (
      <View key={p.id} style={[styles.singlePostRow, isThreadChild && { marginTop: Spacing.md }]} ref={el => { postRefs.current[p.id] = el; }} collapsable={false}>
        <View style={styles.leftCol}>
          <Image source={{ uri: p.author.avatar }} style={styles.avatar} />
          {/* Thread line for flat author continuations */}
          {!isLast && <View style={styles.threadLine} />}
        </View>

        <View style={styles.postContent}>
          {p.repostedBy && !isThreadChild && (
            <View style={styles.repostHeaderFeed}>
              <Ionicons name="repeat" size={14} color={Colors.textMuted} />
              <Text style={styles.repostText}>
                {profile?.uid === p.repostedBy.uid ? 'You reposted' : `${p.repostedBy.name} reposted`}
              </Text>
            </View>
          )}
          <View style={styles.headerRow}>
            <Text style={styles.authorName}>{p.author.name}</Text>
            <Text style={styles.authorHandle}>{p.author.handle}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.timestamp}>{p.timestamp}</Text>
            <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => handlePostOptions(p)}>
              <Ionicons name="ellipsis-horizontal" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {p.content ? <Text style={styles.bodyText}>{p.content}</Text> : null}

          {renderMedia(p.mediaType as any, p.mediaData)}

          <View style={styles.actionBar}>
            <TouchableOpacity style={styles.actionIcon} onPress={() => handleComment(p)}>
              <Ionicons name="chatbubble-outline" size={18} color={Colors.textMuted} />
              <Text style={styles.actionCount}>{p.comments || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon} onPress={() => handleRepost(p.id)}>
              <Ionicons name="repeat-outline" size={20} color={isReposted ? Colors.success : Colors.textMuted} />
              <Text style={[styles.actionCount, isReposted && { color: Colors.success }]}>{repostsCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon} onPress={() => handleLike(p.id)}>
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? Colors.error : Colors.textMuted} />
              <Text style={[styles.actionCount, isLiked && { color: Colors.error }]}>{likesCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon} onPress={() => handleShare(p.id, p)}>
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

      {/* Sleek Minimal Options Modal */}
      <Modal visible={!!selectedPostOptions} animationType="fade" transparent={true} onRequestClose={() => setSelectedPostOptions(null)}>
        <TouchableOpacity style={styles.optionsOverlay} activeOpacity={1} onPress={() => setSelectedPostOptions(null)}>
          <View style={styles.optionsSheet}>
            <View style={styles.optionsHandle} />
            <TouchableOpacity style={styles.optionRow} onPress={executePostOption}>
              <Ionicons name={(selectedPostOptions && profile && selectedPostOptions.author.handle === `@${profile.nickname.toLowerCase().replace(/\s+/g, '')}`) ? "trash-outline" : "eye-off-outline"} size={22} color={Colors.error} />
              <Text style={styles.optionTextError}>{(selectedPostOptions && profile && selectedPostOptions.author.handle === `@${profile.nickname.toLowerCase().replace(/\s+/g, '')}`) ? 'Delete Post' : 'Hide Post'}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {renderHiddenShareCard()}
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: { 
    flexDirection: 'column', 
    paddingVertical: Spacing.md, 
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.border 
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
  repostHeaderFeed: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  repostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 6,
  },
  repostText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
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
  gameCardCol: { backgroundColor: Colors.surfaceAlt, borderRadius: BorderRadius.md, overflow: 'hidden', marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  songCard: { flexDirection: 'row', backgroundColor: Colors.surfaceAlt, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  mediaCover: { width: 80, height: 120, backgroundColor: Colors.border },
  gameCoverLarge: { width: '100%', height: 160, backgroundColor: Colors.border },
  songCover: { width: 48, height: 48, borderRadius: BorderRadius.sm, backgroundColor: Colors.border, marginRight: Spacing.md },
  mediaInfo: { flex: 1, padding: Spacing.md, justifyContent: 'center' },
  gameInfoCol: { padding: Spacing.md, paddingTop: Spacing.sm },
  mediaTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  mediaSubtitle: { color: Colors.textMuted, fontSize: 13 },
  songTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: 'bold' },
  songArtist: { color: Colors.textMuted, fontSize: 12 },
  actionBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginRight: Spacing.xl },
  actionIcon: { flexDirection: 'row', alignItems: 'center' },
  actionCount: { color: Colors.textMuted, marginLeft: 6, fontSize: 12, fontWeight: '600' },
  hiddenShareContainer: {
    position: 'absolute',
    left: -10000,
    top: 0,
  },
  storyCard: {
    width: 540,
    height: 960,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  storyContent: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 24,
    padding: 30,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  storyAuthorName: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  storyAuthorHandle: {
    color: '#94A3B8',
    fontSize: 16,
  },
  storyText: {
    color: '#FFF',
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 20,
  },
  storyFooter: {
    position: 'absolute',
    bottom: 40,
  },
  storyBrand: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionsSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 32,
    paddingTop: 10,
  },
  optionsHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)', // subtle red border
  },
  optionTextError: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: Spacing.md,
  },
});
