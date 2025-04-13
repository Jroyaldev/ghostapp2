import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, Calendar, Tag, Search, XCircle, Ghost, User } from 'lucide-react-native';

// Services and Utilities
import { getMemories, findRelatedMemories, deleteMemory } from '../services/memory-service';
import { formatDate, formatTimeAgo } from '../utils/helpers';
import { auth } from '../services/firebase';

// Get screen dimensions for memory chips
const { width } = Dimensions.get('window');

const MemoryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // Load memories when screen mounts or becomes focused
  useEffect(() => {
    loadMemories();
    
    // Set up a focus listener to reload memories when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      loadMemories();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  const loadMemories = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        console.log('No user is signed in');
        setLoading(false);
        return;
      }
      
      // Get memories from service
      const { memories: loadedMemories, error } = await getMemories(user.uid);
      
      if (error) {
        console.error('Error loading memories:', error);
        setLoading(false);
        return;
      }
      
      setMemories(loadedMemories || []);
    } catch (error) {
      console.error('Error in loadMemories:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle searching for semantically related memories
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setIsSearchMode(false);
      return;
    }
    
    try {
      setIsSearching(true);
      setIsSearchMode(true);
      
      const user = auth.currentUser;
      if (!user) return;
      
      const { memories: results } = await findRelatedMemories(user.uid, query, 0.3); // Lower threshold for more results
      setSearchResults(results || []);
    } catch (error) {
      console.error('Error searching memories:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle delete memory
  const handleDeleteMemory = async (memoryId) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const { success } = await deleteMemory(user.uid, memoryId);
      
      if (success) {
        // Remove from local state
        setMemories(prev => prev.filter(memory => memory.id !== memoryId));
        
        if (isSearchMode) {
          setSearchResults(prev => prev.filter(memory => memory.id !== memoryId));
        }
      }
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  };
  
  // Extract all unique tags from memories
  const getAllTags = () => {
    const tagSet = new Set();
    
    memories.forEach(memory => {
      if (memory.tags && memory.tags.length > 0) {
        memory.tags.forEach(tag => tagSet.add(tag));
      }
    });
    
    return Array.from(tagSet);
  };
  
  // Filter memories based on selectedTag
  const filteredMemories = memories.filter(memory => {
    if (selectedTag && (!memory.tags || !memory.tags.includes(selectedTag))) {
      return false;
    }
    return true;
  });
  
  // Group memories by date
  const groupedMemories = filteredMemories.reduce((groups, memory) => {
    const date = formatDate(memory.timestamp);
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(memory);
    return groups;
  }, {});
  
  // Convert grouped memories to array for rendering
  const groupedMemoriesArray = Object.keys(groupedMemories)
    .map(date => ({
      date,
      memories: groupedMemories[date]
    }))
    .sort((a, b) => {
      // Sort dates in reverse chronological order (newest first)
      if (a.date === 'Today') return -1;
      if (b.date === 'Today') return 1;
      if (a.date === 'Yesterday') return -1;
      if (b.date === 'Yesterday') return 1;
      
      const dateA = new Date(a.memories[0].timestamp);
      const dateB = new Date(b.memories[0].timestamp);
      return dateB - dateA;
    });
  
  // Render a single memory chip
  const renderMemoryChip = ({ item }) => (
    <TouchableOpacity 
      style={[styles.memoryChip, item.isUser ? styles.userMemoryChip : styles.ghostMemoryChip]}
      activeOpacity={0.8}
      onLongPress={() => {
        // Show delete option
        Alert.alert(
          'Memory Options',
          'What would you like to do with this memory?',
          [
            {
              text: 'Delete',
              onPress: () => handleDeleteMemory(item.id),
              style: 'destructive'
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }}
    >
      <View style={styles.memoryHeader}>
        <View style={styles.memoryType}>
          {item.isUser ? (
            <User size={14} color="#3ECFB2" strokeWidth={2} />
          ) : (
            <Ghost size={14} color="#3ECFB2" strokeWidth={2} />
          )}
          <Text style={styles.memoryTypeText}>
            {item.isUser ? 'You' : 'Ghost'}
          </Text>
        </View>
        <Text style={styles.memoryTime}>{formatTimeAgo(item.timestamp)}</Text>
      </View>
      
      <Text style={styles.memoryText} numberOfLines={5}>{item.text}</Text>
      
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagContainer}>
          {item.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Memory Chips</Text>
        
        {!isSearchMode ? (
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => setIsSearchMode(true)}
          >
            <Search size={20} color="#FFFFFF" strokeWidth={1.5} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => {
              setIsSearchMode(false);
              setSearchQuery('');
            }}
          >
            <XCircle size={20} color="#FFFFFF" strokeWidth={1.5} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Search Input */}
      {isSearchMode && (
        <View style={styles.searchInputContainer}>
          <View style={styles.searchInput}>
            <Search size={16} color="rgba(255, 255, 255, 0.5)" strokeWidth={1.5} />
            <TouchableOpacity 
              style={styles.searchInputField}
              onPress={() => {
                Alert.prompt(
                  'Search Memories',
                  'Enter text to find semantically similar memories',
                  [
                    {
                      text: 'Cancel',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: 'Search',
                      onPress: (query) => handleSearch(query),
                    }
                  ],
                  'plain-text',
                  searchQuery,
                  'default'
                );
              }}
            >
              <Text style={styles.searchInputText}>
                {searchQuery || 'Search for memories...'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Tags horizontal scroll */}
      {!isSearchMode && getAllTags().length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsScrollContainer}
        >
          {selectedTag && (
            <TouchableOpacity 
              style={styles.clearTagButton}
              onPress={() => setSelectedTag(null)}
            >
              <XCircle size={14} color="#3ECFB2" strokeWidth={2} />
              <Text style={styles.clearTagText}>Clear</Text>
            </TouchableOpacity>
          )}
          
          {getAllTags().map(tag => (
            <TouchableOpacity 
              key={tag} 
              style={[styles.tagChip, selectedTag === tag && styles.selectedTagChip]}
              onPress={() => setSelectedTag(tag === selectedTag ? null : tag)}
            >
              <Tag size={12} color={selectedTag === tag ? '#121214' : '#3ECFB2'} strokeWidth={2} />
              <Text 
                style={[styles.tagChipText, selectedTag === tag && styles.selectedTagChipText]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      
      {/* Loading indicator */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3ECFB2" />
          <Text style={styles.loadingText}>Loading memories...</Text>
        </View>
      ) : isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3ECFB2" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : isSearchMode ? (
        // Search results
        searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderMemoryChip}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.searchResultsContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Bookmark size={48} color="rgba(255, 255, 255, 0.2)" strokeWidth={1} />
            <Text style={styles.emptyTitle}>No matching memories</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
          </View>
        )
      ) : memories.length === 0 ? (
        // No memories state
        <View style={styles.emptyContainer}>
          <Bookmark size={48} color="rgba(255, 255, 255, 0.2)" strokeWidth={1} />
          <Text style={styles.emptyTitle}>No memories yet</Text>
          <Text style={styles.emptySubtitle}>Long-press on messages in chats to save them as memories</Text>
        </View>
      ) : filteredMemories.length === 0 ? (
        // No matching memories for selected tag
        <View style={styles.emptyContainer}>
          <Bookmark size={48} color="rgba(255, 255, 255, 0.2)" strokeWidth={1} />
          <Text style={styles.emptyTitle}>No matching memories</Text>
          <Text style={styles.emptySubtitle}>Try selecting a different tag</Text>
        </View>
      ) : (
        // Memories timeline
        <FlatList
          data={groupedMemoriesArray}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.timelineContainer}
          renderItem={({ item: group }) => (
            <View style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <Calendar size={16} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.dateHeaderText}>{group.date}</Text>
              </View>
              
              {/* Horizontal scroll of memory chips */}
              <FlatList
                horizontal
                data={group.memories}
                keyExtractor={(item) => item.id}
                renderItem={renderMemoryChip}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.memoryChipsContainer}
                snapToInterval={width * 0.75 + 16}
                decelerationRate="fast"
                ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
              />
            </View>
          )}
        />
      )}
      
      <SafeAreaView style={{ backgroundColor: '#121214' }} />
    </View>
  );
};

const styles = {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1A1E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInputField: {
    flex: 1,
    marginLeft: 8,
    height: 30,
    justifyContent: 'center',
  },
  searchInputText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  tagsScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(62, 207, 178, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(62, 207, 178, 0.2)',
  },
  selectedTagChip: {
    backgroundColor: '#3ECFB2',
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3ECFB2',
    marginLeft: 4,
  },
  selectedTagChipText: {
    color: '#121214',
  },
  clearTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  clearTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3ECFB2',
    marginLeft: 4,
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
  timelineContainer: {
    padding: 16,
  },
  searchResultsContainer: {
    padding: 16,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  memoryChipsContainer: {
    paddingRight: 16,
  },
  memoryChip: {
    width: width * 0.75,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 2,
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  userMemoryChip: {
    backgroundColor: 'rgba(62, 207, 178, 0.08)',
    borderColor: 'rgba(62, 207, 178, 0.15)',
  },
  ghostMemoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memoryType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memoryTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3ECFB2',
    marginLeft: 4,
  },
  memoryTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  memoryText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
};

export default MemoryScreen;
