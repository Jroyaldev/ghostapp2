/**
 * Environment configuration for GhostMode
 * Handles environment-specific settings like API endpoints and paths
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Determine if we're in production based on the releaseChannel
// In development, releaseChannel is undefined
const getEnvironment = () => {
  const releaseChannel = Constants.expoConfig?.releaseChannel;
  
  if (releaseChannel === undefined || releaseChannel === 'development') {
    return 'development';
  }
  
  if (releaseChannel.indexOf('prod') !== -1) {
    return 'production';
  }
  
  return 'staging';
};

// Current environment
const ENV = getEnvironment();

// Configuration values for different environments
const configs = {
  development: {
    apiUrl: 'https://api.deepseek.com/v1',
    useRealApi: true,  // Set to false for mock responses
    logLevel: 'debug',
    firestorePaths: {
      userChats: (userId) => `users/${userId}/ghostchat`,
      userMemories: (userId) => `users/${userId}/memories`,
      spaces: 'spaces',
    }
  },
  staging: {
    apiUrl: 'https://api.deepseek.com/v1',
    useRealApi: true,
    logLevel: 'info',
    firestorePaths: {
      userChats: (userId) => `users/${userId}/ghostchat`,
      userMemories: (userId) => `users/${userId}/memories`,
      spaces: 'spaces',
    }
  },
  production: {
    apiUrl: 'https://api.deepseek.com/v1',
    useRealApi: true,
    logLevel: 'warn',
    firestorePaths: {
      // Production paths - change these if needed
      userChats: (userId) => `users/${userId}/chats`,
      userMemories: (userId) => `users/${userId}/memories`,
      spaces: 'spaces',
    }
  }
};

console.log(`[Environment] Running in ${ENV} mode`);

// Export the config for the current environment
export default configs[ENV];
