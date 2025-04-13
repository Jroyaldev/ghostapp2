import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  StatusBar,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Plus, 
  Users, 
  Search, 
  LogIn, 
  LogOut,
  Settings,
  Bookmark,
  MessageCircle
} from 'lucide-react-native';

// Services
import { getUserSpaces, createSpace, joinSpace } from '../services/spaces-service';
import { VIBE_TYPES } from '../services/vibe-service';
import { auth } from '../services/firebase';

// Components
import VibeRing from '../components/spaces/VibeRing';

const SpacesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDescription, setNewSpaceDescription] = useState('');
  const [spaceIdToJoin, setSpaceIdToJoin] = useState('');
  
  // Load spaces when component mounts
  useEffect(() => {
    loadSpaces();
    
    // Set up listener to reload on focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadSpaces();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  // Function to load spaces from Firebase
  const loadSpaces = async () => {
    try {
      setLoading(true);
      const { spaces: loadedSpaces, error } = await getUserSpaces();
      
      if (error) {
        console.error('Error loading spaces:', error);
      } else {
        setSpaces(loadedSpaces || []);
      }
    } catch (error) {
      console.error('Unexpected error loading spaces:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle creating a new space
  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) {
      Alert.alert('Error', 'Please enter a name for your space');
      return;
    }
    
    try {
      setLoading(true);
      
      const { success, spaceId, error } = await createSpace({
        name: newSpaceName.trim(),
        description: newSpaceDescription.trim(),
        isPrivate: false
      });
      
      if (success) {
        setCreateModalVisible(false);
        setNewSpaceName('');
        setNewSpaceDescription('');
        await loadSpaces();
        
        // Navigate to the space chat
        navigation.navigate('SpaceChat', { spaceId });
      } else {
        Alert.alert('Error', error || 'Failed to create space');
      }
    } catch (error) {
      console.error('Error creating space:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle joining a space
  const handleJoinSpace = async () => {
    if (!spaceIdToJoin.trim()) {
      Alert.alert('Error', 'Please enter a space ID or invitation code');
      return;
    }
    
    try {
      setLoading(true);
      
      const { success, space, error } = await joinSpace(spaceIdToJoin.trim());
      
      if (success) {
        setJoinModalVisible(false);
        setSpaceIdToJoin('');
        await loadSpaces();
        
        // Navigate to the space chat
        navigation.navigate('SpaceChat', { spaceId: space.id });
      } else {
        Alert.alert('Error', error || 'Failed to join space');
      }
    } catch (error) {
      console.error('Error joining space:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle opening a space
  const handleOpenSpace = (space) => {
    // Navigate to the SpaceChat screen for this space
    navigation.navigate('SpaceChat', { spaceId: space.id });
  };
  
  const renderCreateModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={createModalVisible}
      onRequestClose={() => setCreateModalVisible(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Create New Space</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Space Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter space name"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={newSpaceName}
                  onChangeText={setNewSpaceName}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textareaInput]}
                  placeholder="What's this space about?"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={newSpaceDescription}
                  onChangeText={setNewSpaceDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setCreateModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.actionButton]}
                  onPress={handleCreateSpace}
                >
                  <Text style={styles.actionButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
  
  const renderJoinModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={joinModalVisible}
      onRequestClose={() => setJoinModalVisible(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Join Space</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Invitation Code</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter invitation code"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={spaceIdToJoin}
                  onChangeText={setSpaceIdToJoin}
                />
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setJoinModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.actionButton]}
                  onPress={handleJoinSpace}
                >
                  <Text style={styles.actionButtonText}>Join</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
  
  const renderSpace = (space) => {
    // Default to NEUTRAL vibe if not specified
    const spaceVibe = space.currentVibe || VIBE_TYPES.NEUTRAL;
    
    return (
      <TouchableOpacity 
        key={space.id} 
        style={styles.spaceCard}
        onPress={() => handleOpenSpace(space)}
      >
        <View style={styles.spaceIconContainer}>
          <VibeRing 
            vibe={spaceVibe} 
            size={60} 
            strength={spaceVibe.strength || 0.5}
          />
          <View style={styles.spaceIcon}>
            {space.imageUrl ? (
              <Image source={{ uri: space.imageUrl }} style={styles.spaceImage} />
            ) : (
              <MessageCircle size={20} color="#FFFFFF" />
            )}
          </View>
        </View>
        
        <View style={styles.spaceInfo}>
          <Text style={styles.spaceName}>{space.name}</Text>
          
          <View style={styles.spaceStats}>
            <View style={styles.statItem}>
              <Users size={14} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.statText}>{space.memberCount || 0}</Text>
            </View>
            
            <View style={styles.vibeChip}>
              <Text style={styles.vibeText}>{spaceVibe.emoji} {spaceVibe.id}</Text>
            </View>
          </View>
          
          {space.description ? (
            <Text style={styles.spaceDescription} numberOfLines={2}>
              {space.description}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Spaces</Text>
        
        <TouchableOpacity style={styles.headerButton}>
          <Search size={20} color="#FFFFFF" strokeWidth={1.5} />
        </TouchableOpacity>
      </View>
      
      {/* Create/Join Space Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionCard, styles.createButton]}
          onPress={() => setCreateModalVisible(true)}
        >
          <View style={styles.actionIcon}>
            <Plus size={24} color="#3ECFB2" strokeWidth={2} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Create a Space</Text>
            <Text style={styles.actionSubtitle}>Start a new conversation</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionCard, styles.joinButton]}
          onPress={() => setJoinModalVisible(true)}
        >
          <View style={styles.actionIcon}>
            <LogIn size={24} color="#9D7AFF" strokeWidth={2} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Join a Space</Text>
            <Text style={styles.actionSubtitle}>Enter a code or ID</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Spaces List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3ECFB2" />
          <Text style={styles.loadingText}>Loading spaces...</Text>
        </View>
      ) : spaces.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyVibe}>
            <VibeRing vibe={VIBE_TYPES.FRIENDLY} size={100} pulseEnabled={false} />
          </View>
          <Text style={styles.emptyTitle}>No spaces yet</Text>
          <Text style={styles.emptySubtitle}>Create a space to start a conversation with friends or colleagues</Text>
        </View>
      ) : (
        <ScrollView style={styles.spacesList} contentContainerStyle={styles.spacesListContent}>
          <Text style={styles.sectionTitle}>Your Spaces</Text>
          {spaces.map(renderSpace)}
        </ScrollView>
      )}
      
      {renderCreateModal()}
      {renderJoinModal()}
      
      <SafeAreaView style={{ backgroundColor: '#121214' }} />
    </View>
  );
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
    backgroundColor: '#1A1A1E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1A1A1E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  createButton: {
    borderColor: 'rgba(62, 207, 178, 0.3)',
  },
  joinButton: {
    borderColor: 'rgba(157, 122, 255, 0.3)',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
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
  emptyVibe: {
    marginBottom: 16,
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
  spacesList: {
    flex: 1,
  },
  spacesListContent: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  spaceCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 12,
  },
  spaceIconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  spaceIcon: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  spaceInfo: {
    flex: 1,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  spaceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  vibeChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  vibeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  spaceDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#1A1A1E',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    // Glassmorphic effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textareaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    backgroundColor: '#3ECFB2',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
});

export default SpacesScreen;
