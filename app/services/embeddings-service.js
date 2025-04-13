/**
 * Embeddings Service for GhostMode
 * Handles generating and managing vector embeddings for memory and semantic search
 */

import { generateRandomId } from '../utils/helpers';

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

// API Keys and configuration
const OPENAI_API_KEY = ''; // Replace with actual key if needed
const DEEPSEEK_API_KEY = 'sk-6d724a5a45244a95a1b150d262865108';
const USE_REAL_API = false; // Set to true to use actual API calls

// Default to OpenAI embeddings which are widely used and reliable
const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small"; // OpenAI's efficient embedding model
const EMBEDDING_DIMENSION = 1536; // Embedding dimension for OpenAI models

/**
 * Generate an embedding vector for text using available APIs
 */
export const generateEmbedding = async (text) => {
  try {
    logSafely('Generating embedding for text', text.substring(0, 50) + '...');
    
    // In development, use a mock embedding if needed
    if (__DEV__ && !USE_REAL_API) {
      return mockEmbedding(text);
    }
    
    // Try OpenAI first, then fall back to DeepSeek if needed
    if (OPENAI_API_KEY) {
      const embedding = await generateOpenAIEmbedding(text);
      if (embedding) return embedding;
    }
    
    if (DEEPSEEK_API_KEY) {
      return await generateDeepSeekChatEmbedding(text);
    }
    
    throw new Error('No API keys available for embedding generation');
  } catch (error) {
    logSafely('Error generating embedding', error.message);
    return mockEmbedding(text);
  }
};

/**
 * Generate embedding using OpenAI's embedding API
 */
const generateOpenAIEmbedding = async (text) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    };
    
    // Use the recommended model
    const payload = {
      "model": "text-embedding-3-small",
      "input": text
    };
    
    logSafely('Making embedding request to OpenAI API');
    
    const response = await fetch(
      "https://api.openai.com/v1/embeddings",
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      }
    );
    
    if (response.ok) {
      const responseData = await response.json();
      const embedding = responseData.data[0].embedding;
      logSafely(`Generated OpenAI embedding with dimension ${embedding.length}`);
      return embedding;
    } else {
      const errorText = await response.text();
      logSafely(`Error generating OpenAI embedding: ${errorText}`);
      return null;
    }
  } catch (error) {
    logSafely(`Exception during OpenAI embedding generation: ${error.message}`);
    return null;
  }
};

/**
 * Generate a basic embedding using DeepSeek chat as fallback
 * This is a workaround that asks the LLM to generate a simplified embedding
 * representation. Not as good as real embeddings but better than nothing.
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
      "https://api.deepseek.com/v1/chat/completions",
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
          const paddedEmbedding = embeddingArray.slice(0, 20); // Truncate if longer
          while (paddedEmbedding.length < 20) {
            paddedEmbedding.push(0.0); // Pad if shorter
          }
          
          return paddedEmbedding;
        } else {
          logSafely('Could not extract embedding array from DeepSeek response');
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
  const mockDimension = 20;
  const embedding = new Array(mockDimension).fill(0);
  
  // Use the string to generate some variation in the embedding
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use the hash to seed the embedding values
  for (let i = 0; i < mockDimension; i++) {
    // Generate a value between -1 and 1 based on the hash and position
    embedding[i] = Math.sin(hash * (i + 1)) / 2;
  }
  
  return embedding;
};
