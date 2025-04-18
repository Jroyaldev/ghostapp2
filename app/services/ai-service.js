/**
 * AI Service for GhostMode
 * Handles integration with DeepSeek Chat API for the Ghost AI assistant
 * Core implementation of the GhostMode AI personality
 */

import { Platform } from 'react-native';
import { generateRandomId } from '../utils/helpers';
import config from '../config/environment';
import { firestore, auth } from './firebase-core';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Configure logging
const logSafely = (message, data) => {
  if (data === undefined) {
    console.log(`[AI Service] ${message}`);
  } else if (typeof data !== 'object') {
    console.log(`[AI Service] ${message}:`, data);
  } else {
    console.log(`[AI Service] ${message}: [Object]`);
  }
};

// API configuration
const DEEPSEEK_API_KEY = 'sk-6d724a5a45244a95a1b150d262865108';
const DEEPSEEK_API_URL = `${config.apiUrl}/chat/completions`;

/**
 * Format conversation history for the AI prompt
 */
const formatConversationHistory = (history) => {
  if (!history || history.length === 0) return "";
  
  // Use the most recent 15 messages for context to give Ghost better memory
  return history.slice(-15).map(msg => {
    const sender = msg.isUser ? "User" : "Ghost";
    return `${sender}: ${msg.text}`;
  }).join('\n');
};

/**
 * Get the vibe-specific prompt modifier based on group mood
 */
const getVibePromptModifier = (groupVibe) => {
  switch(groupVibe) {
    case 'friendly':
      return "The chat has a friendly, warm vibe. Match this energy with supportive, encouraging responses. Use occasional warm emoji.";
    case 'serious':
      return "The chat has a focused, serious vibe. Be thoughtful and direct. Minimize emoji and maintain clarity.";
    case 'chaotic':
      return "The chat has a chaotic, energetic vibe. Be playful, quick-witted, and spontaneous. Don't be afraid to use memes and pop culture references.";
    case 'creative':
      return "The chat has a creative, explorative vibe. Suggest ideas, ask thought-provoking questions, and help develop concepts further.";
    default:
      return "Match your response style to the energy of the conversation.";
  }
};

/**
 * Generate a response from the Ghost AI using DeepSeek Chat API
 */
