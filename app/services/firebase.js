/**
 * Firebase service configuration for GhostMode
 * Handles authentication, real-time database, and storage integration
 * Compatible with both Expo Go (web SDK) and native builds (React Native Firebase SDK)
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Import the Firebase core instances instead of initializing directly
import { auth, firestore, storage, database } from './firebase-core';

// Import Firebase functionality without initialization
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
  getDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
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

// Define API wrappers for Firebase services
// These are standardized regardless of whether using web SDK or native SDK

// Wrap auth methods
const authAPI = {
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },
  signInWithEmailAndPassword: (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  },
  createUserWithEmailAndPassword: (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  },
  signOut: () => signOut(auth)
};

// Wrap Firestore methods
const firestoreAPI = {
  collection: (path) => {
    return {
      doc: (docPath) => {
        const docRef = doc(firestore, path, docPath);
        return {
          set: (data) => setDoc(docRef, data),
          update: (data) => setDoc(docRef, data, { merge: true }),
          get: async () => {
            const snapshot = await getDoc(docRef);
            return {
              exists: snapshot.exists(),
              data: () => snapshot.data(),
              id: snapshot.id
            };
          },
          collection: (subPath) => firestoreAPI.collection(`${path}/${docPath}/${subPath}`)
        };
      },
      add: (data) => addDoc(collection(firestore, path), data),
      where: (field, op, value) => {
        const q = query(collection(firestore, path), where(field, op, value));
        return {
          get: async () => {
            const querySnapshot = await getDocs(q);
            const results = [];
            querySnapshot.forEach((doc) => {
              results.push({
                id: doc.id,
                data: () => doc.data(),
                exists: true
              });
            });
            
            return {
              forEach: (callback) => results.forEach((doc) => callback(doc))
            };
          }
        };
      },
      orderBy: (field, direction) => {
        const q = query(collection(firestore, path), orderBy(field, direction));
        return {
          limit: (limitVal) => {
            const limitedQuery = query(q, limit(limitVal));
            return {
              get: async () => {
                const querySnapshot = await getDocs(limitedQuery);
                const results = [];
                querySnapshot.forEach((doc) => {
                  results.push({
                    id: doc.id,
                    data: () => doc.data(),
                    exists: true
                  });
                });
                
                return {
                  forEach: (callback) => results.forEach((doc) => callback(doc))
                };
              }
            };
          },
          get: async () => {
            const querySnapshot = await getDocs(q);
            const results = [];
            querySnapshot.forEach((doc) => {
              results.push({
                id: doc.id,
                data: () => doc.data(),
                exists: true
              });
            });
            
            return {
              forEach: (callback) => results.forEach((doc) => callback(doc))
            };
          }
        };
      }
    };
  },
  FieldValue: {
    serverTimestamp: () => serverTimestamp()
  }
};

// Wrap Storage methods
const storageAPI = {
  ref: (path) => {
    const reference = ref(storage, path);
    return {
      putFile: (file) => uploadBytes(reference, file),
      getDownloadURL: () => getDownloadURL(reference)
    };
  }
};

// Wrap Realtime Database methods
const databaseAPI = {
  ref: (path) => {
    const reference = dbRef(database, path);
    return {
      set: (data) => set(reference, data),
      on: (event, callback) => onValue(reference, callback),
      off: (event) => off(reference, event)
    };
  },
  ServerValue: {
    TIMESTAMP: serverTimestamp()
  }
};

/**
 * Auth functions
 */

// Subscribe to auth state changes
const subscribeToAuthChanges = (callback) => {
  return authAPI.onAuthStateChanged(callback);
};

