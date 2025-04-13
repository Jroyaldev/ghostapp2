/**
 * Chat Service for GhostMode
 * Handles storing and retrieving chat messages from Firebase
 */

import { firestore } from './firebase';
import { generateRandomId } from '../utils/helpers';
import config from '../config/environment';

// Configure logging
const logSafely = (message, data) => {
  if (data === undefined) {
    console.log(`[Chat Service] ${message}`);
  } else if (typeof data !== 'object') {
    console.log(`[Chat Service] ${message}:`, data);
  } else {
    console.log(`[Chat Service] ${message}: [Object]`);
  }
};

/**
 * Save a chat message to Firebase
 */
export const saveMessage = async (userId, message) => {
  try {
    logSafely('Saving message', message.id);
    
    // Add metadata for storage
    const messageToSave = {
      ...message,
      userId, // Store the user ID for ownership
      createdAt: firestore.FieldValue.serverTimestamp(),
    };
    
    // Get the collection path from environment config
    const collectionPath = config.firestorePaths.userChats(userId);
    
    // Add to user's ghost chat collection
    await firestore
      .collection(collectionPath)
      .add(messageToSave);
    
    return { success: true };
  } catch (error) {
    logSafely('Error saving message', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get chat messages for a user
 */
export const getMessages = async (userId, limit = 100) => {
  try {
    logSafely('Getting messages for user', userId);
    
    // Get the collection path from environment config
    const collectionPath = config.firestorePaths.userChats(userId);
    
    // Get messages from user's ghost chat collection, sorted by timestamp
    const messagesSnapshot = await firestore
      .collection(collectionPath)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    const messages = [];
    messagesSnapshot.forEach((doc) => {
      const message = {
        ...doc.data(),
        id: doc.id,
      };
      messages.push(message);
    });
    
    // Return in chronological order (oldest first)
    return { messages: messages.reverse(), error: null };
  } catch (error) {
    logSafely('Error getting messages', error.message);
    return { messages: [], error: error.message };
  }
};

/**
 * Save a batch of messages
 * Useful for restoring from local state
 */
export const saveBatchMessages = async (userId, messages) => {
  try {
    logSafely('Saving batch of messages', messages.length);
    
    // Get the collection path from environment config
    const collectionPath = config.firestorePaths.userChats(userId);
    
    // Process messages in batches
    const promises = messages.map(message => {
      const messageToSave = {
        ...message,
        userId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };
      
      return firestore
        .collection(collectionPath)
        .add(messageToSave);
    });
    
    await Promise.all(promises);
    
    return { success: true };
  } catch (error) {
    logSafely('Error saving batch messages', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Delete all messages for a user
 */
export const clearMessages = async (userId) => {
  try {
    logSafely('Clearing messages for user', userId);
    
    // Get the collection path from environment config
    const collectionPath = config.firestorePaths.userChats(userId);
    
    // Get all messages
    const messagesSnapshot = await firestore
      .collection(collectionPath)
      .get();
    
    // Delete each message
    const promises = [];
    messagesSnapshot.forEach((doc) => {
      promises.push(firestore
        .collection(collectionPath)
        .doc(doc.id)
        .delete());
    });
    
    await Promise.all(promises);
    
    return { success: true };
  } catch (error) {
    logSafely('Error clearing messages', error.message);
    return { success: false, error: error.message };
  }
};
