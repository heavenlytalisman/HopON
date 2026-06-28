import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// ──────────────────────────────────────────────
// Firestore Document Types
// ──────────────────────────────────────────────

export interface User {
  id?: string;
  uid: string;
  nickname: string;
  handle?: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  pushToken?: string;
  followers?: string[];
  following?: string[];
  createdAt: Date | string;
  updatedAt?: string;
}

export interface Group {
  id: string;
  name: string;
  avatar?: string;
  wallpaper?: string;
  ringtone?: string;
  members: string[];
  ownerId?: string;
  memberAvatars?: string[];
  createdAt?: Date | string;
  // UI-only fields for mock data
  online?: number;
  readOnly?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  timestamp: any; // Firestore Timestamp or serverTimestamp sentinel
  likes: number;
  comments: number;
  reposts: number;
  mediaType?: 'meme' | 'anime' | 'movie' | 'song' | 'game';
  mediaData?: MediaData;
  thread?: Post[];
  replies?: Post[];
  likedBy?: string[];
  repostedBy?: {
    name: string;
    handle: string;
    uid?: string;
  };
}

export type MediaData = {
  url?: string;      // meme
  cover?: string;    // anime
  poster?: string;   // movie
  albumArt?: string; // song
  title?: string;
  artist?: string;
  rating?: number;
};

export interface FeedPostData {
  id: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  reposts: number;
  mediaType?: 'meme' | 'anime' | 'movie' | 'song' | 'game';
  mediaData?: MediaData;
  thread?: FeedPostData[]; // For flat author continuations
  replies?: FeedPostData[]; // For nested child comments
  likedBy?: string[];
  repostedBy?: {
    name: string;
    handle: string;
    uid?: string;
  };
}

export interface FriendRequest {
  id?: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface NotificationRequest {
  token: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  status: 'pending' | 'completed' | 'failed';
  createdAt: any;
}

export interface SquadMember {
  id: string;
  name: string;
  status: 'accepted' | 'pending' | 'denied';
  avatar: string;
}

export interface CallerInfo {
  squadId?: string;
  squadName: string;
  callerName: string;
  avatar: string;
  squadWallpaper?: string;
}

export interface Friend {
  id: string;
  name?: string;
  nickname?: string;
  handle?: string;
  avatar?: string;
  isOnline?: boolean;
}

// ──────────────────────────────────────────────
// Navigation Types
// ──────────────────────────────────────────────

export type RootStackParamList = {
  Login: undefined;
  EmailLogin: undefined;
  Register: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Profile: undefined;
  SquadDetail: { squadId: string; squadName: string; squadAvatar?: string; squadWallpaper?: string; wallpaperOpacity?: number };
  SquadEdit: { squadId: string; squadName: string; squadAvatar?: string; squadWallpaper?: string; wallpaperOpacity?: number };
  SquadSettings: { squadId: string; squadName: string; squadAvatar?: string };
  SquadWallpaper: { squadId: string; squadWallpaper?: string; wallpaperOpacity?: number };
  CreateSquad: undefined;
  HopOnRoom: { squadId: string; squadName: string; squadWallpaper?: string };
  IncomingAlert: { caller?: CallerInfo } | undefined;
  QuickSquadSelect: undefined;
  FriendProfile: { friendId: string; friendName: string; friendAvatar: string };
  FriendList: undefined;
  FollowList: { type: 'followers' | 'following'; userId?: string; userName?: string };
  Notifications: undefined;
  PostDetail: { postId: string; postData?: any };
  RecentActivity: undefined;
  QRScanner: undefined;
  SearchUsers: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Squads: undefined;
  HopOnAction: undefined;
  Feed: undefined;
  Profile: undefined;
};

// Screen props helpers
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;
