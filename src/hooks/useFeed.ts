import { useState, useEffect } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { subscribeToFeed, createPost as createPostService } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import type { FeedPostData, Post } from '../types';

const DUMMY_POSTS: FeedPostData[] = [
  {
    id: '1',
    author: {
      name: 'Alex Mercer',
      handle: '@alexm_gaming',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    },
    timestamp: '2h',
    content: 'This new OST is absolutely carrying my ranked climb tonight. 🔥',
    mediaType: 'song',
    mediaData: {
      title: 'Cybernetic Awakening',
      artist: 'Synthwave Collective',
      albumArt: 'https://i.scdn.co/image/ab67616d0000b273b5df5b5e3240e4f8d227b2b8',
    },
    likes: 142,
    comments: 24,
    reposts: 5,
  },
  {
    id: '2',
    author: {
      name: 'Sarah K.',
      handle: '@sarah_weeb',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
    },
    timestamp: '4h',
    content: 'Just finished the season finale. The animation in this fight scene was INSANE! ✨⚔️',
    mediaType: 'meme',
    mediaData: {
      url: 'https://images.unsplash.com/photo-1542451313056-b7c8e626645f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    likes: 1200,
    comments: 89,
    reposts: 12,
  },
];

export function useFeed() {
  const [posts, setPosts] = useState<FeedPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    const unsubscribe = subscribeToFeed((livePosts: Post[]) => {
      const formattedPosts: FeedPostData[] = livePosts.map((post) => {
        let timeString = 'Just now';
        if (post.timestamp) {
          const diffSeconds = Math.floor(
            (new Date().getTime() - post.timestamp.toDate().getTime()) / 1000,
          );
          if (diffSeconds < 60) timeString = 'Just now';
          else if (diffSeconds < 3600) timeString = `${Math.floor(diffSeconds / 60)}m`;
          else timeString = `${Math.floor(diffSeconds / 3600)}h`;
        }

        return {
          id: post.id,
          author: {
            name: post.authorName,
            handle: post.authorHandle,
            avatar: post.authorAvatar,
          },
          content: post.content,
          timestamp: timeString,
          likes: post.likes || 0,
          comments: post.comments || 0,
          reposts: post.reposts || 0,
          mediaType: post.mediaType,
          mediaData: post.mediaData,
        };
      });

      setPosts(formattedPosts.length > 0 ? formattedPosts : DUMMY_POSTS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const publishPost = async (content: string) => {
    if (!content.trim() || !profile) return;
    setIsPosting(true);
    try {
      await createPostService({
        authorId: profile.uid || 'unknown',
        authorName: profile.nickname,
        authorHandle: `@${profile.nickname.toLowerCase().replace(/\s+/g, '')}`,
        authorAvatar: profile.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704z',
        content: content.trim(),
        timestamp: serverTimestamp(),
      });
    } finally {
      setIsPosting(false);
    }
  };

  return { posts, loading, isPosting, publishPost };
}
