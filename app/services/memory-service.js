/**
 * Memory Service for GhostMode
 * Handles storing and retrieving memories with semantic embeddings
 */

import { 
  firestore, 
  FieldValue, 
  addDocument, 
  getDocument,
  queryCollection,
  updateDocument
} from './firebase';
import { generateRandomId } from '../utils/helpers';
import { generateEmbedding, semanticSimilarity } from './embeddings-service';
import { orderBy, limit as limitQuery } from 'firebase/firestore';
import config from '../config/environment';

// Configure logging
const logSafely = (message, data) => {
  if (data === undefined) {
    console.log(`[Memory Service] ${message}`);
  } else if (typeof data !== 'object') {
    console.log(`[Memory Service] ${message}:`, data);
  } else {
    console.log(`[Memory Service] ${message}: [Object]`);
  }
};

/**
 * Extract suggested tags from a text using AI analysis
 * This is a simplified version that extracts keywords
 */
const extractTagsFromText = (text) => {
  // Simple keyword extraction for common topics
  const topics = [
    'work', 'family', 'friends', 'health', 'tech', 'music', 'movies',
    'sports', 'travel', 'food', 'code', 'programming', 'art', 'books',
    'projects', 'ideas', 'plans', 'questions', 'advice', 'important'
  ];
  
  // Find which topics are mentioned in the text
  const lowerText = text.toLowerCase();
  const foundTags = topics.filter(topic => lowerText.includes(topic));
  
  // Limit to top 3 tags
  return foundTags.slice(0, 3);
};

/**
 * Save a message as a memory with embedding
 */
export const saveMemory = async (userId, message, customTags = []) => {
  try {
    logSafely('Saving memory', message.id);
    
    // Generate embedding for semantic search
    const embedding = await generateEmbedding(message.text);
    
    // Extract tags from the message if no custom tags provided
    const autoTags = customTags.length > 0 ? [] : extractTagsFromText(message.text);
    const tags = [...new Set([...customTags, ...autoTags])]; // Combine and deduplicate tags
    
    // Add metadata for storage
    const memoryToSave = {
      messageId: message.id,
      text: message.text,
      isUser: message.isUser,
      timestamp: message.timestamp,
      embedding,
      tags,
      createdAt: new Date().toISOString(),
    };
    
    // Get the collection path from environment config
    const collectionPath = config.firestorePaths.userMemories(userId);
    
    // Add to user's memories collection
    const { id: memoryId, error } = await addDocument(collectionPath, memoryToSave);
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, memoryId, tags };
  } catch (error) {
    logSafely('Error saving memory', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get all memories for a user
 */
export const getMemories = async (userId, limit = 100) => {
  try {
    logSafely('Getting memories for user', userId);
    
    // Get the collection path from environment config
    const collectionPath = config.firestorePaths.userMemories(userId);
    
    // Get memories from user's memories collection, sorted by timestamp
    const { results: memoriesData, error } = await queryCollection(
      collectionPath,
      [orderBy('timestamp', 'desc')],
      limit
    );
    
    if (error) {
      return { memories: [], error };
    }
    
    // Process memories to remove embeddings and ensure proper formatting
    const memories = memoriesData.map(memory => {
      // Create a new object without the embedding to reduce payload size
      const { embedding, ...memoryWithoutEmbedding } = memory;
      return memoryWithoutEmbedding;
    });
    
    // Return in reverse chronological order (newest first)
    return { memories, error: null };
  } catch (error) {
    logSafely('Error getting memories', error.message);
    return { memories: [], error: error.message };
  }
};

/**
 * Find related memories based on semantic similarity
 */
export const findRelatedMemories = async (userId, text, threshold = 0.7, limit = 5) => {
  try {
    logSafely('Finding related memories', text.substring(0, 50));
    
    // Generate embedding for the query text
    const queryEmbedding = await generateEmbedding(text);
    
    // Get the collection path from environment config
    const collectionPath = config.firestorePaths.userMemories(userId);
    
    // Get all memories to compare embeddings
    const { results: memoriesData, error } = await queryCollection(collectionPath);
    
    if (error) {
      return { memories: [], error };
    }
    
    const results = [];
    memoriesData.forEach(memory => {
      if (memory.embedding) {
        const similarity = semanticSimilarity(queryEmbedding, memory.embedding);
        if (similarity > threshold) {
          // Create a result object without the embedding to reduce size
          const { embedding, ...memoryWithoutEmbedding } = memory;
          results.push({
            ...memoryWithoutEmbedding,
            similarity
          });
        }
      }
    });
    
    // Sort by similarity (highest first) and limit results
    const sortedResults = results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    return { memories: sortedResults, error: null };
  } catch (error) {
    logSafely('Error finding related memories', error.message);
    return { memories: [], error: error.message };
  }
};

/**
 * Delete a memory
 */
export const deleteMemory = async (userId, memoryId) => {
  try {
    logSafely('Deleting memory', memoryId);
    
    // Get the collection path from environment config
    const collectionPath = config.firestorePaths.userMemories(userId);
    
    const { success, error } = await updateDocument(
      collectionPath,
      memoryId,
      { deleted: true, deletedAt: new Date().toISOString() }
    );
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    logSafely('Error deleting memory', error.message);
    return { success: false, error: error.message };
  }
};
