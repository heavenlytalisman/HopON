import { auth, db } from '../config/firebase';
import { signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import {
  doc, setDoc, getDoc, collection, addDoc, updateDoc, deleteDoc, increment,
  arrayUnion, arrayRemove, getDocs, query, where, onSnapshot, orderBy,
  serverTimestamp, Unsubscribe,
} from 'firebase/firestore';
import type { User, Group, Post } from '../types';

const stripUndefined = (obj: any) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] === undefined) {
      delete newObj[key];
    } else if (newObj[key] !== null && typeof newObj[key] === 'object' && newObj[key].constructor?.name === 'Object') {
      const nested = { ...newObj[key] };
      Object.keys(nested).forEach(nKey => {
        if (nested[nKey] === undefined) delete nested[nKey];
      });
      newObj[key] = nested;
    }
  });
  return newObj;
};

// ──────────────────────────────────────────────
// Auth Services
// ──────────────────────────────────────────────

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in with email: ', error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string, handle: string, nickname: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      nickname: nickname,
      handle: handle,
      createdAt: new Date(),
    }, { merge: true });

    return user;
  } catch (error) {
    console.error('Error registering with email: ', error);
    throw error;
  }
};

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
      ...stripUndefined(data),
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
      ownerId: creatorUid,
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

export const removeMemberFromGroup = async (groupId: string, userUid: string): Promise<boolean> => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      members: arrayRemove(userUid),
    });
    return true;
  } catch (error) {
    console.error('Error removing member from group: ', error);
    return false;
  }
};

export const getGroup = async (groupId: string): Promise<Group | null> => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (groupDoc.exists()) {
      return { id: groupDoc.id, ...groupDoc.data() } as Group;
    }
    return null;
  } catch (error) {
    console.error('Error fetching group: ', error);
    return null;
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

export const sendMessage = async (groupId: string, messageData: any): Promise<boolean> => {
  try {
    await addDoc(collection(db, 'groups', groupId, 'messages'), {
      ...stripUndefined(messageData),
      timestamp: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
};

export const subscribeToGroupMessages = (groupId: string, callback: (messages: any[]) => void): Unsubscribe => {
  const q = query(collection(db, 'groups', groupId, 'messages'), orderBy('timestamp', 'asc'));
  return onSnapshot(q, (querySnapshot) => {
    const messages: any[] = [];
    querySnapshot.forEach((docSnap) => {
      messages.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(messages);
  }, (error: any) => {
    if (error.code !== 'permission-denied') {
      console.warn("subscribeToGroupMessages error:", error);
    }
  });
};

export const subscribeToGroupDetails = (groupId: string, callback: (details: Group) => void): Unsubscribe => {
  const groupRef = doc(db, 'groups', groupId);
  return onSnapshot(groupRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as Group);
    }
  }, (error: any) => {
    if (error.code !== 'permission-denied') {
      console.warn("subscribeToGroupDetails error:", error);
    }
  });
};

export const updateGroupDetails = async (groupId: string, data: Partial<Group>): Promise<boolean> => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, stripUndefined(data));
    return true;
  } catch (error) {
    console.error('Error updating group details:', error);
    return false;
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
    if (senderId === receiverId) return false;

    // Deterministic ID to prevent duplicate requests
    const requestId = `${senderId}_${receiverId}`;
    const reqRef = doc(db, 'friend_requests', requestId);
    
    // Check if already requested
    const docSnap = await getDoc(reqRef);
    if (docSnap.exists() && docSnap.data().status !== 'rejected') {
      return true; // Already pending or accepted
    }

    await setDoc(reqRef, {
      senderId,
      receiverId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    // Create a notification for the receiver so they actually see the request
    await createNotification(receiverId, {
      type: 'friend_request',
      title: 'New Friend Request',
      body: 'Someone wants to connect!',
      data: {
        senderId,
        requestId,
      }
    });

    console.log('Friend request sent from', senderId, 'to', receiverId);
    return true;
  } catch (error) {
    console.error('Error sending friend request: ', error);
    return false;
  }
};

export const acceptFriendRequest = async (requestId: string, user1Id: string, user2Id: string): Promise<boolean> => {
  try {
    const reqRef = doc(db, 'friend_requests', requestId);
    await updateDoc(reqRef, { status: 'accepted' });
    
    // Deterministic friendship ID to prevent duplicate friendships
    const minId = user1Id < user2Id ? user1Id : user2Id;
    const maxId = user1Id > user2Id ? user1Id : user2Id;
    const friendshipId = `${minId}_${maxId}`;
    
    await setDoc(doc(db, 'friendships', friendshipId), {
      user1Id: minId,
      user2Id: maxId,
      createdAt: new Date().toISOString()
    }, { merge: true });

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
      ...stripUndefined(data),
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
  }, (error: any) => {
    if (error.code !== 'permission-denied') {
      console.error("Firestore notification subscribe error:", error);
    }
    if (onError) onError(error);
  });
};

export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    return true;
  } catch (error) {
    console.error('Error deleting notification: ', error);
    return false;
  }
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
  }, (error: any) => {
    if (error.code !== 'permission-denied') {
      console.warn("subscribeToFeed error:", error);
    }
  });
};