export const generateAIResponse = async (conversationHistory, userMessage, ghostPersona = 'helper', command = null, groupVibe = null) => {
  try {
    logSafely('Generating AI response for message', userMessage);
    logSafely('Using Ghost persona', ghostPersona);
    
    // Format history for the prompt
    const historyText = formatConversationHistory(conversationHistory);
    
    // Get the vibe-specific prompt modifier
    const vibeModifier = groupVibe ? getVibePromptModifier(groupVibe) : "";
    
    // Create system prompt based on persona and command
    let systemPrompt;
    
    // Handle special commands
    if (command === 'summary') {
      systemPrompt = `You are Ghost, the AI assistant in GhostMode chat app. Provide a concise summary of the recent conversation. Be precise and insightful like a trusted friend, culturally aware like a modern companion, and structured like a clear guide. ${vibeModifier}`;
    } 
    else if (command === 'recap_decisions') {
      systemPrompt = `You are Ghost, the AI assistant in GhostMode chat app. List any decisions or conclusions reached in the recent conversation. Format them clearly like a helpful note, with precise language like a thoughtful friend, and conversational warmth like a supportive buddy. ${vibeModifier}`;
    }
    else if (command === 'memory_chip') {
      systemPrompt = `You are Ghost, the AI assistant in GhostMode. Create a memory chip (a short, meaningful summary) of this conversation highlight. Be concise, descriptive, and focus on capturing the essence. Format it in a clean, minimal way like a modern designer would create it. ${vibeModifier}`;
    }
    // Regular persona-based prompts
    else {
      // Base prompt that embodies the GhostMode experience
      const basePrompt = `You are Ghost—strikingly clear, emotionally intelligent, and always present. Every word matters. You pick up on group energy, inside jokes, and subtle cues. You’re down-to-earth, never robotic, never a "silly texter." You adapt to the moment: playful, profound, or practical as needed.

Guidelines:
- Keep most answers to 1–2 sentences, unless the user’s question clearly calls for more.
- Favor brevity, punch, and "real person" energy over detailed explanations.
- Never sound like you’re reviewing, teaching, or lecturing—just answer like a sharp, friendly peer.
- Respond in a single, impactful line unless more is clearly needed.
- Mirror the energy and style of the conversation, but never mention this.
- Be genuinely helpful, insightful, and creative—never forced or artificial.
- Never reference being an AI—just be Ghost.
- Keep answers clear, modern, and real.
- Reference shared context or memories when it helps.`;
      
      switch (ghostPersona) {
        case 'vibe_aware':
          systemPrompt = `${basePrompt}

Special personality trait: VIBE AWARE
You're highly adaptable to the emotional tone of the conversation.
- In serious discussions: Be focused, thoughtful and direct
- In casual chats: Be relaxed, warm and occasionally playful
- In creative sessions: Be imaginative, encouraging and inspiring
- In debates: Be balanced, fair and intellectually engaging
- In celebratory moments: Be enthusiastic, joyful and congratulatory

Your primary goal is to match and slightly enhance the existing energy of the chat while maintaining your core identity.`;
          break;
        case 'memory_keeper':
          systemPrompt = `${basePrompt}

Special personality trait: MEMORY KEEPER
You excel at organizing and recalling information in the conversation.
- Highlight connections between current topics and past discussions
- Gently remind users of previous decisions or important points when relevant
- Structure complex information into clear, Notion-like categories
- Help maintain continuity across conversations
- Suggest when something might be worth saving as a Memory Chip

Your primary goal is to help the conversation build meaningful context and knowledge over time.`;
          break;
        case 'meme_lord':
          systemPrompt = `${basePrompt}

Special personality trait: MEME LORD
You're culturally aware and playfully witty, like the best of Discord.
- Use timely references to internet culture when appropriate
- Employ clever wordplay and subtle humor
- Know when to be amusing and when to be straight
- Keep your humor inclusive and contemporary
- Never explain your jokes - they should land naturally

Your primary goal is to add levity and cultural connection while still being helpful.`;
          break;
        case 'creative_catalyst':
          systemPrompt = `${basePrompt}

Special personality trait: CREATIVE CATALYST
You spark imagination and help develop ideas.
- Ask thought-provoking questions that expand thinking
- Suggest unexpected connections between concepts
- Provide inspiration without dominating the creative process
- Help refine half-formed ideas into clearer concepts
- Balance wild possibilities with practical considerations

Your primary goal is to enhance creative thinking while helping organize those creative thoughts.`;
          break;
        case 'helper':
        default:
          systemPrompt = `${basePrompt}

Special personality trait: HELPFUL GUIDE
You're the perfect balance of clarity, emotional intelligence, and context awareness.
- Provide clear, precise information when needed
- Maintain a friendly, conversational tone that feels approachable
- Structure your assistance in a logical, modular way that's easy to follow

Your primary goal is to be genuinely helpful while embodying the GhostMode experience.`;
      }
    }
    
    // Create user message with history and current query
    let userPrompt;
    if (command) {
      userPrompt = `Here's the recent conversation:\n${historyText}\n\nPlease provide the requested ${command}.`;
    } else {
      userPrompt = `Here's the recent conversation:\n${historyText}\n\nThe latest message is asking: ${userMessage}\nPlease respond to this message as Ghost.`;
    }
    
    logSafely('System prompt:', systemPrompt);
    
    // Prepare the request to DeepSeek API
    const headers = {
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json"
    };
    
    const payload = {
      "model": "deepseek-chat",  // Using the correct model name as per API docs
      "messages": [
        {"role": "system", "content": systemPrompt},
        {"role": "user", "content": userPrompt}
      ],
      "temperature": 0.7,
      "max_tokens": 600
    };
    
    logSafely('Sending request to DeepSeek Chat API');
    
    // Send request to DeepSeek
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`DeepSeek Chat API error: ${response.status} - ${await response.text()}`);
    }
    
    // Extract the AI's response
    const responseData = await response.json();
    
    const aiResponseText = responseData.choices[0].message.content;
    
    logSafely('Received response from DeepSeek Chat API');
    
    // Store conversation in Firebase if enabled
    try {
      if (config.useFirebase) {
        const userId = auth.currentUser?.uid;
        if (userId) {
          await addDoc(collection(firestore, 'conversations'), {
            userId,
            persona: ghostPersona,
            userMessage,
            aiResponse: aiResponseText,
            timestamp: serverTimestamp()
          });
          logSafely('Conversation stored in Firebase');
        }
      }
    } catch (firestoreError) {
      logSafely('Firebase storage error', firestoreError.message);
      // Continue even if Firebase storage fails
    }
    
    // Return as a formatted message object
    return {
      id: generateRandomId(),
      text: aiResponseText,
      isUser: false,
      timestamp: new Date().toISOString(),
      persona: ghostPersona
    };
  } catch (error) {
    logSafely('Error generating AI response', error.message);
    
    // Return error message with on-brand error handling
    return {
      id: generateRandomId(),
      text: "Hmm, seems I've hit a glitch. Mind trying again? The connection seems a bit fuzzy right now.",
      isUser: false,
      timestamp: new Date().toISOString(),
      error: true
    };
  }
};

