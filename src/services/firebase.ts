import { auth, db } from '../config/firebase';
import { signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import {
  doc, setDoc, getDoc, collection, addDoc, updateDoc, deleteDoc, increment,
  arrayUnion, arrayRemove, getDocs, query, where, onSnapshot, orderBy,
  serverTimestamp, Unsubscribe,
} from 'firebase/firestore';
import type { User, Group, Post } from '../types';
import { sendPushNotification } from './notifications';

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
      handle: (nickname || 'guest').toLowerCase().replace(/\s+/g, ''), // Guest handle
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
      return ensureAvatar({ id: userDoc.id, ...userDoc.data() } as User);
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const subscribeToUserProfile = (userId: string, callback: (profile: User | null) => void): import('firebase/firestore').Unsubscribe => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(ensureAvatar({ id: docSnap.id, ...docSnap.data() } as User));
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error subscribing to user profile:', error);
    callback(null);
  });
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

export const subscribeToUserGroups = (userUid: string, callback: (groups: Group[]) => void): import('firebase/firestore').Unsubscribe => {
  const q = query(collection(db, 'groups'), where('members', 'array-contains', userUid));
  return onSnapshot(q, (querySnapshot) => {
    const groups: Group[] = [];
    querySnapshot.forEach((docSnap) => {
      groups.push({ id: docSnap.id, ...docSnap.data() } as Group);
    });
    callback(groups);
  }, (error) => {
    console.error('Error subscribing to user groups: ', error);
    callback([]);
  });
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

export const deleteMessage = async (groupId: string, messageId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'groups', groupId, 'messages', messageId));
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
};

export const markMessageAsRead = async (groupId: string, messageId: string, userUid: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'groups', groupId, 'messages', messageId), {
      viewedBy: arrayUnion(userUid),
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
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

export const checkHandleAvailability = async (handleToCheck: string, excludeUid?: string): Promise<boolean> => {
  try {
    const formattedHandle = handleToCheck.startsWith('@') ? handleToCheck : `@${handleToCheck}`;
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('handle', '==', formattedHandle));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return true; // No one has this handle
    }
    
    // If we're checking against our own handle, it's still "available" to us
    if (excludeUid) {
      let isAvailable = true;
      querySnapshot.forEach((docSnap) => {
        if (docSnap.id !== excludeUid && docSnap.data().uid !== excludeUid) {
          isAvailable = false;
        }
      });
      return isAvailable;
    }
    
    return false; // Taken by someone else
  } catch (error) {
    console.error('Error checking handle availability:', error);
    return false; // Default to not available on error to prevent overwrites
  }
};

