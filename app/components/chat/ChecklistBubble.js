/**
 * Checklist Bubble Component
 * Displays a checklist as a chat bubble
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ChecklistBubble = ({ items = [], onToggle, isUser }) => {
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.ghostBubble]}>
      {items.map((item, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.itemRow}
          onPress={() => onToggle(idx)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, item.checked && styles.checkedBox]}>
            {item.checked && <View style={styles.checkmark} />}
          </View>
          <Text style={[styles.itemText, item.checked && styles.checkedText]}>{item.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    padding: 14,
    paddingVertical: 12, 
    borderRadius: 22, 
    borderWidth: 1,
    marginVertical: 4, 
    maxWidth: '85%', 
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: 'rgba(62, 207, 178, 0.12)',
    borderColor: 'rgba(62, 207, 178, 0.2)',
    alignSelf: 'flex-end',
    marginLeft: 'auto', 
    borderBottomRightRadius: 4,
  },
  ghostBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignSelf: 'flex-start',
    marginRight: 'auto', 
    borderBottomLeftRadius: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, 
    paddingVertical: 2, 
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#3ECFB2',
    marginRight: 10,
    backgroundColor: 'rgba(62, 207, 178, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#3ECFB2',
    borderColor: '#3ECFB2',
  },
  checkmark: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  itemText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22, 
    letterSpacing: 0.1, 
  },
  checkedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});

export default ChecklistBubble;
