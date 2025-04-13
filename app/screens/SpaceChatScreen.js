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
import { ArrowLeft, Users, Send, Smile, Info, Settings, Link, MessageCircle } from 'lucide-react-native';

// Services
import { getSpaceMessages, sendMessageToSpace, getUserSpaces } from '../services/spaces-service';
import { VIBE_TYPES, detectMessageVibe, getVibeTransition } from '../services/vibe-service';
import { generateRandomId, formatTimeAgo } from '../utils/helpers';
import { auth } from '../services/firebase';

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
  const [sending, setSending] = useState(false);
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
        setMessages(loadedMessages || []);
        
        // Update vibe based on messages
        if (loadedMessages && loadedMessages.length > 0) {
          // Get the current vibe from the latest messages
          const spaceVibe = loadedMessages[loadedMessages.length - 1].currentVibe || VIBE_TYPES.NEUTRAL;
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
    
    try {
      setSending(true);
      
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You need to be signed in to send messages');
        return;
      }
      
      // Create message object
      const message = {
        id: generateRandomId(),
        text: messageText.trim(),
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL,
        timestamp: new Date().toISOString(),
      };
      
      // Detect message vibe
      const messageVibe = detectMessageVibe(message.text);
      message.vibe = messageVibe.id;
      
      // Check for vibe transition
      const transition = await getVibeTransition(currentVibe, message.text);
      
      // Send message to space
      const { success, error } = await sendMessageToSpace(spaceId, message);
      
      if (success) {
        // Clear input
        setMessageText('');
        
        // Reload messages
        await loadMessages(false);
        
        // If vibe changed, animate transition
        if (transition) {
          animateVibeTransition(transition);
        }
        
        // Scroll to bottom
        setTimeout(() => {
          listRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Error', error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSending(false);
    }
  };
  
  // Function to animate vibe transition
  const animateVibeTransition = (transition) => {
    // Reset animation
    vibeTransitionAnim.setValue(0);
    
    // Update current vibe
    setCurrentVibe(transition.toVibe);
    
    // Animate transition
    Animated.timing(vibeTransitionAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };
  
  // Function to render a message
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.userId === auth.currentUser?.uid;
    
    // Get message vibe
    const messageVibe = item.vibe ? 
      Object.values(VIBE_TYPES).find(v => v.id === item.vibe) || VIBE_TYPES.NEUTRAL :
      VIBE_TYPES.NEUTRAL;
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.userMessageContainer : styles.otherMessageContainer
      ]}>
        {/* User avatar */}
        {!isCurrentUser && (
          <View style={styles.avatarContainer}>
            {item.userPhotoURL ? (
              <Image source={{ uri: item.userPhotoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.defaultAvatar, { backgroundColor: getRandomColor(item.userId) }]}>
                <Text style={styles.avatarText}>{item.userName?.charAt(0) || 'A'}</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Message content */}
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.userBubble : styles.otherBubble,
          // Add a subtle border with the vibe color
          { borderColor: `${messageVibe.color}30` }
        ]}>
          {/* Message info (sender name and time) */}
          <View style={styles.messageInfo}>
            {!isCurrentUser && (
              <Text style={styles.userName}>{item.userName || 'Anonymous'}</Text>
            )}
            <Text style={styles.messageTime}>{formatTimeAgo(item.timestamp)}</Text>
          </View>
          
          {/* Message text */}
          <Text style={styles.messageText}>{item.text}</Text>
          
          {/* Message vibe indicator */}
          {item.vibe && (
            <View style={[styles.vibeIndicator, { backgroundColor: `${messageVibe.color}30` }]}>
              <Text style={styles.vibeEmoji}>{messageVibe.emoji}</Text>
            </View>
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
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Header with space info and vibe ring */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          {/* Back button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={20} color="#FFFFFF" strokeWidth={1.5} />
          </TouchableOpacity>
          
          {/* Space name */}
          <Text style={styles.headerTitle}>{space?.name || 'Space'}</Text>
          
          {/* Members button */}
          <TouchableOpacity style={styles.membersButton}>
            <Users size={20} color="#FFFFFF" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
        
        {/* Space info with vibe ring */}
        <View style={styles.spaceInfo}>
          <View style={styles.vibeRingContainer}>
            <VibeRing 
              vibe={currentVibe} 
              size={48} 
              strength={currentVibe.strength || 0.5}
            />
            <View style={styles.spaceIcon}>
              {space?.imageUrl ? (
                <Image source={{ uri: space.imageUrl }} style={styles.spaceImage} />
              ) : (
                <MessageCircle size={18} color="#FFFFFF" />
              )}
            </View>
          </View>
          
          <View style={styles.spaceDetails}>
            <Text style={styles.spaceName}>{space?.name || 'Space'}</Text>
            <View style={styles.vibeChip}>
              <Text style={styles.vibeText}>
                {currentVibe.emoji} {currentVibe.description}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Messages list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3ECFB2" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MessageCircle size={48} color="rgba(255, 255, 255, 0.2)" strokeWidth={1} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>Start a conversation in this space</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onLayout={() => {
            // Scroll to bottom when layout changes
            listRef.current?.scrollToEnd({ animated: false });
          }}
        />
      )}
      
      {/* Message input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={messageText}
          onChangeText={setMessageText}
          multiline
          autoCapitalize="none"
          autoCorrect={true}
        />
        
        <TouchableOpacity
          style={[styles.sendButton, messageText.trim() ? styles.sendButtonActive : null]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Send size={20} color={messageText.trim() ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)'} />
          )}
        </TouchableOpacity>
      </View>
      
      <SafeAreaView style={{ backgroundColor: '#121214' }} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  header: {
    backgroundColor: '#1A1A1E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  membersButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vibeRingContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  spaceIcon: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  vibeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
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
  },
  otherBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    paddingVertical: 10,
    backgroundColor: '#1A1A1E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
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
});

export default SpaceChatScreen;
