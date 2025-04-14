/**
 * Space Chat Screen
 * Allows users to chat within a space with real-time vibe detection
 * Combines Discord's community feel with Apple's precision
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  StatusBar,
  Animated,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Users, Send, Smile, Info, Settings, Link, MessageCircle, Ghost } from 'lucide-react-native';

// Services
import { getSpaceMessages, sendMessageToSpace, getUserSpaces } from '../services/spaces-service';
import { VIBE_TYPES, detectMessageVibe, getVibeTransition } from '../services/vibe-service';
import { generateRandomId, formatTimeAgo } from '../utils/helpers';
import { auth } from '../services/firebase';
import { generateAIResponse } from '../services/ai-service'; // Import AI service

// Components
import VibeRing from '../components/spaces/VibeRing';

const SpaceChatScreen = ({ navigation, route }) => {
  const { spaceId } = route.params;
  const insets = useSafeAreaInsets();
  
  // State
  const [space, setSpace] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentVibe, setCurrentVibe] = useState(VIBE_TYPES.NEUTRAL);
  
  // Refs
  const listRef = useRef(null);
  const vibeTransitionAnim = useRef(new Animated.Value(0)).current;
  
  // Load space and messages when component mounts
  useEffect(() => {
    loadSpace();
    loadMessages();
    
    // Set up a periodic refresh
    const refreshInterval = setInterval(() => {
      loadMessages(false);
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(refreshInterval);
  }, [spaceId]);
  
  // Function to load space data
  const loadSpace = async () => {
    try {
      // For now, we'll get the space data from the messages
      // In a real app, you would fetch the space details directly
      const { spaces } = await getUserSpaces();
      const spaceData = spaces.find(s => s.id === spaceId);
      
      if (spaceData) {
        setSpace(spaceData);
        setCurrentVibe(spaceData.currentVibe || VIBE_TYPES.NEUTRAL);
      }
    } catch (error) {
      console.error('Error loading space:', error);
    }
  };
  
  // Function to load messages
  const loadMessages = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const { messages: loadedMessages, error } = await getSpaceMessages(spaceId);
      
      if (error) {
        console.error('Error loading messages:', error);
      } else {
        // Process loaded messages to ensure Ghost messages are properly marked
        const processedMessages = loadedMessages?.map(msg => {
          // Ensure Ghost messages have consistent identification
          if (msg.userId === 'ghost' || msg.userName === 'Ghost') {
            return {
              ...msg,
              isGhost: true, // Ensure isGhost flag is set
              userId: 'ghost' // Ensure userId is consistent
            };
          }
          return msg;
        }) || [];
        
        setMessages(processedMessages);
        
        // Update vibe based on messages
        if (processedMessages && processedMessages.length > 0) {
          // Get the current vibe from the latest messages
          const spaceVibe = processedMessages[processedMessages.length - 1].currentVibe || VIBE_TYPES.NEUTRAL;
          setCurrentVibe(spaceVibe);
        }
        
        // Scroll to bottom
        setTimeout(() => {
          listRef.current?.scrollToEnd({ animated: false });
        }, 100);
      }
    } catch (error) {
      console.error('Error in loadMessages:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };
  
  // Function to handle sending a message
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    // Store the message text for processing
    const sentText = messageText.trim();
    
    // Clear input immediately for better UX
    setMessageText('');
    
    try {
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You need to be signed in to send messages');
        return;
      }
      
      // Create message object
      const userMessage = {
        id: generateRandomId(),
        text: sentText,
        userId: user.uid,
        userName: user.displayName || 'You',
        userPhotoURL: user.photoURL,
        timestamp: new Date().toISOString(),
      };
      
      // Detect vibe
      const messageVibe = detectMessageVibe(sentText);
      userMessage.vibe = messageVibe.id;
      
      // Add user message to UI immediately (optimistic)
      setMessages(current => [...current, userMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 10);
      
      // Check if message mentions @ghost
      const mentionsGhost = sentText.toLowerCase().includes('@ghost');
      
      // Send message to backend in background
      sendMessageToSpace(spaceId, userMessage)
        .then(({ success }) => {
          if (!success) {
            console.log('Message sent to UI but failed to save to backend');
          }
        })
        .catch(error => {
          console.error('Error sending message to backend:', error);
        });
      
      // Handle Ghost response if mentioned
      if (mentionsGhost) {
        // Add typing indicator
        const typingId = generateRandomId();
        const ghostTyping = {
          id: typingId,
          isGhostTyping: true,
          timestamp: new Date().toISOString()
        };
        
        // Show Ghost typing
        setMessages(current => [...current, ghostTyping]);
        
        // Scroll to typing indicator
        setTimeout(() => {
          listRef.current?.scrollToEnd({ animated: true });
        }, 10);
        
        // Start the typing indicator animation
        const typingAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(vibeTransitionAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true
            }),
            Animated.timing(vibeTransitionAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true
            })
          ])
        );
        typingAnimation.start();
        
        // Wait a bit to simulate AI thinking
        setTimeout(async () => {
          // Stop the typing animation
          typingAnimation.stop();
          
          try {
            // Create conversation history format for AI context
            const recentMessages = messages.slice(-10).map(msg => ({
              text: msg.text,
              isUser: msg.userId !== 'ghost'
            }));
            
            // Generate Ghost response using AI service
            const ghostResponseObj = await generateAIResponse(
              recentMessages,
              sentText,
              'helper', // Default persona
              null,     // No special command
              currentVibe?.id || 'neutral' // Current space vibe
            );
            
            // Create Ghost message object with clear identification
            const ghostMessage = {
              id: generateRandomId(),
              text: ghostResponseObj.text,
              userId: 'ghost', // Essential for identification
              userName: 'Ghost',
              isGhost: true,   // Redundant but ensures proper identification
              ghostMessage: true, // Additional flag for safety
              timestamp: new Date().toISOString(),
              vibe: messageVibe.id
            };
            
            // Remove typing indicator and add AI response
            setMessages(current => 
              current.filter(m => m.id !== typingId).concat([ghostMessage])
            );
            
            // Try to also save Ghost response to the backend in background
            // Add extra properties to ensure it's identified as a Ghost message
            const serverGhostMessage = {
              ...ghostMessage,
              // These flags ensure proper identification even after server verification
              userId: 'ghost',
              isGhost: true,
              ghostMessage: true
            };
            
            sendMessageToSpace(spaceId, serverGhostMessage)
              .catch(ghostSendError => {
                console.error('Failed to save Ghost response to backend:', ghostSendError);
              });
            
            // Scroll to show Ghost response
            setTimeout(() => {
              listRef.current?.scrollToEnd({ animated: true });
            }, 10);
            
          } catch (aiError) {
            console.error('Error generating Ghost response:', aiError);
            
            // Remove typing indicator and add error response
            setMessages(current => 
              current.filter(m => m.id !== typingId).concat([
                {
                  id: generateRandomId(),
                  text: "I'm having trouble connecting right now. Please try again in a moment.",
                  userId: 'ghost',
                  userName: 'Ghost',
                  isGhost: true,
                  ghostMessage: true,
                  timestamp: new Date().toISOString(),
                  vibe: VIBE_TYPES.NEUTRAL.id
                }
              ])
            );
          }
        }, 2000); // Slightly longer typing animation for more natural feel
      }
      
      // Update vibe if needed - do this in background
      getVibeTransition(currentVibe, sentText)
        .then(transition => {
          if (transition && transition.to !== currentVibe) {
            setCurrentVibe(transition.to);
          }
        })
        .catch(vibeError => {
          console.error('Error updating vibe:', vibeError);
        });
      
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  // Function to render a message
  const renderMessage = ({ item }) => {
    // Handle Ghost typing indicator
    if (item.isGhostTyping) {
      // Apple-style typing indicator
      return (
        <View style={[styles.messageContainer, styles.otherMessageContainer]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.defaultAvatar, { backgroundColor: '#3ECFB2' }]}>
              <Ghost size={16} color="#121214" strokeWidth={1.5} />
            </View>
          </View>
          <View style={[styles.messageBubble, styles.ghostBubble, styles.typingBubble]}>
            <View style={styles.appleTypingContainer}>
              <Animated.View 
                style={[
                  styles.appleTypingDot, 
                  { opacity: vibeTransitionAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.4, 1, 0.4]
                  }) }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.appleTypingDot, 
                  { opacity: vibeTransitionAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.4, 1, 0.4]
                  }), 
                  marginLeft: 3,
                  marginRight: 3 }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.appleTypingDot, 
                  { opacity: vibeTransitionAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.4, 1, 0.4]
                  }) }
                ]} 
              />
            </View>
          </View>
        </View>
      );
    }
    
    // Determine message type with multiple redundant checks for safety
    const isCurrentUser = item.userId === auth.currentUser?.uid;
    // Enhanced Ghost detection with multiple checks
    const isGhost = Boolean(
      item.userId === 'ghost' || 
      item.isGhost === true || 
      item.ghostMessage === true || 
      item.userName === 'Ghost'
    );
    const isSystem = item.userId === 'system';
    
    // Force user messages to right, Ghost messages to left
    const messageContainerStyle = isCurrentUser 
      ? styles.userMessageContainer 
      : isGhost 
        ? styles.otherMessageContainer 
        : styles.otherMessageContainer;
    
    return (
      <View style={[styles.messageContainer, messageContainerStyle]}>
        {!isCurrentUser && (
          <View style={styles.avatarContainer}>
            {item.userPhotoURL ? (
              <Image source={{ uri: item.userPhotoURL }} style={styles.avatar} />
            ) : (
              <View style={[
                styles.defaultAvatar,
                { backgroundColor: isGhost ? '#3ECFB2' : isSystem ? '#888888' : getRandomColor(item.userId) }
              ]}>
                {isGhost ? (
                  <Ghost size={16} color="#121214" strokeWidth={1.5} />
                ) : (
                  <Text style={styles.avatarText}>
                    {item.userName?.charAt(0) || 'U'}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.userBubble : 
          isGhost ? styles.ghostBubble : 
          isSystem ? styles.systemBubble : 
          styles.otherBubble
        ]}>
          {!isCurrentUser && (
            <View style={styles.messageInfo}>
              <Text style={[
                styles.userName,
                isGhost && styles.ghostName,
                isSystem && styles.systemName
              ]}>
                {item.userName}
              </Text>
              <Text style={styles.messageTime}>{formatTimeAgo(item.timestamp)}</Text>
            </View>
          )}
          
          <Text style={[
            styles.messageText,
            isSystem && styles.systemText
          ]}>
            {item.text}
          </Text>
          
          {isCurrentUser && (
            <Text style={styles.messageTime}>{formatTimeAgo(item.timestamp)}</Text>
          )}
        </View>
      </View>
    );
  };

  // Utility function to generate a random color based on user ID
  const getRandomColor = (userId) => {
    const colors = [
      '#FF7A5A', // friendly
      '#3ECFB2', // helpful
      '#9D7AFF', // chaotic
      '#FFD166', // serious
      '#5D5DFF', // blue
      '#FF5D87', // pink
    ];
    
    // Simple hash of the user ID
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Use the hash to select a color
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  // Add useEffect to ensure messages list is kept up to date
  useEffect(() => {
    const messagesCheck = setInterval(() => {
      // If the last message is more than 5 seconds old, refresh messages silently
      if (messages.length > 0) {
        const lastMessageTime = new Date(messages[messages.length - 1].timestamp).getTime();
        const now = new Date().getTime();
        if (now - lastMessageTime > 5000) {
          loadMessages(false);
        }
      }
    }, 5000);
    
    return () => clearInterval(messagesCheck);
  }, [messages]);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121214" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#FFFFFF" strokeWidth={1.5} />
        </TouchableOpacity>
        
        <View style={styles.spaceInfo}>
          <View style={styles.vibeRingContainer}>
            <VibeRing 
              vibe={currentVibe}
              size={42}
              pulseIntensity={0.5}
              style={styles.vibeRing}
            />
            <View style={styles.spaceIcon}>
              {space?.photoURL ? (
                <Image source={{ uri: space.photoURL }} style={styles.spaceImage} />
              ) : (
                <MessageCircle size={18} color="#3ECFB2" strokeWidth={1.5} />
              )}
            </View>
          </View>
          
          <View style={styles.spaceDetails}>
            <Text style={styles.spaceName}>
              {space?.name || 'Loading...'}
            </Text>
            <View style={[styles.vibeChip, { backgroundColor: `rgba(${getVibeColor(currentVibe)}, 0.2)` }]}>
              <Text style={[styles.vibeText, { color: `rgba(${getVibeColor(currentVibe)}, 1)` }]}>
                {getVibeLabel(currentVibe)}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('SpaceSettings', { spaceId })}
          activeOpacity={0.7}
        >
          <Users size={20} color="#FFFFFF" strokeWidth={1.5} />
        </TouchableOpacity>
      </View>
      
      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3ECFB2" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MessageCircle size={40} color="rgba(255, 255, 255, 0.2)" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>Start the conversation</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}
      
      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.bottom + 10}
      >
        <View style={[styles.inputContainer, { paddingBottom: Math.max(10, insets.bottom) }]}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              messageText.trim().length > 0 && styles.sendButtonActive
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
            activeOpacity={0.7}
          >
            <Send size={18} color={messageText.trim().length > 0 ? "#000000" : "#FFFFFF"} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Helper function to get vibe label
const getVibeLabel = (vibe) => {
  switch (vibe) {
    case VIBE_TYPES.CHILL:
      return 'Chill';
    case VIBE_TYPES.FOCUSED:
      return 'Focused';
    case VIBE_TYPES.EXCITED:
      return 'Excited';
    case VIBE_TYPES.CREATIVE:
      return 'Creative';
    default:
      return 'Neutral';
  }
};

// Helper function to get vibe color
const getVibeColor = (vibe) => {
  switch (vibe) {
    case VIBE_TYPES.CHILL:
      return '62, 207, 178'; // Teal
    case VIBE_TYPES.FOCUSED:
      return '100, 120, 255'; // Blue
    case VIBE_TYPES.EXCITED:
      return '255, 100, 130'; // Coral
    case VIBE_TYPES.CREATIVE:
      return '157, 122, 255'; // Purple
    default:
      return '255, 255, 255'; // White
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  vibeRingContainer: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  spaceIcon: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(18, 18, 20, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  spaceDetails: {
    flex: 1,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  vibeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  vibeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
    textAlign: 'center',
  },
  messagesList: {
    padding: 16,
    paddingTop: 8,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    maxWidth: '90%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  defaultAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: 'rgba(62, 207, 178, 0.1)',
    borderColor: 'rgba(62, 207, 178, 0.2)',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopLeftRadius: 4,
  },
  ghostBubble: {
    backgroundColor: 'rgba(62, 207, 178, 0.1)',
    borderColor: 'rgba(62, 207, 178, 0.2)',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  typingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 45,
    minHeight: 30,
  },
  appleTypingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  appleTypingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  systemBubble: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderColor: 'rgba(128, 128, 128, 0.2)',
    alignSelf: 'center',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxWidth: '90%',
  },
  messageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  vibeIndicator: {
    position: 'absolute',
    bottom: -5,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
  vibeEmoji: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'rgba(26, 26, 30, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 120,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(62, 207, 178, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#3ECFB2',
  },
  typingIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 40,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  typingDotMiddle: {
    marginLeft: 4,
    marginRight: 4,
  },
  ghostName: {
    color: 'rgba(62, 207, 178, 0.8)',
  },
  systemName: {
    color: 'rgba(128, 128, 128, 0.8)',
  },
});

export default SpaceChatScreen;
