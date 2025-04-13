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
        
        {/* Footer with time */}
        <View style={styles.footer}>
          <Text 
            style={[
              styles.time,
              isUser ? styles.userTime : styles.ghostTime
            ]}
          >
            {formatTimeAgo(message.timestamp)}
          </Text>
          
          {/* Memory indicator */}
          {isSavedMemory && (
            <View style={styles.memoryIndicator}>
              <Bookmark size={12} color="#3ECFB2" strokeWidth={2} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    maxWidth: '90%',
    alignSelf: 'flex-start',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  ghostContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: 'rgba(62, 207, 178, 0.12)',
    borderColor: 'rgba(62, 207, 178, 0.2)',
  },
  ghostBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
  },
  userText: {
    color: '#FFFFFF',
  },
  ghostText: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 6,
  },
  time: {
    fontSize: 11,
    opacity: 0.6,
  },
  userTime: {
    color: '#FFFFFF',
  },
  ghostTime: {
    color: '#FFFFFF',
  },
  memoryIndicator: {
    marginLeft: 5,
  }
});

export default ChatBubble;
