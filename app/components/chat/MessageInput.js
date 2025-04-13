/**
 * Message Input Component
 * Input field for typing and sending messages
 */

import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard, Platform } from 'react-native';
import { Send } from 'lucide-react-native';

const MessageInput = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);
  
  const handleSend = () => {
    if (message.trim() === '' || disabled) return;
    
    onSend(message);
    setMessage('');
    Keyboard.dismiss();
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={1000}
          returnKeyType="default"
          keyboardAppearance="dark"
          editable={!disabled}
          onSubmitEditing={handleSend}
        />
        
        <TouchableOpacity 
          style={[styles.sendButton, message.trim() === '' || disabled ? styles.sendButtonDisabled : null]}
          onPress={handleSend}
          disabled={message.trim() === '' || disabled}
          activeOpacity={0.7}
        >
          <Send size={20} color="#FFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(18, 18, 20, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 12,
    maxHeight: 120,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3ECFB2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(62, 207, 178, 0.4)',
  },
});

export default MessageInput;
