import { useState, useEffect } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { subscribeToFeed, createPost as createPostService, togglePostLike, addReplyToPost } from '../services/firebase';
import { uploadToCloudinary } from '../services/cloudinary';
import { useAuth } from '../context/AuthContext';
import type { FeedPostData, Post } from '../types';



export function useFeed() {
  const [posts, setPosts] = useState<FeedPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToFeed((livePosts: Post[]) => {
      const formattedPosts: FeedPostData[] = livePosts.map((post) => {
        const mapPost = (p: Post | FeedPostData): FeedPostData => {
          let timeString = 'Just now';
          if (p.timestamp && (p as any).timestamp.toDate) {
            const diffSeconds = Math.floor(
              (new Date().getTime() - (p as any).timestamp.toDate().getTime()) / 1000,
            );
            if (diffSeconds < 60) timeString = 'Just now';
            else if (diffSeconds < 3600) timeString = `${Math.floor(diffSeconds / 60)}m`;
            else timeString = `${Math.floor(diffSeconds / 3600)}h`;
          } else if (typeof p.timestamp === 'string') {
            timeString = p.timestamp;
          }

          return {
            id: p.id,
            author: (p as FeedPostData).author || {
              id: (p as Post).authorId,
              name: (p as Post).authorName,
              handle: (p as Post).authorHandle,
              avatar: (p as Post).authorAvatar,
            },
            content: p.content,
            timestamp: timeString,
            likes: p.likes || 0,
            comments: p.comments || 0,
            reposts: p.reposts || 0,
            mediaType: p.mediaType,
            mediaData: p.mediaData,
            thread: p.thread ? p.thread.map(mapPost) : undefined,
            replies: p.replies ? p.replies.map(mapPost) : undefined,
            likedBy: p.likedBy || [],
            repostedBy: p.repostedBy,
          };
        };

        return mapPost(post);
      });

      setPosts(formattedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const publishPost = async (contents: string[], attachedMediaType?: string, attachedMedia?: any) => {
    const validContents = contents.map(c => c.trim()).filter(c => c.length > 0);
    if (validContents.length === 0 || !profile) return;
    setIsPosting(true);
    
    // Map the rest of the contents to a thread array if the user posts a multi-part thread
    const thread = validContents.slice(1).map((content, i) => ({
      id: `temp-${Date.now()}-${i}`,
      authorId: profile.uid || 'unknown',
      authorName: profile.nickname,
      authorHandle: `@${profile.nickname.toLowerCase().replace(/\s+/g, '')}`,
      authorAvatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nickname)}&background=7C3AED&color=FFF&size=150`,
      content: content,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      reposts: 0,
    }));

    try {
      let finalMediaData = attachedMedia ? { ...attachedMedia } : undefined;

      // Detect local file URIs and upload to Cloudinary
      if (finalMediaData && finalMediaData.url && finalMediaData.url.startsWith('file://')) {
        const downloadUrl = await uploadToCloudinary(finalMediaData.url);
        finalMediaData.url = downloadUrl;
      }

      await createPostService({
        authorId: profile.uid || 'unknown',
        authorName: profile.nickname,
        authorHandle: `@${profile.nickname.toLowerCase().replace(/\s+/g, '')}`,
        authorAvatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nickname)}&background=7C3AED&color=FFF&size=150`,
        content: validContents[0],
        timestamp: serverTimestamp(),
        thread: thread.length > 0 ? thread : undefined,
        mediaType: attachedMediaType as any,
        mediaData: finalMediaData,
      });
    } finally {
      setIsPosting(false);
    }
  };

  const likePost = async (postId: string) => {
    if (!profile?.uid) return;
    try {
      await togglePostLike(postId, profile.uid);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const replyToPost = async (postId: string, content: string) => {
    if (!profile?.uid || !content.trim()) return;
    try {
      await addReplyToPost(postId, {
        authorId: profile.uid,
        authorName: profile.nickname,
        authorHandle: `@${profile.nickname.toLowerCase().replace(/\s+/g, '')}`,
        authorAvatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nickname)}&background=7C3AED&color=FFF`,
        content: content.trim(),
        timestamp: serverTimestamp(),
      } as any);
    } catch (error) {
      console.error('Error replying to post:', error);
    }
  };

  return { posts, loading, isPosting, publishPost, likePost, replyToPost };
}
