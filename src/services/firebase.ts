import { auth, db } from '../config/firebase';
import { signInAnonymously } from 'firebase/auth';
import {
  doc, setDoc, getDoc, collection, addDoc, updateDoc,
  arrayUnion, getDocs, query, where, onSnapshot, orderBy,
  serverTimestamp, Unsubscribe,
} from 'firebase/firestore';
import type { User, Group, Post } from '../types';

// ──────────────────────────────────────────────
// Auth Services
// ──────────────────────────────────────────────

export const loginAnonymously = async (nickname: string) => {
  try {
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      nickname: nickname,
      createdAt: new Date(),
    }, { merge: true });

    return user;
  } catch (error) {
    console.error('Error signing in anonymously: ', error);
    throw error;
  }
};

// ──────────────────────────────────────────────
// Profile Services
// ──────────────────────────────────────────────

const ensureAvatar = (user: User): User => {
  if (!user.avatar) {
    user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nickname || 'User')}&background=1E293B&color=FFF`;
  }
  return user;
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return ensureAvatar(userDoc.data() as User);
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

export const updateUserPushToken = async (userId: string, token: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pushToken: token,
      updatedAt: new Date().toISOString(),
    });
    console.log('Push token saved to Firestore for user:', userId);
  } catch (error) {
    console.error('Error saving push token:', error);
  }
};

// ──────────────────────────────────────────────
// Group / Squad Services
// ──────────────────────────────────────────────

export const createGroup = async (groupName: string, creatorUid: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'groups'), {
      name: groupName,
      members: [creatorUid],
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating group: ', error);
    throw error;
  }
};

export const joinGroup = async (groupId: string, userUid: string): Promise<boolean> => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(userUid),
    });
    return true;
  } catch (error) {
    console.error('Error joining group: ', error);
    throw error;
  }
};

export const getUserGroups = async (userUid: string): Promise<Group[]> => {
  try {
    const q = query(collection(db, 'groups'), where('members', 'array-contains', userUid));
    const querySnapshot = await getDocs(q);
    const groups: Group[] = [];
    querySnapshot.forEach((docSnap) => {
      groups.push({ id: docSnap.id, ...docSnap.data() } as Group);
    });
    return groups;
  } catch (error) {
    console.error('Error fetching user groups: ', error);
    throw error;
  }
};

export const getGroupMemberTokens = async (groupId: string, excludeUid: string): Promise<string[]> => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) return [];

    const members: string[] = groupDoc.data().members || [];
    const tokens: string[] = [];

    for (const memberUid of members) {
      if (memberUid === excludeUid) continue;
      const userDoc = await getDoc(doc(db, 'users', memberUid));
      if (userDoc.exists() && userDoc.data().pushToken) {
        tokens.push(userDoc.data().pushToken);
      }
    }
    return tokens;
  } catch (error) {
    console.error('Error fetching member tokens: ', error);
    return [];
  }
};

// ──────────────────────────────────────────────
// Social Services
// ──────────────────────────────────────────────

export const searchUsersByHandle = async (handleQuery: string): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('nickname', '>=', handleQuery),
      where('nickname', '<=', handleQuery + '\uf8ff'),
    );

    const querySnapshot = await getDocs(q);
    const results: (User & { id: string })[] = [];
    querySnapshot.forEach((docSnap) => {
      results.push(ensureAvatar({ id: docSnap.id, ...docSnap.data() } as User & { id: string }) as User & { id: string });
    });

    return results;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

export const sendFriendRequest = async (senderId: string, receiverId: string): Promise<boolean> => {
  try {
    const friendRequestsRef = collection(db, 'friend_requests');
    await addDoc(friendRequestsRef, {
      senderId,
      receiverId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    console.log('Friend request sent from', senderId, 'to', receiverId);
    return true;
  } catch (error) {
    console.error('Error sending friend request:', error);
    return false;
  }
};

export const acceptFriendRequest = async (requestId: string, user1Id: string, user2Id: string): Promise<boolean> => {
  try {
    const reqRef = doc(db, 'friend_requests', requestId);
    await updateDoc(reqRef, { status: 'accepted' });
    
    await addDoc(collection(db, 'friendships'), {
      user1Id: user1Id < user2Id ? user1Id : user2Id,
      user2Id: user1Id > user2Id ? user1Id : user2Id,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return false;
  }
};

export const getFriends = async (userId: string): Promise<User[]> => {
  try {
    // Query where user1Id == userId
    const q1 = query(collection(db, 'friendships'), where('user1Id', '==', userId));
    const snap1 = await getDocs(q1);
    
    // Query where user2Id == userId
    const q2 = query(collection(db, 'friendships'), where('user2Id', '==', userId));
    const snap2 = await getDocs(q2);
    
    const friendIds = new Set<string>();
    snap1.forEach(doc => friendIds.add(doc.data().user2Id));
    snap2.forEach(doc => friendIds.add(doc.data().user1Id));
    
    const friends: User[] = [];
    for (const id of Array.from(friendIds)) {
      const userDoc = await getUserProfile(id);
      if (userDoc) {
        friends.push({ ...userDoc, id } as User & { id: string });
      }
    }
    return friends;
  } catch (error) {
    console.error('Error getting friends:', error);
    return [];
  }
};

// ──────────────────────────────────────────────
// Notification Services
// ──────────────────────────────────────────────

export const createNotification = async (userId: string, data: any): Promise<boolean> => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      ...data,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

export const subscribeToNotifications = (userId: string, callback: (notifications: any[]) => void, onError?: (error: any) => void): Unsubscribe => {
  const q = query(
    collection(db, 'notifications'), 
    where('userId', '==', userId), 
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (querySnapshot) => {
    const notifs: any[] = [];
    querySnapshot.forEach((docSnap) => {
      notifs.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(notifs);
  }, (error) => {
    console.error("Firestore notification subscribe error:", error);
    if (onError) onError(error);
  });
};

// ──────────────────────────────────────────────
// Feed Services
// ──────────────────────────────────────────────

export const createPost = async (postData: Omit<Post, 'id' | 'likes' | 'comments' | 'reposts'>): Promise<string> => {
  try {
    const payload: any = {
      ...postData,
      likes: 0,
      comments: 0,
      reposts: 0,
    };

    // Firebase rejects any undefined values, so we must strip them out
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    if (payload.mediaData && typeof payload.mediaData === 'object') {
      Object.keys(payload.mediaData).forEach(key => {
        if (payload.mediaData[key] === undefined) {
          delete payload.mediaData[key];
        }
      });
    }

    const docRef = await addDoc(collection(db, 'posts'), payload);
    return docRef.id;
  } catch (error) {
    console.error('Error creating post: ', error);
    throw error;
  }
};

export const subscribeToFeed = (callback: (posts: Post[]) => void): Unsubscribe => {
  const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const posts: Post[] = [];
    querySnapshot.forEach((docSnap) => {
      const post = { id: docSnap.id, ...docSnap.data() } as Post;
      if (!post.authorAvatar) {
        post.authorAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName || 'User')}&background=1E293B&color=FFF`;
      }
      posts.push(post);
    });
    callback(posts);
  });
};
