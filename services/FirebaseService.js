import { auth, db } from '../firebaseConfig';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, updateDoc, arrayUnion, getDocs, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';

// Auth Services
export const loginAnonymously = async (nickname) => {
  try {
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    
    // Create or update user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      nickname: nickname,
      createdAt: new Date(),
      // fcmToken will be updated later when notifications are setup
    }, { merge: true });

    return user;
  } catch (error) {
    console.error("Error signing in anonymously: ", error);
    throw error;
  }
};

// Auth & Profile Services
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const updateUserProfile = async (userId, data) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
};
export const createGroup = async (groupName, creatorUid) => {
  try {
    const docRef = await addDoc(collection(db, 'groups'), {
      name: groupName,
      members: [creatorUid],
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating group: ", error);
    throw error;
  }
};

export const updateUserPushToken = async (userId, token) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pushToken: token,
      updatedAt: new Date().toISOString()
    });
    console.log('Push token saved to Firestore for user:', userId);
  } catch (error) {
    console.error('Error saving push token:', error);
  }
};

export const searchUsersByHandle = async (handleQuery) => {
  try {
    // For a simple substring match in Firestore (prefix match)
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('nickname', '>=', handleQuery),
      where('nickname', '<=', handleQuery + '\uf8ff')
    );
    
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    return results;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

export const sendFriendRequest = async (senderId, receiverId) => {
  try {
    const friendRequestsRef = collection(db, 'friend_requests');
    await addDoc(friendRequestsRef, {
      senderId: senderId,
      receiverId: receiverId,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    console.log('Friend request sent from', senderId, 'to', receiverId);
    return true;
  } catch (error) {
    console.error('Error sending friend request:', error);
    return false;
  }
};

export const joinGroup = async (groupId, userUid) => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(userUid)
    });
    return true;
  } catch (error) {
    console.error("Error joining group: ", error);
    throw error;
  }
};

export const getUserGroups = async (userUid) => {
  try {
    const q = query(collection(db, 'groups'), where("members", "array-contains", userUid));
    const querySnapshot = await getDocs(q);
    const groups = [];
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
    });
    return groups;
  } catch (error) {
    console.error("Error fetching user groups: ", error);
    throw error;
  }
};

export const getGroupMemberTokens = async (groupId, excludeUid) => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) return [];

    const members = groupDoc.data().members || [];
    const tokens = [];

    for (const memberUid of members) {
      if (memberUid === excludeUid) continue; // Don't send to self
      const userDoc = await getDoc(doc(db, 'users', memberUid));
      if (userDoc.exists() && userDoc.data().pushToken) {
        tokens.push(userDoc.data().pushToken);
      }
    }
    return tokens;
  } catch (error) {
    console.error("Error fetching member tokens: ", error);
    return [];
  }
};

// Feed Services
export const createPost = async (postData) => {
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      likes: 0,
      comments: 0,
      reposts: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating post: ", error);
    throw error;
  }
};

export const subscribeToFeed = (callback) => {
  const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    callback(posts);
  });
};
