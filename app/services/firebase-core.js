/**
 * Core Firebase initialization
 * This file is the single source of truth for Firebase initialization
 * to prevent circular dependencies and multiple initializations.
 */

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from './firebaseConfig';

// Create a singleton pattern for Firebase initialization
let app;
let auth;
let firestore;
let storage;
let database;

// Initialize Firebase only once
if (!app) {
  console.log('[Firebase Core] Initializing Firebase');
  app = initializeApp(firebaseConfig);
  
  // Initialize auth with AsyncStorage persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  
  firestore = getFirestore(app);
  storage = getStorage(app);
  database = getDatabase(app);
} else {
  console.log('[Firebase Core] Using existing Firebase instance');
}

// Export the initialized instances
export { app, auth, firestore, storage, database };
