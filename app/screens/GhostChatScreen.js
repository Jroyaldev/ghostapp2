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
  SafeAreaView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GhostIcon, ArrowLeft, Settings } from 'lucide-react-native';

// Components
import ChatBubble from '../components/chat/ChatBubble';
import MessageInput from '../components/chat/MessageInput';

// Services and Utilities
import { generateAIResponse, getGhostPersonas } from '../services/ai-service';
import { generateRandomId, formatDate } from '../utils/helpers';

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
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState(getGhostPersonas()[0]);
  const listRef = useRef(null);
  const ghostOpacity = useRef(new Animated.Value(0)).current;
  
  // Fade in animation for ghost icon
  useEffect(() => {
    Animated.timing(ghostOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
  }, []);
  
  // Function to handle sending a new message
  const handleSendMessage = async (text) => {
    // Create user message
    const userMessage = {
      id: generateRandomId(),
      text,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    
    // Update messages state with user message
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Scroll to bottom
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    // Start loading state
    setIsLoading(true);
    
    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(
        [...messages, userMessage],
        text,
        currentPersona.id
      );
      
      // Update messages with AI response
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      
      // Scroll to bottom again
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Group messages by date
  const renderItem = ({ item, index }) => {
    // Check if we need to show a date header
    const showDateHeader = index === 0 || 
      formatDate(item.timestamp) !== formatDate(messages[index - 1].timestamp);
    
    return (
      <>
        {showDateHeader && (
          <View style={styles.dateHeader}>
            <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        <ChatBubble 
          message={item} 
          onLongPress={(message) => {
            // TODO: Show options - save to memories, copy, etc.
            console.log('Long press on message:', message.id);
          }} 
        />
      </>
    );
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Header with glassmorphic effect */}
      <View 
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        {/* Top row with back button, title and settings */}
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color="#FFFFFF" strokeWidth={1.5} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Ghost Chat</Text>
          
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={20} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
        
        {/* Ghost info row */}
        <View style={styles.ghostInfo}>
          <View style={styles.ghostIconContainer}>
            <Animated.View style={{ opacity: ghostOpacity }}>
              <GhostIcon size={24} color="#FFFFFF" strokeWidth={1.5} />
            </Animated.View>
          </View>
          
          <View style={styles.ghostDetails}>
            <Text style={styles.ghostName}>Ghost</Text>
            <View style={styles.ghostPersona}>
              <Text style={styles.personaEmoji}>{currentPersona.emoji}</Text>
              <Text style={styles.personaText}>{currentPersona.name} Mode</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Messages list */}
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        onLayout={() => {
          // Scroll to bottom on initial render
          listRef.current?.scrollToEnd({ animated: false });
        }}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color="#3ECFB2" />
            <Text style={styles.loadingText}>Ghost is thinking...</Text>
          </View>
        </View>
      )}
      
      {/* Message input */}
      <MessageInput 
        onSend={handleSendMessage} 
        disabled={isLoading}
      />
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
    marginBottom: 16,
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ghostIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(62, 207, 178, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ghostDetails: {
    flex: 1,
  },
  ghostName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  ghostPersona: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personaEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  personaText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  messagesList: {
    padding: 16,
    paddingTop: 8,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 12,
    paddingVertical: 4,
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
    fontSize: 14,
  },
});

export default GhostChatScreen;