// Sign in with email and password
const signIn = async (email, password) => {
  try {
    const userCredential = await authAPI.signInWithEmailAndPassword(email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    logSafely('Sign in error', error.message);
    return { user: null, error: error.message };
  }
};

// Sign up with email and password
const signUp = async (email, password) => {
  try {
    const userCredential = await authAPI.createUserWithEmailAndPassword(email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    logSafely('Sign up error', error.message);
    return { user: null, error: error.message };
  }
};

// Sign out
const signOutUser = async () => {
  try {
    await authAPI.signOut();
    return { success: true, error: null };
  } catch (error) {
    logSafely('Sign out error', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * User profile functions
 */

// Get user profile
const getUserProfile = async (userId) => {
  try {
    const userDoc = await firestoreAPI.collection('users').doc(userId).get();
    if (userDoc.exists) {
      return { profile: userDoc.data(), error: null };
    } else {
      return { profile: null, error: "User profile not found" };
    }
  } catch (error) {
    logSafely('Get user profile error', error.message);
    return { profile: null, error: error.message };
  }
};

// Update user profile
const updateUserProfile = async (userId, profileData) => {
  try {
    await firestoreAPI.collection('users').doc(userId).update(profileData);
    return { success: true, error: null };
  } catch (error) {
    logSafely('Update user profile error', error.message);
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
      createdAt: firestoreAPI.FieldValue.serverTimestamp(),
    };
    
    const docRef = await firestoreAPI.collection('spaces').doc(spaceId).collection('messages').add(messageData);
    return { messageId: docRef.id, error: null };
  } catch (error) {
    logSafely('Create message error', error.message);
    return { messageId: null, error: error.message };
  }
};

// Get messages for a space
const getMessages = async (spaceId, limitCount = 50) => {
  try {
    const messagesQuery = await firestoreAPI
      .collection('spaces')
      .doc(spaceId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();
    
    const messages = [];
    
    messagesQuery.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { messages, error: null };
  } catch (error) {
    logSafely('Get messages error', error.message);
    return { messages: [], error: error.message };
  }
};

/**
 * Space functions
 */

// Create a new space (group chat)
const createSpace = async (spaceData) => {
  try {
    const docRef = await firestoreAPI.collection('spaces').add({
      ...spaceData,
      createdAt: firestoreAPI.FieldValue.serverTimestamp(),
    });
    return { spaceId: docRef.id, error: null };
  } catch (error) {
    logSafely('Create space error', error.message);
    return { spaceId: null, error: error.message };
  }
};

// Get spaces for a user
const getSpacesForUser = async (userId) => {
  try {
    const spacesQuery = await firestoreAPI
      .collection('spaces')
      .where('members', 'array-contains', userId)
      .get();
    
    const spaces = [];
    
    spacesQuery.forEach((doc) => {
      spaces.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { spaces, error: null };
  } catch (error) {
    logSafely('Get spaces error', error.message);
    return { spaces: [], error: error.message };
  }
};

/**
 * Storage functions
 */

// Upload file to Firebase Storage
const uploadFile = async (file, path) => {
  try {
    const reference = storageAPI.ref(path);
    await reference.putFile(file);
    const downloadURL = await reference.getDownloadURL();
    return { url: downloadURL, error: null };
  } catch (error) {
    logSafely('Upload file error', error.message);
    return { url: null, error: error.message };
  }
};

/**
 * Realtime Database functions
 */

// Update user presence status
const updateUserPresence = async (userId, isOnline) => {
  try {
    await databaseAPI
      .ref(`/status/${userId}`)
      .set({
        state: isOnline ? 'online' : 'offline',
        last_changed: databaseAPI.ServerValue.TIMESTAMP,
      });
    return { success: true, error: null };
  } catch (error) {
    logSafely('Update presence error', error.message);
    return { success: false, error: error.message };
  }
};

// Listen to user presence changes
const subscribeToUserPresence = (userId, callback) => {
  const reference = databaseAPI.ref(`/status/${userId}`);
  reference.on('value', (snapshot) => {
    callback(snapshot.val());
  });
  
  // Return unsubscribe function
  return () => reference.off('value');
};

// Rename exports before the export statement
const firestoreExport = firestoreAPI;
const storageExport = storageAPI;
const databaseExport = databaseAPI;

export {
  auth,
  firestoreExport as firestore,
  storageExport as storage,
  databaseExport as database,
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
  uploadFile,
  updateUserPresence,
  subscribeToUserPresence
};