export const updateUserPresence = async (userId: string, isOnline: boolean): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isOnline: isOnline,
      lastSeen: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating presence: ', error);
    return false;
  }
};

export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    return true;
  } catch (error) {
    console.error('Error deleting post: ', error);
    return false;
  }
};

export const incrementRepost = async (postId: string): Promise<boolean> => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      reposts: increment(1)
    });
    return true;
  } catch (error) {
    console.error('Error incrementing reposts: ', error);
    return false;
  }
};

export const togglePostLike = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    if (!postDoc.exists()) return false;
    
    const data = postDoc.data();
    const likedBy: string[] = data.likedBy || [];
    const isLiked = likedBy.includes(userId);
    
    if (isLiked) {
      await updateDoc(postRef, {
        likedBy: arrayRemove(userId),
        likes: increment(-1)
      });
    } else {
      await updateDoc(postRef, {
        likedBy: arrayUnion(userId),
        likes: increment(1)
      });
    }
    return true;
  } catch (error) {
    console.error('Error toggling like:', error);
    return false;
  }
};

export const addReplyToPost = async (postId: string, replyData: any): Promise<boolean> => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      replies: arrayUnion({
        id: Math.random().toString(36).substr(2, 9),
        ...stripUndefined(replyData),
        timestamp: new Date().toISOString(),
      }),
      comments: increment(1)
    });
    return true;
  } catch (error) {
    console.error('Error adding reply:', error);
    return false;
  }
};

// ──────────────────────────────────────────────
// HopOn Room Services
// ──────────────────────────────────────────────

export const joinHopOnRoom = async (squadId: string, userUid: string): Promise<boolean> => {
  try {
    const roomRef = doc(db, 'active_rooms', squadId);
    // Use setDoc with merge to create the document if it doesn't exist
    await setDoc(roomRef, {
      activeMembers: arrayUnion(userUid),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error joining HopOn room: ', error);
    return false;
  }
};

export const leaveHopOnRoom = async (squadId: string, userUid: string): Promise<boolean> => {
  try {
    const roomRef = doc(db, 'active_rooms', squadId);
    await updateDoc(roomRef, {
      activeMembers: arrayRemove(userUid),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error leaving HopOn room: ', error);
    return false;
  }
};

export const subscribeToHopOnRoom = (squadId: string, callback: (activeMembers: User[]) => void): Unsubscribe => {
  const roomRef = doc(db, 'active_rooms', squadId);
  return onSnapshot(roomRef, async (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const memberUids: string[] = data.activeMembers || [];
      
      // Fetch user profiles for all active members
      const activeUsers: User[] = [];
      for (const uid of memberUids) {
        const userProfile = await getUserProfile(uid);
        if (userProfile) {
          activeUsers.push({ ...userProfile, id: uid } as User & { id: string });
        }
      }
      callback(activeUsers);
    } else {
      callback([]);
    }
  }, (error: any) => {
    if (error.code !== 'permission-denied') {
      console.error('Error subscribing to HopOn room:', error);
    }
  });
};
