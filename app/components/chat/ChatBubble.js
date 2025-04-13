/**
 * Chat Bubble Component
 * Renders a single message bubble with glassmorphic styling
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatTime } from '../../utils/helpers';

const ChatBubble = ({ message, onLongPress }) => {
  const { text, isUser, timestamp } = message;
  
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onLongPress={() => onLongPress && onLongPress(message)}
      style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}
    >
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>{text}</Text>
        
        {/* Time badge */}
        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>{formatTime(timestamp)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 25, // Extra padding at bottom for time badge
  },
  userBubble: {
    backgroundColor: 'rgba(62, 207, 178, 0.15)',
    borderColor: 'rgba(62, 207, 178, 0.3)',
    borderWidth: 1,
  },
  aiBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#FFFFFF',
  },
  timeBadge: {
    position: 'absolute',
    bottom: 6,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  timeText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
  },
});

export default ChatBubble;