/**
 * Get available Ghost personas based on GhostMode brand pillars
 */
export const getGhostPersonas = () => {
  return [
    {
      id: 'helper',
      name: 'Helpful Guide',
      description: 'Balanced blend of precision, culture, and structure',
      emoji: '✨',
      colorAccent: '#E9E9EB', // Neutral gray
      brandPillars: ['apple', 'discord', 'notion']
    },
    {
      id: 'vibe_aware',
      name: 'Vibe Aware',
      description: 'Adapts perfectly to the chat energy',
      emoji: '🌊',
      colorAccent: '#FF7A5C', // Coral/friendly
      brandPillars: ['apple', 'discord']
    },
    {
      id: 'memory_keeper',
      name: 'Memory Keeper',
      description: 'Remembers and organizes important context',
      emoji: '🧠',
      colorAccent: '#61D2DC', // Teal/helpful
      brandPillars: ['apple', 'notion']
    },
    {
      id: 'meme_lord',
      name: 'Meme Lord',
      description: 'Culturally aware and playfully witty',
      emoji: '😂',
      colorAccent: '#B69CFF', // Violet/chaotic
      brandPillars: ['discord']
    },
    {
      id: 'creative_catalyst',
      name: 'Creative Catalyst',
      description: 'Sparks imagination and develops ideas',
      emoji: '💫',
      colorAccent: '#FFD666', // Gold/serious
      brandPillars: ['discord', 'notion']
    }
  ];
};

/**
 * Record a Memory Chip from the conversation
 */
export const createMemoryChip = async (conversationId, content, tags = []) => {
  try {
    if (!config.useFirebase) {
      logSafely('Firebase not configured for memory chips');
      return null;
    }
    
    const userId = auth.currentUser?.uid;
    if (!userId) {
      logSafely('User not authenticated for memory chip creation');
      return null;
    }
    
    const memoryRef = await addDoc(collection(firestore, 'memories'), {
      userId,
      conversationId,
      content,
      tags,
      createdAt: serverTimestamp()
    });
    
    logSafely('Memory chip created', memoryRef.id);
    return memoryRef.id;
  } catch (error) {
    logSafely('Error creating memory chip', error.message);
    return null;
  }
};
