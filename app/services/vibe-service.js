/**
 * Vibe Detection Service for GhostMode
 * Analyzes messages to determine the emotional vibe of conversations
 * Inspired by Discord's community feel with a more refined Apple-like approach
 */

import { generateEmbedding, semanticSimilarity } from './embeddings-service';
import config from '../config/environment';

// Configure logging
const logSafely = (message, data) => {
  if (data === undefined) {
    console.log(`[Vibe Service] ${message}`);
  } else if (typeof data !== 'object') {
    console.log(`[Vibe Service] ${message}:`, data);
  } else {
    console.log(`[Vibe Service] ${message}: [Object]`);
  }
};

// Vibe types with their associated colors and descriptions
export const VIBE_TYPES = {
  FRIENDLY: { id: 'friendly', color: '#FF7A5A', darkColor: '#CC6248', lightColor: '#FFEDE9', emoji: '😊', description: 'Warm and conversational' },
  HELPFUL: { id: 'helpful', color: '#3ECFB2', darkColor: '#32A58E', lightColor: '#E9FBF8', emoji: '💡', description: 'Informative and constructive' },
  CHAOTIC: { id: 'chaotic', color: '#9D7AFF', darkColor: '#7D62CC', lightColor: '#F4EEFF', emoji: '🔮', description: 'Creative and unpredictable' },
  SERIOUS: { id: 'serious', color: '#FFD166', darkColor: '#CCA752', lightColor: '#FFF8E6', emoji: '🧠', description: 'Focused and analytical' },
  NEUTRAL: { id: 'neutral', color: '#A0A0A0', darkColor: '#808080', lightColor: '#F2F2F2', emoji: '😐', description: 'Balanced and moderate' }
};

// Emotional markers to detect different vibes
const VIBE_MARKERS = {
  [VIBE_TYPES.FRIENDLY.id]: [
    'laughing', 'love', 'friend', 'happy', 'glad', 'nice', 'fun', 'cool', 'awesome', 
    'thank you', 'thanks', 'appreciate', 'enjoy', 'haha', 'lol', '😊', '😄', '❤️', 'welcome'
  ],
  [VIBE_TYPES.HELPFUL.id]: [
    'help', 'advice', 'suggest', 'recommendation', 'solution', 'explain', 'clarify', 
    'how to', 'could you', 'would you', 'please', 'need assistance', 'question', 'answer', 
    'guide', 'steps', 'tutorial', 'learn', 'understand', 'improve'
  ],
  [VIBE_TYPES.CHAOTIC.id]: [
    'wild', 'crazy', 'random', 'weird', 'strange', 'unexpected', 'unpredictable', 
    'surprising', 'bizarre', 'absurd', 'chaotic', 'ridiculous', 'outrageous', 'impossible', 
    'unbelievable', 'wtf', 'omg', 'what the', 'no way', '🤪', '😜', '🤯', '🔮'
  ],
  [VIBE_TYPES.SERIOUS.id]: [
    'important', 'serious', 'concern', 'issue', 'problem', 'critical', 'urgent', 
    'deadline', 'project', 'work', 'task', 'responsibility', 'focus', 'priority', 
    'analyze', 'review', 'consider', 'evaluate', 'determine', 'assess'
  ]
};

/**
 * Detect the vibe of a message using keyword analysis
 * @param {string} text - The message text to analyze
 * @returns {Object} - The detected vibe type object
 */
export const detectMessageVibe = (text) => {
  if (!text) return VIBE_TYPES.NEUTRAL;
  
  const lowerText = text.toLowerCase();
  let vibeScores = {};
  
  // Initialize scores for each vibe type
  Object.keys(VIBE_TYPES).forEach(vibeKey => {
    vibeScores[VIBE_TYPES[vibeKey].id] = 0;
  });
  
  // Score based on keyword matches
  Object.keys(VIBE_MARKERS).forEach(vibeId => {
    const markers = VIBE_MARKERS[vibeId];
    markers.forEach(marker => {
      if (lowerText.includes(marker.toLowerCase())) {
        vibeScores[vibeId] += 1;
      }
    });
  });
  
  // Find the vibe with the highest score
  let highestVibeId = VIBE_TYPES.NEUTRAL.id;
  let highestScore = 0;
  
  Object.keys(vibeScores).forEach(vibeId => {
    if (vibeScores[vibeId] > highestScore) {
      highestScore = vibeScores[vibeId];
      highestVibeId = vibeId;
    }
  });
  
  // If no strong vibe detected, return neutral
  if (highestScore === 0) {
    return VIBE_TYPES.NEUTRAL;
  }
  
  // Return the vibe type object
  return Object.values(VIBE_TYPES).find(vibe => vibe.id === highestVibeId) || VIBE_TYPES.NEUTRAL;
};

/**
 * Calculate the vibe of a conversation based on recent messages
 * @param {Array} messages - Array of message objects with text content
 * @param {number} recencyWeight - How much more recent messages matter (higher = more recency bias)
 * @returns {Object} - The overall conversation vibe
 */