export const searchUsersByHandle = async (searchQuery: string): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    
    // Ensure we only search by the unique username (handle)
    // Strip '@' if the user typed it, and convert to lowercase since handles are stored lowercase
    const cleanQuery = searchQuery.replace('@', '').trim().toLowerCase();
    
    const q = query(
      usersRef,
      where('handle', '>=', cleanQuery),
      where('handle', '<=', cleanQuery + '\uf8ff'),
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
    let docSnap;
    try {
      docSnap = await getDoc(reqRef);
    } catch (e: any) {
      // In our security rules, reading a non-existent document might throw permission-denied
      if (e.code === 'permission-denied') {
        docSnap = null;
      } else {
        throw e;
      }
    }
    
    if (docSnap && docSnap.exists() && docSnap.data().status !== 'rejected') {
      // Re-trigger the notification if it already exists so it gets the new UI payload
      const senderProfile = await getUserProfile(senderId);
      await createNotification(receiverId, {
        type: 'friend_request',
        title: senderProfile?.nickname || 'Someone',
        body: 'wants to connect with you!',
        data: {
          senderId,
          requestId,
          avatar: senderProfile?.avatar || '',
        }
      });
      const receiverProfile = await getUserProfile(receiverId);
      if (receiverProfile?.pushToken) {
        await sendPushNotification(
          receiverProfile.pushToken,
          'Friend Request',
          `${senderProfile?.nickname || 'Someone'} wants to connect!`,
          { route: 'Notifications' }
        );
      }
      return true; // Already pending or accepted
    }

    await setDoc(reqRef, {
      senderId,
      receiverId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    // Create a notification for the receiver so they actually see the request
    const senderProfile = await getUserProfile(senderId);
    await createNotification(receiverId, {
      type: 'friend_request',
      title: senderProfile?.nickname || 'Someone',
      body: 'wants to connect with you!',
      data: {
        senderId,
        requestId,
        avatar: senderProfile?.avatar || '',
      }
    });

    const receiverProfile = await getUserProfile(receiverId);
    if (receiverProfile?.pushToken) {
      await sendPushNotification(
        receiverProfile.pushToken,
        'Friend Request',
        `${senderProfile?.nickname || 'Someone'} wants to connect!`,
        { route: 'Notifications' }
      );
    }

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

    // Make them follow each other
    const user1Ref = doc(db, 'users', user1Id);
    const user2Ref = doc(db, 'users', user2Id);
    
    await updateDoc(user1Ref, {
      following: arrayUnion(user2Id),
      followers: arrayUnion(user2Id)
    });
    
    await updateDoc(user2Ref, {
      following: arrayUnion(user1Id),
      followers: arrayUnion(user1Id)
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

export const subscribeToFriends = (userId: string, callback: (friends: User[]) => void): (() => void) => {
  const q1 = query(collection(db, 'friendships'), where('user1Id', '==', userId));
  const q2 = query(collection(db, 'friendships'), where('user2Id', '==', userId));
  
  let snap1Docs: any[] = [];
  let snap2Docs: any[] = [];
  let unsub1: import('firebase/firestore').Unsubscribe | null = null;
  let unsub2: import('firebase/firestore').Unsubscribe | null = null;
  
  const updateFriends = async () => {
    try {
      const friendIds = new Set<string>();
      snap1Docs.forEach(doc => friendIds.add(doc.data().user2Id));
      snap2Docs.forEach(doc => friendIds.add(doc.data().user1Id));
      
      const friends: User[] = [];
      for (const id of Array.from(friendIds)) {
        const userDoc = await getUserProfile(id); // Static fetch of profile when list updates to save costs
        if (userDoc) {
          friends.push({ ...userDoc, id } as User & { id: string });
        }
      }
      callback(friends);
    } catch (error) {
      console.error('Error updating friends subscription:', error);
      callback([]);
    }
  };

  unsub1 = onSnapshot(q1, (snap) => {
    snap1Docs = snap.docs;
    updateFriends();
  });

  unsub2 = onSnapshot(q2, (snap) => {
    snap2Docs = snap.docs;
    updateFriends();
  });

  return () => {
    if (unsub1) unsub1();
    if (unsub2) unsub2();
  };
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
    where('userId', '==', userId)
  );
  return onSnapshot(q, (querySnapshot) => {
    const notifs: any[] = [];
    querySnapshot.forEach((docSnap) => {
      notifs.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sort locally to avoid needing a composite index in Firestore
    notifs.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    callback(notifs);
  }, (error: any) => {
    if (error.code !== 'permission-denied') {
      console.error("Firestore notification subscribe error:", error);
    }
    if (onError) onError(error);
  });
};

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    return true;
  } catch (error) {
    console.error('Error marking notification as read: ', error);
    return false;
  }
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

// ──────────────────────────────────────────────
// Follow Services
// ──────────────────────────────────────────────

export const followUser = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    if (followerId === followingId) return false;
    
    const followerRef = doc(db, 'users', followerId);
    const followingRef = doc(db, 'users', followingId);
    
    // Use arrayUnion to add IDs
    await updateDoc(followerRef, {
      following: arrayUnion(followingId)
    });
    await updateDoc(followingRef, {
      followers: arrayUnion(followerId)
    });
    
    const followerProfile = await getUserProfile(followerId);
    await createNotification(followingId, {
      type: 'follow',
      title: followerProfile?.nickname || 'Someone',
      body: 'started following you',
      data: {
        followerId,
        avatar: followerProfile?.avatar || '',
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error following user:', error);
    return false;
  }
};

export const unfollowUser = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    const followerRef = doc(db, 'users', followerId);
    const followingRef = doc(db, 'users', followingId);
    
    // Use arrayRemove to remove IDs
    await updateDoc(followerRef, {
      following: arrayRemove(followingId)
    });
    await updateDoc(followingRef, {
      followers: arrayRemove(followerId)
    });
    
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }
};

export const getFollowers = async (userId: string): Promise<User[]> => {
  try {
    const userDoc = await getUserProfile(userId);
    if (!userDoc || !userDoc.followers || userDoc.followers.length === 0) return [];
    
    const followers: User[] = [];
    for (const uid of userDoc.followers) {
      const profile = await getUserProfile(uid);
      if (profile) {
        followers.push({ ...profile, id: uid } as User & { id: string });
      }
    }
    return followers;
  } catch (error) {
    console.error('Error getting followers:', error);
    return [];
  }
};

export const subscribeToFollowers = (userId: string, callback: (followers: User[]) => void): import('firebase/firestore').Unsubscribe => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, async (docSnap) => {
    try {
      if (!docSnap.exists()) {
        callback([]);
        return;
      }
      
      const userData = docSnap.data();
      const followerIds = userData.followers || [];
      if (followerIds.length === 0) {
        callback([]);
        return;
      }
      
      const followers: User[] = [];
      for (const uid of followerIds) {
        const profile = await getUserProfile(uid); // Static fetch of profile when list updates to save costs
        if (profile) {
          followers.push({ ...profile, id: uid } as User & { id: string });
        }
      }
      callback(followers);
    } catch (error) {
      console.error('Error subscribing to followers:', error);
      callback([]);
    }
  });
};

export const getFollowing = async (userId: string): Promise<User[]> => {
  try {
    const userDoc = await getUserProfile(userId);
    if (!userDoc || !userDoc.following || userDoc.following.length === 0) return [];
    
    const following: User[] = [];
    for (const uid of userDoc.following) {
      const profile = await getUserProfile(uid);
      if (profile) {
        following.push({ ...profile, id: uid } as User & { id: string });
      }
    }
    return following;
  } catch (error) {
    console.error('Error getting following:', error);
    return [];
  }
};

export const subscribeToFollowing = (userId: string, callback: (following: User[]) => void): import('firebase/firestore').Unsubscribe => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, async (docSnap) => {
    try {
      if (!docSnap.exists()) {
        callback([]);
        return;
      }
      
      const userData = docSnap.data();
      const followingIds = userData.following || [];
      if (followingIds.length === 0) {
        callback([]);
        return;
      }
      
      const following: User[] = [];
      for (const uid of followingIds) {
        const profile = await getUserProfile(uid); // Static fetch of profile when list updates to save costs
        if (profile) {
          following.push({ ...profile, id: uid } as User & { id: string });
        }
      }
      callback(following);
    } catch (error) {
      console.error('Error subscribing to following:', error);
      callback([]);
    }
  });
};

export const checkIsFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    const followerDoc = await getUserProfile(followerId);
    if (followerDoc && followerDoc.following) {
      return followerDoc.following.includes(followingId);
    }
    return false;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};


