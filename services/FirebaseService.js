import { auth, db } from '../firebaseConfig';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, updateDoc, arrayUnion, getDocs, query, where } from 'firebase/firestore';

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

// Group Services
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
      if (userDoc.exists() && userDoc.data().expoPushToken) {
        tokens.push(userDoc.data().expoPushToken);
      }
    }
    return tokens;
  } catch (error) {
    console.error("Error fetching member tokens: ", error);
    return [];
  }
};
