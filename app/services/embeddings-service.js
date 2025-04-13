/**
 * Embeddings Service for GhostMode
 * Handles generating and managing vector embeddings for memory and semantic search
 */

import { generateRandomId } from '../utils/helpers';
import config from '../config/environment';

// Configure logging
const logSafely = (message, data) => {
  if (data === undefined) {
    console.log(`[Embeddings Service] ${message}`);
  } else if (typeof data !== 'object') {
    console.log(`[Embeddings Service] ${message}:`, data);
  } else {
    console.log(`[Embeddings Service] ${message}: [Object]`);
  }
};

// API Keys and configuration - these would be better stored in environment variables
const DEEPSEEK_API_KEY = 'sk-6d724a5a45244a95a1b150d262865108';
const USE_REAL_API = config.useRealApi;

// Default embedding dimensions and models
const EMBEDDING_DIMENSION = 20; // Reduced dimension for DeepSeek chat-based embeddings

/**
 * Generate an embedding vector for text using available APIs
 */
export const generateEmbedding = async (text) => {
  try {
    logSafely('Generating embedding for text', text.substring(0, 50) + '...');
    
    // In development, use a mock embedding if not using real API
    if (!USE_REAL_API) {
      logSafely('Using mock embedding (USE_REAL_API is false)');
      return mockEmbedding(text);
    }
    
    // Use DeepSeek for embeddings
    if (DEEPSEEK_API_KEY) {
      const embedding = await generateDeepSeekChatEmbedding(text);
      if (embedding) return embedding;
    }
    
    // Fall back to mock embeddings if all else fails
    logSafely('Falling back to mock embedding');
    return mockEmbedding(text);
  } catch (error) {
    logSafely('Error generating embedding', error.message);
    return mockEmbedding(text);
  }
};

/**
 * Generate a basic embedding using DeepSeek chat as fallback
 * This is a workaround that asks the LLM to generate a simplified embedding
 * representation. Not as good as dedicated embedding models but works for our purposes.
 */
const generateDeepSeekChatEmbedding = async (text) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
    };
    
    // Ask the chat model to create a simplified embedding
    const payload = {
      "model": "deepseek-chat",
      "messages": [
        {
          "role": "system",
          "content": "You are an embedding generator. When given text, output ONLY a JSON array with 20 floating point numbers between -1 and 1 that semantically represent the input. This is a simplified embedding vector. Output NOTHING except the JSON array."
        },
        {
          "role": "user",
          "content": `Generate an embedding vector for this text: ${text}`
        }
      ],
      "temperature": 0,
      "max_tokens": 200
    };
    
    logSafely('Making chat-based embedding request to DeepSeek API');
    
    const response = await fetch(
      config.apiUrl + "/chat/completions",
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      }
    );
    
    if (response.ok) {
      const responseData = await response.json();
      const responseContent = responseData.choices[0].message.content;
      
      // Extract the JSON array from the response
      try {
        // Find the array in the response using regex
        const jsonArrayMatch = responseContent.match(/\[\s*-?\d+\.\d+(?:\s*,\s*-?\d+\.\d+)*\s*\]/);
        
        if (jsonArrayMatch) {
          const embeddingArray = JSON.parse(jsonArrayMatch[0]);
          logSafely(`Generated DeepSeek chat-based embedding with dimension ${embeddingArray.length}`);
          
          // Pad or truncate to expected dimension
          const paddedEmbedding = embeddingArray.slice(0, EMBEDDING_DIMENSION); // Truncate if longer
          while (paddedEmbedding.length < EMBEDDING_DIMENSION) {
            paddedEmbedding.push(0.0); // Pad if shorter
          }
          
          return paddedEmbedding;
        } else {
          logSafely('Could not extract embedding array from DeepSeek response, response was:', responseContent);
          return null;
        }
      } catch (error) {
        logSafely(`Failed to parse embedding from DeepSeek response: ${error.message}`);
        return null;
      }
    } else {
      const errorText = await response.text();
      logSafely(`Error generating DeepSeek chat-based embedding: ${errorText}`);
      return null;
    }
  } catch (error) {
    logSafely(`Exception during DeepSeek chat-based embedding generation: ${error.message}`);
    return null;
  }
};

/**
 * Generate embeddings for a list of texts in batches
 */
export const generateBatchEmbeddings = async (texts, batchSize = 10) => {
  const embeddings = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    logSafely(`Processing embedding batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(texts.length/batchSize)}`);
    
    const batchPromises = batch.map(text => generateEmbedding(text));
    const batchEmbeddings = await Promise.all(batchPromises);
    embeddings.push(...batchEmbeddings);
  }
  
  return embeddings;
};

/**
 * Calculate the cosine similarity between two embeddings
 */
export const semanticSimilarity = (embedding1, embedding2) => {
  if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
    return 0;
  }
  
  // Calculate dot product
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }
  
  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);
  
  if (norm1 === 0 || norm2 === 0) return 0;
  
  return dotProduct / (norm1 * norm2);
};

/**
 * Create a cache of embeddings for a conversation history
 */
export const createEmbeddingCache = async (conversationHistory) => {
  const cache = {};
  const texts = conversationHistory.map(msg => msg.text);
  const ids = conversationHistory.map(msg => msg.id);
  
  const embeddings = await generateBatchEmbeddings(texts);
  
  for (let i = 0; i < embeddings.length; i++) {
    if (embeddings[i]) {
      cache[ids[i]] = embeddings[i];
    }
  }
  
  return cache;
};

/**
 * Generate a mock embedding for development purposes
 */
const mockEmbedding = (text) => {
  // Create a deterministic but unique embedding based on text content
  // This is just for development/testing and not for production use
  const embedding = new Array(EMBEDDING_DIMENSION).fill(0);
  
  // Use the string to generate some variation in the embedding
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use the hash to seed the embedding values
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    // Generate a value between -1 and 1 based on the hash and position
    embedding[i] = Math.sin(hash * (i + 1)) / 2;
  }
  
  return embedding;
};
