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
  {
    id: '3',
    author: {
      name: 'Viper',
      handle: '@viper_strike',
      avatar: 'https://i.pravatar.cc/150?u=v',
    },
    timestamp: '5h',
    content: 'Just dropped a 40 bomb in Ascendant lobby. Let me tell you how.',
    likes: 450,
    comments: 12,
    reposts: 8,
    thread: [
      {
        id: '3-1',
        author: {
          name: 'Viper',
          handle: '@viper_strike',
          avatar: 'https://i.pravatar.cc/150?u=v',
        },
        timestamp: '5h',
        content: 'First off, map control is everything. If you don\'t have mid, you don\'t have the game.',
        likes: 310,
        comments: 4,
        reposts: 2,
      },
      {
        id: '3-2',
        author: {
          name: 'Viper',
          handle: '@viper_strike',
          avatar: 'https://i.pravatar.cc/150?u=v',
        },
        timestamp: '5h',
        content: 'Second, stop forcing every round! Play the eco, save for the OP.',
        likes: 540,
        comments: 20,
        reposts: 15,
      }
    ]
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
          };
        };

        return mapPost(post);
      });

      setPosts(formattedPosts.length > 0 ? formattedPosts : DUMMY_POSTS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const publishPost = async (contents: string[], attachedMediaType?: string, attachedMedia?: any) => {
    const validContents = contents.map(c => c.trim()).filter(c => c.length > 0);
    if (validContents.length === 0 || !profile) return;
    setIsPosting(true);
    
    // For mock thread purposes, map the rest of the contents to a thread array
    const thread = validContents.slice(1).map((content, i) => ({
      id: `temp-${Date.now()}-${i}`,
      authorId: profile.uid || 'unknown',
      authorName: profile.nickname,
      authorHandle: `@${profile.nickname.toLowerCase().replace(/\s+/g, '')}`,
      authorAvatar: profile.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704z',
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
        authorAvatar: profile.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704z',
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
