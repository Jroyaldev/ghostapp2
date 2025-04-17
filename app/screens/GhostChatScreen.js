/**
 * Ghost Chat Screen
 * Main interface for interacting with the Ghost AI assistant
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Pressable,
  TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GhostIcon, ArrowLeft, Settings, Star, Bookmark, Copy, Share2, Trash2, Camera, Plus, MoreHorizontal, Send, ArrowUp, MessageCircle } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// Components
import ChatBubble from '../components/chat/ChatBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import ChecklistBubble from '../components/chat/ChecklistBubble';
import PromptBanner from '../components/chat/PromptBanner';

// Services and Utilities
import { generateAIResponse, getGhostPersonas } from '../services/ai-service';
import { saveMessage, getMessages } from '../services/chat-service';
import { saveMemory } from '../services/memory-service';
import { generateRandomId, formatDate } from '../utils/helpers';
import { auth } from '../services/firebase';
import { generateSuggestions, getDefaultSuggestions } from '../services/openrouter-service';

// Initial welcome message from Ghost
const WELCOME_MESSAGE = {
  id: 'welcome',
  text: "Hi there! I'm your Ghost. What would you like to talk about today?",
  isUser: false,
  timestamp: new Date().toISOString(),
};

const GhostChatScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentPersona, setCurrentPersona] = useState(getGhostPersonas()[0]);
  const [savedMemoryIds, setSavedMemoryIds] = useState([]); // Track which messages are saved as memories
  const [suggestions, setSuggestions] = useState(getDefaultSuggestions());
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [newSuggestionsAdded, setNewSuggestionsAdded] = useState(false);
  const listRef = useRef(null);
  const ghostOpacity = useRef(new Animated.Value(0)).current;
  const [messageOptions, setMessageOptions] = useState({ visible: false, message: null });
  
  // Create animation values for suggestions
  const suggestionsAnimValues = useRef(Array(5).fill(0).map(() => new Animated.Value(0))).current;

  // Fade in animation for ghost icon
  useEffect(() => {
    Animated.timing(ghostOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
  }, []);
  
  // Animation for suggestions
  useEffect(() => {
    if (suggestions.length > 0 && newSuggestionsAdded) {
      // Reset animation values if needed
      suggestionsAnimValues.forEach(anim => anim.setValue(0));
      
      // Create staggered animations for each suggestion
      suggestions.forEach((_, index) => {
        if (index < suggestionsAnimValues.length) {
          Animated.sequence([
            Animated.delay(index * 100),
            Animated.spring(suggestionsAnimValues[index], {
              toValue: 1,
              tension: 50,
              friction: 7,
              useNativeDriver: true
            })
          ]).start();
        }
      });
      
      setNewSuggestionsAdded(false);
    }
  }, [suggestions, newSuggestionsAdded]);

  // Load messages from Firebase on mount
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setIsInitializing(true);

      // Get the current user
      const user = auth.currentUser;
      if (!user) {
        console.log('No user is signed in');
        setIsInitializing(false);
        return;
      }

      // Get messages from Firebase
      const { messages: loadedMessages, error } = await getMessages(user.uid);

      if (error) {
        console.error('Error loading messages:', error);
        setIsInitializing(false);
        return;
      }

      // If messages exist, use them, otherwise keep welcome message
      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
      }

      // Scroll to bottom after loading messages
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Error in loadMessages:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  // Function to handle saving a message as a memory
  const handleSaveMemory = async (message, customTags = []) => {
    try {
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You need to be signed in to save memories');
        return;
      }

      // Save the message as a memory
      const { success, memoryId, tags, error } = await saveMemory(user.uid, message, customTags);

      if (success) {
        // Add to saved memory IDs
        setSavedMemoryIds(prev => [...prev, message.id]);

        // Show success animation and feedback
        Alert.alert(
          'Memory Saved', 
          tags && tags.length > 0 ?
            `This message has been saved to your memories with tags: ${tags.map(t => '#' + t).join(', ')}` :
            'This message has been saved to your memories.'
        );
      } else {
        Alert.alert('Error', error || 'Failed to save memory');
      }
    } catch (error) {
      console.error('Error saving memory:', error);
      Alert.alert('Error', 'An unexpected error occurred while saving the memory.');
    }
  };

  // Function to handle message option selection on long press
  const handleMessageOptions = (message) => {
    setMessageOptions({ visible: true, message });
  };

  const handleOptionPress = async (option) => {
    const { message } = messageOptions;
    if (!message) return;
    if (option === 'copy') {
      await Clipboard.setStringAsync(message.text);
      Alert.alert('Copied', 'Message copied to clipboard');
    } else if (option === 'delete') {
      // Soft delete: remove from UI and optionally from Firebase
      setMessages(prev => prev.filter(m => m.id !== message.id));
      // Optionally: await deleteMessageFromFirebase(message.id)
    } else if (option === 'save') {
      handleSaveMemory(message);
    }
    setMessageOptions({ visible: false, message: null });
  };

  // Checklist toggle handler
  const handleToggleChecklist = (msgId, idx) => {
    setChecklistMessages(prev => prev.map(msg =>
      msg.id === msgId
        ? { ...msg, items: msg.items.map((item, i) => i === idx ? { ...item, checked: !item.checked } : item) }
        : msg
    ));
  };

  // Function to fetch new suggestions based on message context
  const fetchSuggestions = async () => {
    try {
      // Clear existing suggestions while fetching new ones
      setSuggestions([]);
      setIsFetchingSuggestions(true);
      
      // Get the last few messages for context
      const recentMessages = messages.slice(-5).map(msg => ({
        text: msg.text,
        isUser: msg.isUser
      }));
      
      // Generate suggestions based on conversation context
      const newSuggestions = await generateSuggestions(recentMessages);
      
      // Update suggestions state with new suggestions
      setSuggestions(newSuggestions);
      setNewSuggestionsAdded(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // If there's an error, set default suggestions
      setSuggestions(getDefaultSuggestions());
      setNewSuggestionsAdded(true);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  // Fetch suggestions when messages change, but only after AI responses
  useEffect(() => {
    if (messages.length > 1) {
      // Check if the last message is from the AI
      const latestMessage = messages[messages.length - 1];
      
      if (!latestMessage.isUser && !latestMessage.isTyping) {
        // Small delay to make sure the message is fully processed
        const timer = setTimeout(() => {
          fetchSuggestions();
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [messages]);

  // Function to handle sending a new message
  const handleSendMessage = async (text) => {
    // Get current user
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You need to be signed in to send messages');
      return;
    }

    if (!text || text.trim() === '') return;
    
    // Hide suggestions immediately when sending a message
    setSuggestions([]);
    
    // Create user message
    const userMessage = {
      id: generateRandomId(),
      text,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    // Clear input field if the message was typed
    setInputText('');

    // Update messages state with user message
    setMessages(prevMessages => [...prevMessages, userMessage]);

    // Save user message to Firebase
    const { success, error } = await saveMessage(user.uid, userMessage);
    if (!success) {
      console.error('Failed to save user message:', error);
    }

    // Scroll to bottom
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Create a placeholder message with typing indicator
    const typingMessageId = generateRandomId();
    const typingMessage = {
      id: typingMessageId,
      isUser: false,
      isTyping: true,
      timestamp: new Date().toISOString(),
    };

    // Add typing indicator message
    setMessages(prevMessages => [...prevMessages, typingMessage]);

    // Start loading state
    setIsLoading(true);

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(
        [...messages, userMessage],
        text,
        currentPersona.id
      );

      // Replace typing indicator with actual response
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === typingMessageId ? { ...aiResponse, id: typingMessageId } : msg
        )
      );

      // Save AI response to Firebase
      const { success: aiSuccess, error: aiError } = await saveMessage(user.uid, aiResponse);
      if (!aiSuccess) {
        console.error('Failed to save AI response:', aiError);
      }

      // Scroll to bottom again
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator if there's an error
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== typingMessageId)
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Render message bubbles, checklist, and highlight/summarize UI with final polish
  const renderItem = ({ item, index }) => {
    const isUser = item.isUser;
    // Only mark as error if explicitly flagged in the message data
    const isError = item.isError === true;
    
    // Typing indicator inside a chat bubble that will be replaced with the actual message
    if (item.isTyping) {
      return (
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderWidth: 1,
          borderRadius: 22, // Match iOS style
          paddingVertical: 14,
          paddingHorizontal: 16,
          marginVertical: 4,
          maxWidth: '85%',
          alignSelf: 'flex-start',
          marginRight: 'auto',
          borderBottomLeftRadius: 4, // iOS style bubble tail
          // Add subtle shadow for depth
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 1,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <TypingIndicator />
            <Text style={{
              color: '#FFFFFF',
              fontSize: 15,
              marginLeft: 10,
              opacity: 0.7,
            }}>
              Ghost is typing...
            </Text>
          </View>
        </View>
      );
    }
    
    // Checklist message handling with improved styling
    if (item.type === 'checklist') {
      return (
        <ChecklistBubble
          items={item.items}
          isUser={item.isUser}
          onToggle={idx => handleToggleChecklist(item.id, idx)}
          style={{
            backgroundColor: isUser 
              ? 'rgba(62,207,178,0.15)' 
              : 'rgba(42,44,60,0.95)',
            borderRadius: 26,
            marginVertical: 10,
            shadowColor: isUser ? '#3ECFB2' : '#fff',
            shadowOpacity: isUser ? 0.15 : 0.05,
            shadowRadius: 14,
            elevation: 3,
            borderWidth: 1,
            borderColor: isUser 
              ? 'rgba(62,207,178,0.25)' 
              : 'rgba(255,255,255,0.10)',
            padding: 16,
          }}
        />
      );
    }
    
    // Highlighted message with enhanced visuals
    if (item.highlight) {
      return (
        <View style={{ 
          marginVertical: 10,
          shadowColor: '#3ECFB2',
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 5,
        }}>
          <ChatBubble
            message={item}
            isUser={isUser}
            onLongPress={handleMessageOptions}
            isSavedMemory={savedMemoryIds.includes(item.id)}
            style={{
              backgroundColor: isUser 
                ? 'rgba(62,207,178,0.25)' 
                : 'rgba(42,44,60,0.95)',
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: '#3ECFB2',
              marginVertical: 2,
              padding: 16,
              maxWidth: '88%',
              minWidth: 120,
              alignSelf: isUser ? 'flex-end' : 'flex-start',
            }}
            textStyle={{
              fontFamily: 'System',
              fontWeight: '500',
              fontSize: 16.5,
              color: isUser ? '#1A1A1E' : '#fff',
              lineHeight: 24,
              letterSpacing: 0.1,
            }}
            timestampStyle={{
              fontSize: 11.5,
              fontWeight: '500',
              color: isUser ? 'rgba(30,30,36,0.5)' : 'rgba(255,255,255,0.45)',
              marginTop: 6,
              alignSelf: isUser ? 'flex-end' : 'flex-start',
            }}
            fadeIn
          />
        </View>
      );
    }
    
    // Error message styling
    if (isError) {
      return (
        <View style={{
          backgroundColor: 'rgba(42,44,60,0.95)',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: 'rgba(255,70,70,0.25)',
          marginVertical: 10,
          padding: 16,
          maxWidth: '88%',
          shadowColor: '#ff4d4d',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
          alignSelf: isUser ? 'flex-end' : 'flex-start',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ 
              width: 22, 
              height: 22, 
              borderRadius: 11, 
              backgroundColor: 'rgba(255,70,70,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              borderWidth: 1,
              borderColor: 'rgba(255,70,70,0.25)'
            }}>
              <Text style={{ color: '#ff4d4d', fontSize: 14, fontWeight: 'bold' }}>!</Text>
            </View>
            <Text style={{ 
              color: '#ff6b6b', 
              fontSize: 14.5, 
              fontWeight: '600',
              letterSpacing: 0.2
            }}>
              Error Message
            </Text>
          </View>
          <Text style={{
            fontFamily: 'System',
            fontSize: 15.5,
            color: '#fff',
            lineHeight: 22,
            opacity: 0.9,
            letterSpacing: 0.1,
          }}>
            {item.text}
          </Text>
          <Text style={{
            fontSize: 11.5,
            fontWeight: '500',
            color: 'rgba(255,255,255,0.45)',
            marginTop: 6,
            alignSelf: 'flex-start',
          }}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
      );
    }
    
    // Standard message with premium gradient styling
    return (
      <ChatBubble
        message={item}
        isUser={isUser}
        onLongPress={handleMessageOptions}
        isSavedMemory={savedMemoryIds.includes(item.id)}
        style={{
          backgroundColor: isUser 
            ? 'rgba(62,207,178,0.20)' 
            : 'rgba(35,37,46,0.70)',
          borderRadius: 24,
          marginVertical: 10,
          shadowColor: isUser ? '#3ECFB2' : '#fff',
          shadowOpacity: isUser ? 0.12 : 0.05,
          shadowRadius: 12,
          elevation: 3,
          borderWidth: 1,
          borderColor: isUser 
            ? 'rgba(62,207,178,0.22)' 
            : 'rgba(255,255,255,0.08)',
          padding: 16,
          maxWidth: '88%',
          minWidth: 60,
          alignSelf: isUser ? 'flex-end' : 'flex-start',
        }}
        textStyle={{
          fontFamily: 'System',
          fontWeight: '500',
          fontSize: 16.5,
          color: isUser ? '#1A1A1E' : '#fff',
          lineHeight: 24,
          letterSpacing: 0.1,
        }}
        timestampStyle={{
          fontSize: 11.5,
          fontWeight: '500',
          color: isUser ? 'rgba(30,30,36,0.5)' : 'rgba(255,255,255,0.45)',
          marginTop: 5,
          alignSelf: isUser ? 'flex-end' : 'flex-start',
        }}
        fadeIn
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <LinearGradient
        colors={['#121214', '#17171A']}
        style={{ flex: 1 }}
      >
        <StatusBar barStyle="light-content" />
        
        {/* Header with improved opacity and reduced height */}
        <BlurView 
          intensity={80} 
          tint="dark" 
          style={[
            { 
              paddingTop: insets.top, 
              paddingBottom: 8,
              backgroundColor: 'rgba(18, 18, 20, 0.95)', // Increased opacity for better readability
            }
          ]}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft color="#3ECFB2" size={20} />
            </TouchableOpacity>
            
            {/* Thinner hero banner with horizontal layout */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 6, // Reduced vertical space
            }}>
              <View style={styles.logoHeroGlow}>
                <Image 
                  source={require('../../assets/logo-ghostmode.png')} 
                  style={{ 
                    width: 38, 
                    height: 38, 
                    resizeMode: 'contain',
                    alignSelf: 'center',
                  }} 
                />
              </View>
              <Text style={styles.headerTitle}>Ghost Chat</Text>
            </View>
            
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Settings color="#3ECFB2" size={20} />
            </TouchableOpacity>
          </View>
        </BlurView>
        
        {/* Main chat area with proper padding to avoid extending under navigation */}
        <View style={{ flex: 1 }}>
          {/* Messages FlatList */}
          <FlatList
            ref={listRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              paddingHorizontal: 16, 
              paddingTop: 16,
              paddingBottom: 8, // Reduced padding to prevent gap
            }}
            onContentSizeChange={() => {
              if (!isInitializing) {
                listRef.current?.scrollToEnd({ animated: true });
              }
            }}
            refreshControl={
              <RefreshControl
                refreshing={isInitializing}
                onRefresh={loadMessages}
                tintColor="#3ECFB2"
                colors={['#3ECFB2']}
              />
            }
          />
          
          {/* Suggestions with improved design and animations */}
          {(suggestions.length > 0 || isFetchingSuggestions) && (
            <View style={{ 
              backgroundColor: 'rgba(18, 18, 20, 0.92)', // Increased opacity
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.08)', // Consistent border color
            }}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12 }}
              >
                {isFetchingSuggestions ? (
                  // Loading animation for suggestions
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(62, 207, 178, 0.1)',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    marginRight: 8,
                    marginVertical: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(62, 207, 178, 0.2)',
                  }}>
                    <ActivityIndicator size="small" color="#3ECFB2" style={{ marginRight: 8 }} />
                    <Text style={{ 
                      color: '#fff', 
                      fontSize: 14,
                      fontWeight: '500',
                    }}>
                      Thinking...
                    </Text>
                  </View>
                ) : (
                  // Animated suggestion pills
                  suggestions.map((suggestion, index) => (
                    <Animated.View
                      key={index}
                      style={{
                        opacity: index < suggestionsAnimValues.length ? suggestionsAnimValues[index] : 1,
                        transform: [
                          { 
                            translateY: index < suggestionsAnimValues.length ? 
                              suggestionsAnimValues[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [10, 0]
                              }) : 0
                          },
                          { 
                            scale: index < suggestionsAnimValues.length ? 
                              suggestionsAnimValues[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.9, 1]
                              }) : 1
                          }
                        ]
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          backgroundColor: 'rgba(62, 207, 178, 0.15)', // Slightly increased opacity
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 20,
                          marginRight: 8,
                          marginVertical: 8,
                          borderWidth: 1,
                          borderColor: 'rgba(62, 207, 178, 0.25)', // Increased opacity for better visibility
                          // Add shadow for depth
                          shadowColor: '#3ECFB2',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                        onPress={() => handleSendMessage(suggestion)}
                        activeOpacity={0.7}
                      >
                        <Text style={{ 
                          color: '#fff', 
                          fontSize: 14,
                          fontWeight: '500', // Slightly bolder for better readability
                        }}>
                          {suggestion}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  ))
                )}
              </ScrollView>
            </View>
          )}
          
          {/* Input area with pill-shaped design - fixed positioning to bottom with curved edges */}
          <View style={[
            styles.inputContainer,
            { paddingBottom: insets.bottom === 0 ? 12 : insets.bottom + 4 } // Proper bottom padding
          ]}>
            <TouchableOpacity
              style={styles.attachmentButton}
            >
              <Plus color="#3ECFB2" size={20} />
            </TouchableOpacity>
            
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Message Ghost..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={inputText}
                onChangeText={setInputText}
                multiline
                onFocus={() => {
                  // Add subtle animation when input is focused
                  Animated.timing(ghostOpacity, {
                    toValue: 0.8,
                    duration: 200,
                    useNativeDriver: true
                  }).start();
                }}
                onBlur={() => {
                  // Restore opacity when input loses focus
                  Animated.timing(ghostOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true
                  }).start();
                }}
              />
              
              <TouchableOpacity
                disabled={!inputText.trim() || isLoading}
                onPress={() => handleSendMessage(inputText)}
                style={[
                  styles.sendButton,
                  { opacity: !inputText.trim() || isLoading ? 0.5 : 1 }
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Send color="#000" size={18} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Message options modal */}
        {messageOptions.visible && (
          <BlurView 
            intensity={80} 
            tint="dark" 
            style={styles.optionsOverlay}
            onTouchEnd={() => setMessageOptions({ visible: false, message: null })}
          >
            <View style={styles.optionsSheet}>
              <TouchableOpacity 
                style={styles.optionBtn} 
                onPress={() => handleOptionPress('copy')}
              >
                <Copy size={18} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.optionText}>Copy Text</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.optionBtn, {
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                }]} 
                onPress={() => handleOptionPress('delete')}
              >
                <Trash2 size={18} color="#ff4d4d" style={{ marginRight: 10 }} />
                <Text style={[styles.optionText, { color: '#ff4d4d', letterSpacing: 0.2 }]}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.optionBtn, {
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                }]} 
                onPress={() => handleOptionPress('save')}
              >
                <Star size={18} color="#FECF4F" style={{ marginRight: 10 }} />
                <Text style={[styles.optionText, { letterSpacing: 0.2 }]}>Save as Memory</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.optionBtn, { 
                  justifyContent: 'center', 
                  borderBottomWidth: 0,
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                }]} 
                onPress={() => setMessageOptions({ visible: false, message: null })}
              >
                <Text style={[styles.optionText, { 
                  color: 'rgba(255,255,255,0.5)', 
                  fontWeight: '600',
                  letterSpacing: 0.2,
                }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        )}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

