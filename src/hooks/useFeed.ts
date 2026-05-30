import { useState, useEffect } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { subscribeToFeed, createPost as createPostService } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import type { FeedPostData, Post } from '../types';



export function useFeed() {
  const [posts, setPosts] = useState<FeedPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
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
            repostedBy: p.repostedBy,
          };
        };

        return mapPost(post);
      });

      setPosts(formattedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      timestamp: serverTimestamp(),
      likes: 0,
      comments: 0,
      reposts: 0,
    }));

    try {
      await createPostService({
        authorId: profile.uid || 'unknown',
        authorName: profile.nickname,
        authorHandle: `@${profile.nickname.toLowerCase().replace(/\s+/g, '')}`,
        authorAvatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nickname)}&background=7C3AED&color=FFF&size=150`,
        content: validContents[0],
        timestamp: serverTimestamp(),
        thread: thread.length > 0 ? thread : undefined,
        mediaType: attachedMediaType as any,
        mediaData: attachedMedia ? attachedMedia : undefined,
      });
    } finally {
      setIsPosting(false);
    }
  };

  return { posts, loading, isPosting, publishPost };
}
