/**
 * Firebase service configuration for GhostMode
 * Handles authentication, real-time database, and storage integration
 * Compatible with both Expo Go (web SDK) and native builds (React Native Firebase SDK)
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Import the Firebase core instances
import { auth, firestore, storage, database } from './firebase-core';

// Import Firebase functionality
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';

import {
  collection,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, set, onValue, off } from 'firebase/database';

// Safe logging utility to prevent circular references
const logSafely = (message, data) => {
  if (data === undefined) {
    console.log(`[Firebase] ${message}`);
  } else if (typeof data !== 'object') {
    console.log(`[Firebase] ${message}:`, data);
  } else {
    console.log(`[Firebase] ${message}: [Object]`);
  }
};

/**
 * Auth functions
 */

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback) => {
  console.log('[Auth] Setting up auth state listener');
  return onAuthStateChanged(auth, (user) => {
    console.log(`[Auth] Auth state changed: ${user ? `User ${user.uid} logged in` : 'User logged out'}`);
    callback(user);
  });
};

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    logSafely('Sign in error', error.message);
    return { user: null, error: error.message };
  }
};

// Sign up with email and password
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    logSafely('Sign up error', error.message);
    return { user: null, error: error.message };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    logSafely('Sign out error', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Firestore helpers
 */

// Export firestore value helpers
export const FieldValue = {
  serverTimestamp: () => serverTimestamp(),
  increment: (n) => increment(n),
  arrayUnion: (...elements) => arrayUnion(...elements),
  arrayRemove: (...elements) => arrayRemove(...elements)
};

// Create a document reference
export const docRef = (path, id) => doc(firestore, path, id);

// Create a collection reference
export const collectionRef = (path) => collection(firestore, path);

// Set document data
export const setDocument = async (path, id, data) => {
  try {
    await setDoc(doc(firestore, path, id), data);
    return { success: true, error: null };
  } catch (error) {
    logSafely(`Error setting document at ${path}/${id}`, error.message);
    return { success: false, error: error.message };
  }
};

// Update document data
export const updateDocument = async (path, id, data) => {
  try {
    await updateDoc(doc(firestore, path, id), data);
    return { success: true, error: null };
  } catch (error) {
    logSafely(`Error updating document at ${path}/${id}`, error.message);
    return { success: false, error: error.message };
  }
};

// Add document to collection
export const addDocument = async (path, data) => {
  try {
    const docRef = await addDoc(collection(firestore, path), data);
    return { id: docRef.id, error: null };
  } catch (error) {
    logSafely(`Error adding document to ${path}`, error.message);
    return { id: null, error: error.message };
  }
};

// Get document
export const getDocument = async (path, id) => {
  try {
    const docSnap = await getDoc(doc(firestore, path, id));
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null, exists: true };
    } else {
      return { data: null, error: null, exists: false };
    }
  } catch (error) {
    logSafely(`Error getting document at ${path}/${id}`, error.message);
    return { data: null, error: error.message, exists: false };
  }
};

// Query collection
export const queryCollection = async (path, constraints = [], limitCount = null) => {
  try {
    let q = query(collection(firestore, path), ...constraints);
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { results, error: null };
  } catch (error) {
    logSafely(`Error querying collection at ${path}`, error.message);
    return { results: [], error: error.message };
  }
};

/**
 * Utility functions for timestamp handling
 */

// Convert Firestore Timestamp to ISO string
export const timestampToISOString = (timestamp) => {
  if (!timestamp) return null;
  if (typeof timestamp === 'string') return timestamp;
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  return null;
};

// Convert ISO string to Firestore Timestamp
export const ISOStringToTimestamp = (isoString) => {
  if (!isoString) return null;
  if (isoString instanceof Timestamp) return isoString;
  return Timestamp.fromDate(new Date(isoString));
};

/**
 * Message functions - replaced by more specific services
 */

// Export the initialized instances
export { firestore, auth, storage, database };
