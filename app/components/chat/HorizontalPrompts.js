/**
 * Horizontal Prompts Component
 * Horizontally scrollable quick actions/suggestions bar
 */

import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

const HorizontalPrompts = ({ prompts = [], onPromptPress }) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {prompts.map((prompt, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.promptButton}
            onPress={() => onPromptPress(prompt)}
            activeOpacity={0.8}
          >
            <Text style={styles.promptText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingLeft: 16,
    backgroundColor: 'rgba(26, 26, 30, 0.95)',
  },
  promptButton: {
    backgroundColor: 'rgba(62, 207, 178, 0.13)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(62, 207, 178, 0.17)',
  },
  promptText: {
    color: '#3ECFB2',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default HorizontalPrompts;
