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

// Main SpacesScreen Component
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
  
  // Create Space Modal
  const renderCreateModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={createModalVisible}
      onRequestClose={() => setCreateModalVisible(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create Space</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter space name"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={newSpaceName}
                onChangeText={setNewSpaceName}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
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
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.actionButton]}
                onPress={handleCreateSpace}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
  
  // Join Space Modal
  const renderJoinModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={joinModalVisible}
      onRequestClose={() => setJoinModalVisible(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
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
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.actionButton]}
                onPress={handleJoinSpace}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
  
  // Render a single space item
  const renderSpaceItem = (space) => {
    return (
      <TouchableOpacity 
        key={space.id} 
        style={styles.spaceCard}
        onPress={() => handleOpenSpace(space)}
        activeOpacity={0.7}
      >
        <View style={styles.spaceIconContainer}>
          <View style={styles.spaceIconBg}>
            <MessageCircle size={20} color="#FFFFFF" strokeWidth={1.5} />
          </View>
        </View>
        
        <View style={styles.spaceInfo}>
          <Text style={styles.spaceName}>{space.name}</Text>
          
          <View style={styles.spaceStats}>
            <View style={styles.statItem}>
              <Users size={12} color="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
              <Text style={styles.statText}>{space.memberCount || 1}</Text>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121214" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Spaces</Text>
        </View>
        
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <Search size={20} color="#FFFFFF" strokeWidth={1.5} />
        </TouchableOpacity>
      </View>
      
      {/* Main Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 } // Add padding to avoid content being under nav bar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Create/Join Space Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionCard, { marginRight: 8 }]}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(62, 207, 178, 0.15)' }]}>
              <Plus size={20} color="#3ECFB2" strokeWidth={1.5} />
            </View>
            <Text style={styles.actionText}>Create Space</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setJoinModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(157, 122, 255, 0.15)' }]}>
              <LogIn size={20} color="#9D7AFF" strokeWidth={1.5} />
            </View>
            <Text style={styles.actionText}>Join Space</Text>
          </TouchableOpacity>
        </View>
        
        {/* Spaces List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3ECFB2" />
            <Text style={styles.loadingText}>Loading spaces...</Text>
          </View>
        ) : spaces.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MessageCircle size={40} color="rgba(255, 255, 255, 0.2)" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No spaces yet</Text>
            <Text style={styles.emptySubtitle}>Create or join a space to start connecting</Text>
          </View>
        ) : (
          <View style={styles.spacesContainer}>
            <Text style={styles.spacesTitle}>Your Spaces</Text>
            {spaces.map(renderSpaceItem)}
          </View>
        )}
      </ScrollView>
      
      {/* Modals */}
      {renderCreateModal()}
      {renderJoinModal()}
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  spacesContainer: {
    flex: 1,
  },
  spacesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  spaceCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  spaceIconContainer: {
    marginRight: 12,
  },
  spaceIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(62, 207, 178, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 4,
  },
  spaceDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
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