// Enhanced Styles for Editor's Choice UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    height: 60, // Fixed height for header
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(62,207,178,0.15)', // Increased opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  logoHeroGlow: {
    width: 44, // Smaller logo
    height: 44, // Smaller logo
    borderRadius: 22,
    backgroundColor: 'rgba(32,32,40,0.75)', // Increased opacity
    shadowColor: '#3ECFB2',
    shadowOpacity: 0.30,
    shadowRadius: 20,
    alignSelf: 'center',
    marginRight: 10, // Add margin for horizontal layout
    justifyContent: 'center', // Center the logo
    alignItems: 'center', // Center the logo
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },
  // Input area styling
  inputContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(18, 18, 20, 0.98)', // Increased opacity for better readability
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)', // Consistent border color
    // Curved edges that match device screen curvature
    borderTopLeftRadius: Platform.OS === 'ios' ? 42 : 38,
    borderTopRightRadius: Platform.OS === 'ios' ? 42 : 38,
    // Add shadow for better visual separation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15, // Increased shadow opacity
    shadowRadius: 4,
    elevation: 4,
  },
  attachmentButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Increased opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Increased opacity
    borderRadius: 24, // Pill-shaped
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Increased opacity for better visibility
  },
  textInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8, // Center text vertically
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3ECFB2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Options Modal Styling
  optionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)', // Increased opacity
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  optionsSheet: {
    backgroundColor: 'rgba(40,40,48,0.98)', // Increased opacity
    borderRadius: 20,
    padding: 18,
    width: '80%',
    maxWidth: 300,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', // Increased opacity
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)', // Increased opacity
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default GhostChatScreen;