export const calculateConversationVibe = (messages, recencyWeight = 1.5) => {
  if (!messages || messages.length === 0) return VIBE_TYPES.NEUTRAL;
  
  // Only consider the last 10 messages for vibe calculation
  const recentMessages = messages.slice(-10);
  
  // Calculate vibe scores with recency weighting
  const vibeScores = {};
  Object.keys(VIBE_TYPES).forEach(key => {
    vibeScores[VIBE_TYPES[key].id] = 0;
  });
  
  recentMessages.forEach((message, index) => {
    const messageVibe = detectMessageVibe(message.text);
    const recencyFactor = 1 + (recencyWeight * (index / recentMessages.length));
    vibeScores[messageVibe.id] += recencyFactor;
  });
  
  // Find dominant vibe
  let dominantVibeId = VIBE_TYPES.NEUTRAL.id;
  let highestScore = 0;
  
  Object.keys(vibeScores).forEach(vibeId => {
    if (vibeScores[vibeId] > highestScore) {
      highestScore = vibeScores[vibeId];
      dominantVibeId = vibeId;
    }
  });
  
  // Calculate vibe strength (how confident we are about this vibe)
  // A value between 0 and 1, where higher means more confidence
  const totalScore = Object.values(vibeScores).reduce((sum, score) => sum + score, 0);
  const vibeStrength = totalScore > 0 ? vibeScores[dominantVibeId] / totalScore : 0;
  
  // Get the vibe type object
  const dominantVibe = Object.values(VIBE_TYPES).find(vibe => vibe.id === dominantVibeId) || VIBE_TYPES.NEUTRAL;
  
  return {
    ...dominantVibe,
    strength: vibeStrength
  };
};

/**
 * Detect vibe using semantic embeddings (more advanced than keyword matching)
 * Requires real API access for best results
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} - The detected vibe with confidence score
 */
export const detectVibeWithEmbeddings = async (text) => {
  try {
    if (!text || text.length < 5) return VIBE_TYPES.NEUTRAL;
    
    // Generate embedding for the text
    const textEmbedding = await generateEmbedding(text);
    
    // Vibe reference phrases to compare against
    const vibeReferences = {
      [VIBE_TYPES.FRIENDLY.id]: "This conversation is fun, friendly, and has a warm atmosphere with people joking and being kind to each other",
      [VIBE_TYPES.HELPFUL.id]: "This conversation is about helping someone, explaining things, and providing useful information and advice",
      [VIBE_TYPES.CHAOTIC.id]: "This conversation is wild, random, unpredictable with strange ideas and unexpected twists",
      [VIBE_TYPES.SERIOUS.id]: "This conversation is serious, focused on important matters, analytical and thoughtful"
    };
    
    // Generate embeddings for reference phrases
    const vibeEmbeddings = {};
    for (const [vibeId, referenceText] of Object.entries(vibeReferences)) {
      vibeEmbeddings[vibeId] = await generateEmbedding(referenceText);
    }
    
    // Calculate similarity to each vibe
    const vibeSimilarities = {};
    for (const [vibeId, vibeEmbedding] of Object.entries(vibeEmbeddings)) {
      vibeSimilarities[vibeId] = semanticSimilarity(textEmbedding, vibeEmbedding);
    }
    
    // Find the most similar vibe
    let mostSimilarVibeId = VIBE_TYPES.NEUTRAL.id;
    let highestSimilarity = 0;
    
    Object.entries(vibeSimilarities).forEach(([vibeId, similarity]) => {
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        mostSimilarVibeId = vibeId;
      }
    });
    
    // If no strong similarity, return neutral
    if (highestSimilarity < 0.3) {
      return VIBE_TYPES.NEUTRAL;
    }
    
    // Get the vibe type object
    const dominantVibe = Object.values(VIBE_TYPES).find(vibe => vibe.id === mostSimilarVibeId) || VIBE_TYPES.NEUTRAL;
    
    return {
      ...dominantVibe,
      strength: highestSimilarity
    };
  } catch (error) {
    logSafely('Error detecting vibe with embeddings', error.message);
    return detectMessageVibe(text); // Fall back to keyword matching
  }
};

/**
 * Get vibe transition for joining an existing conversation
 * @param {Object} currentVibe - The current vibe of the conversation
 * @param {string} newMessage - The new message being added
 * @returns {Object|null} - The transition effect or null if no significant change
 */
export const getVibeTransition = async (currentVibe, newMessage) => {
  if (!currentVibe || !newMessage) return null;
  
  // Detect vibe of the new message
  const newMessageVibe = config.useRealApi 
    ? await detectVibeWithEmbeddings(newMessage)
    : detectMessageVibe(newMessage);
  
  // If the vibe hasn't changed, no transition
  if (newMessageVibe.id === currentVibe.id) return null;
  
  // Calculate transition strength based on how different the vibes are
  // and how strong the new vibe is
  const transitionStrength = newMessageVibe.strength || 0.5;
  
  return {
    fromVibe: currentVibe,
    toVibe: newMessageVibe,
    strength: transitionStrength
  };
};
