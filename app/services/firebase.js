/**
 * Firebase service configuration for GhostMode
 * Handles authentication, real-time database, and storage integration
 */

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, setDoc, getDoc, getDocs, doc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration
// Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "ghostmode-app.firebaseapp.com",
  projectId: "ghostmode-app",
  storageBucket: "ghostmode-app.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/**
 * Authentication service functions
 */

// Listen to auth state changes
const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

// Sign in with email and password
const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign up with email and password
const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      displayName: displayName,
      email: email,
      createdAt: serverTimestamp(),
      theme: 'dark', // Default theme
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}` // Default avatar using DiceBear
    });
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign out
const signOutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * User profile functions
 */

// Get user profile
const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { profile: userDoc.data(), error: null };
    } else {
      return { profile: null, error: "User profile not found" };
    }
  } catch (error) {
    return { profile: null, error: error.message };
  }
};

// Update user profile
const updateUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, "users", userId), profileData, { merge: true });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Message functions
 */

// Create a new message
const createMessage = async (spaceId, message) => {
  try {
    const messageData = {
      ...message,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, "spaces", spaceId, "messages"), messageData);
    return { messageId: docRef.id, error: null };
  } catch (error) {
    return { messageId: null, error: error.message };
  }
};

// Get messages for a space
const getMessages = async (spaceId, limitCount = 50) => {
  try {
    const messagesQuery = query(
      collection(db, "spaces", spaceId, "messages"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(messagesQuery);
    const messages = [];
    
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { messages, error: null };
  } catch (error) {
    return { messages: [], error: error.message };
  }
};

/**
 * Space functions
 */

// Create a new space (group chat)
const createSpace = async (spaceData) => {
  try {
    const docRef = await addDoc(collection(db, "spaces"), {
      ...spaceData,
      createdAt: serverTimestamp(),
    });
    return { spaceId: docRef.id, error: null };
  } catch (error) {
    return { spaceId: null, error: error.message };
  }
};

// Get spaces for a user
const getSpacesForUser = async (userId) => {
  try {
    const spacesQuery = query(
      collection(db, "spaces"),
      where("members", "array-contains", userId)
    );
    
    const querySnapshot = await getDocs(spacesQuery);
    const spaces = [];
    
    querySnapshot.forEach((doc) => {
      spaces.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { spaces, error: null };
  } catch (error) {
    return { spaces: [], error: error.message };
  }
};

/**
 * Storage functions
 */

// Upload file to Firebase Storage
const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return { url: downloadURL, error: null };
  } catch (error) {
    return { url: null, error: error.message };
  }
};

export {
  auth,
  db,
  storage,
  subscribeToAuthChanges,
  signIn,
  signUp,
  signOutUser,
  getUserProfile,
  updateUserProfile,
  createMessage,
  getMessages,
  createSpace,
  getSpacesForUser,
  uploadFile
};
