/**
 * Chat Bubble Component
 * Displays a single message with glassmorphic styling
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { formatTimeAgo } from '../../utils/helpers';
import { Bookmark } from 'lucide-react-native';

const ChatBubble = ({ message, onLongPress, isSavedMemory = false }) => {
  const isUser = message.isUser;
  
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onLongPress={() => onLongPress(message)}
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.ghostContainer,
      ]}
    >
      <View 
        style={[
          styles.bubble, 
          isUser ? styles.userBubble : styles.ghostBubble,
          // Add a subtle glow for saved memories
          isSavedMemory && styles.savedMemoryBubble
        ]}
      >
        {/* Message text */}
        <Text 
          style={[
            styles.text,
            isUser ? styles.userText : styles.ghostText
          ]}
        >
          {message.text}
        </Text>
        
        {/* Memory indicator only - removed timestamp */}
        {isSavedMemory && (
          <View style={styles.memoryIndicator}>
            <Bookmark size={12} color="#3ECFB2" strokeWidth={2} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4, // Consistent vertical spacing between bubbles
    maxWidth: '85%', // Slightly thinner bubbles
    alignSelf: 'flex-start',
  },
  userContainer: {
    alignSelf: 'flex-end',
    marginLeft: 'auto', // Ensure proper alignment for user messages
  },
  ghostContainer: {
    alignSelf: 'flex-start',
    marginRight: 'auto', // Ensure proper alignment for ghost messages
  },
  bubble: {
    padding: 12,
    paddingVertical: 10, // Better vertical padding
    borderRadius: 22, // Match iOS style (22px)
    borderWidth: 1,
    // Add subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: 'rgba(62, 207, 178, 0.12)',
    borderColor: 'rgba(62, 207, 178, 0.2)',
    // iOS style bubble tail for user messages
    borderBottomRightRadius: 4,
  },
  ghostBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    // iOS style bubble tail for ghost messages
    borderBottomLeftRadius: 4,
  },
  // Special styling for saved memories - subtle glow effect
  savedMemoryBubble: {
    shadowColor: '#3ECFB2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    borderColor: 'rgba(62, 207, 178, 0.3)',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.1, // Improved readability
  },
  userText: {
    color: '#FFFFFF',
  },
  ghostText: {
    color: '#FFFFFF',
  },
  memoryIndicator: {
    alignSelf: 'flex-end',
    marginTop: 6,
  }
});

export default ChatBubble;
