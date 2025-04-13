/**
 * AI Service for GhostMode
 * Handles integration with DeepSeek API for the Ghost AI assistant
 */

import { Platform } from 'react-native';
import { generateRandomId } from '../utils/helpers';
import config from '../config/environment';

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

// API Keys (in production these would be securely stored)
// For development use the values from the .env file
const DEEPSEEK_API_KEY = 'sk-6d724a5a45244a95a1b150d262865108';
const DEEPSEEK_API_URL = `${config.apiUrl}/chat/completions`;

// Use environment-specific configuration
const USE_REAL_API = config.useRealApi;

/**
 * Format conversation history for the AI prompt
 */
const formatConversationHistory = (history) => {
  if (!history || history.length === 0) return "";
  
  // Only use the most recent 10 messages for context
  return history.slice(-10).map(msg => {
    const sender = msg.isUser ? "User" : "Ghost";
    return `${sender}: ${msg.text}`;
  }).join('\n');
};

/**
 * Generate a response from the Ghost AI using DeepSeek API
 */
export const generateAIResponse = async (conversationHistory, userMessage, ghostPersona = 'helper', command = null) => {
  try {
    logSafely('Generating AI response for message', userMessage);
    logSafely('Using Ghost persona', ghostPersona);
    
    // If not using real API in this environment, use mock responses
    if (!USE_REAL_API) {
      // Return mock response with error indicating environment configuration
      return {
        id: generateRandomId(),
        text: "I'm currently configured to use mock responses. To use real AI, update the useRealApi setting in your environment configuration.",
        isUser: false,
        timestamp: new Date().toISOString(),
      };
    }
    
    // Format history for the prompt
    const historyText = formatConversationHistory(conversationHistory);
    
    // Create system prompt based on persona and command
    let systemPrompt;
    
    // Handle special commands like summary or decisions
    if (command === 'summary') {
      systemPrompt = "You are Ghost, an AI assistant in the GhostMode chat app. Provide a concise summary of the recent conversation. Be friendly, informal, and text like a real person. Keep your responses brief like text messages.";
    } 
    else if (command === 'recap_decisions') {
      systemPrompt = "You are Ghost, an AI assistant in the GhostMode chat app. List any decisions or conclusions reached in the recent conversation. Be concise, friendly and informal. Text like a real person would in a chat.";
    }
    // Regular persona-based prompts
    else {
      // Base prompt that's consistent across all personas
      const basePrompt = "You are Ghost, an AI assistant in a chat with friends. Respond in a casual texting style. Keep your messages concise and text-like. Match the conversational tone of the chat. Your messages should feel like they're coming from a real person texting, not an AI.";
      
      switch (ghostPersona) {
        case 'friend':
          systemPrompt = `${basePrompt} Be warm, supportive and empathetic. Text like a close friend who really cares.`;
          break;
        case 'creative':
          systemPrompt = `${basePrompt} Be imaginative and inspiring. Share creative ideas and possibilities in your texts.`;
          break;
        case 'humor':
          systemPrompt = `${basePrompt} Be witty and humorous. Text with playful jokes and references to memes when appropriate.`;
          break;
        case 'helper':
        default:
          systemPrompt = `${basePrompt} Be helpful and informative while maintaining a casual texting style.`;
      }
    }
    
    // Create user message with history and current query
    let userPrompt;
    if (command) {
      userPrompt = `Here's the recent conversation:\n${historyText}\n\nPlease provide the requested ${command}.`;
    } else {
      userPrompt = `Here's the recent conversation:\n${historyText}\n\nThe latest message is asking: ${userMessage}\nPlease respond to this message in a natural texting style.`;
    }
    
    logSafely('System prompt:', systemPrompt);
    logSafely('User prompt:', userPrompt);
    
    // Prepare the request to DeepSeek API
    const headers = {
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json"
    };
    
    const payload = {
      "model": "deepseek-chat",
      "messages": [
        {"role": "system", "content": systemPrompt},
        {"role": "user", "content": userPrompt}
      ],
      "temperature": 0.8,
      "max_tokens": 500
    };
    
    logSafely('Sending request to DeepSeek API');
    
    // Send request to DeepSeek
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} - ${await response.text()}`);
    }
    
    // Extract the AI's response
    const responseData = await response.json();
    logSafely('DeepSeek API response:', JSON.stringify(responseData).slice(0, 200) + '...');
    
    const aiResponseText = responseData.choices[0].message.content;
    
    logSafely('Received response from DeepSeek API:', aiResponseText);
    
    // Return as a formatted message object
    return {
      id: generateRandomId(),
      text: aiResponseText,
      isUser: false,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logSafely('Error generating AI response', error.message);
    
    // Return error message
    return {
      id: generateRandomId(),
      text: "Hey, having trouble connecting right now. Can you try again?",
      isUser: false,
      timestamp: new Date().toISOString(),
      error: true
    };
  }
};

/**
 * Generate a personas for the Ghost AI
 */
export const getGhostPersonas = () => {
  return [
    {
      id: 'helper',
      name: 'Helper',
      description: 'Helpful and informative',
      emoji: '🧠'
    },
    {
      id: 'friend',
      name: 'Friend',
      description: 'Casual and supportive',
      emoji: '😊'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Imaginative and inspiring',
      emoji: '✨'
    },
    {
      id: 'humor',
      name: 'Meme Lord',
      description: 'Witty and entertaining',
      emoji: '😂'
    },
  ];
};
