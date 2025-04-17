/**
 * Chat Service for GhostMode
 * Handles storing and retrieving chat messages from Firebase
 */

import { 
  firestore, 
  FieldValue, 
  addDocument, 
  queryCollection,
  updateDocument 
} from './firebase';
import { orderBy, limit as limitQuery } from 'firebase/firestore';
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
      createdAt: new Date().toISOString(),
    };
    
    // Get the collection path from environment config
    const collectionPath = config.firestorePaths.userChats(userId);
    
    // Add to user's ghost chat collection
    const { id, error } = await addDocument(collectionPath, messageToSave);
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, messageId: id };
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
    const { results: messagesData, error } = await queryCollection(
      collectionPath,
      [orderBy('timestamp', 'desc')],
      limit
    );
    
    if (error) {
      return { messages: [], error };
    }
    
    // Return in chronological order (oldest first)
    return { messages: messagesData.reverse(), error: null };
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
        createdAt: new Date().toISOString(),
      };
      
      return addDocument(collectionPath, messageToSave);
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
    const { results: messagesData, error } = await queryCollection(collectionPath);
    
    if (error) {
      return { success: false, error };
    }
    
    // Mark each message as deleted instead of actually deleting
    const promises = messagesData.map(message => {
      return updateDocument(collectionPath, message.id, {
        deleted: true,
        deletedAt: new Date().toISOString()
      });
    });
    
    await Promise.all(promises);
    
    return { success: true };
  } catch (error) {
    logSafely('Error clearing messages', error.message);
    return { success: false, error: error.message };
  }
};

// Save prompt bar state (auto-scroll or paused) to Firestore
export const savePromptBarState = async (userId, state) => {
  try {
    const collectionPath = config.firestorePaths.userChats(userId);
    // Save state as a special doc
    await updateDocument(collectionPath, 'promptBarState', {
      ...state,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get prompt bar state from Firestore
export const getPromptBarState = async (userId) => {
  try {
    const collectionPath = config.firestorePaths.userChats(userId);
    const { results, error } = await queryCollection(collectionPath);
    if (error) return {};
    const stateDoc = results.find(doc => doc.id === 'promptBarState');
    return stateDoc || {};
  } catch {
    return {};
  }
};
