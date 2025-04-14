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
    // Check if in demo mode and load demo data
    const isDemoMode = true; // For mockup, later can be controlled by settings
    
    if (isDemoMode) {
      loadDemoMemories();
    } else {
      loadMemories();
    }
    
    // Set up a focus listener to reload memories when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      if (isDemoMode) {
        loadDemoMemories();
      } else {
        loadMemories();
      }
    });
    
    return unsubscribe;
  }, [navigation]);
  
  const loadDemoMemories = () => {
    // Create demo memories that showcase AI capabilities and group chat use cases
    setTimeout(() => {
      const demoMemories = [
        // Design project group chat memories
        {
          id: 'memory-1',
          text: "Ghost helped us analyze our UI color palette and suggested adjustments to improve accessibility. WCAG compliance score jumped from 68% to 93% using these colors instead.",
          timestamp: new Date(2025, 3, 14, 10, 45).getTime(),
          isUser: true,
          tags: ['design', 'accessibility', 'project_jupiter']
        },
        {
          id: 'memory-2',
          text: "The new user onboarding flow should include these 3 key steps: 1) Welcome/value proposition, 2) Optional account creation with clear benefits, 3) Core feature spotlight with interactive examples",
          timestamp: new Date(2025, 3, 14, 10, 42).getTime(),
          isUser: false,
          tags: ['design', 'onboarding', 'ux']
        },
        {
          id: 'memory-3',
          text: "Research findings suggest our target demographic (25-34) prefers minimalist interfaces with intuitive gestures over traditional navigation patterns.",
          timestamp: new Date(2025, 3, 14, 9, 30).getTime(),
          isUser: true,
          tags: ['research', 'ux', 'demographics']
        },
        
        // Development team memories
        {
          id: 'memory-4',
          text: "Found a performance bottleneck in the image processing pipeline. Ghost suggested optimizing with WebAssembly which reduced processing time by 78% in our tests.",
          timestamp: new Date(2025, 3, 13, 16, 20).getTime(),
          isUser: true,
          tags: ['development', 'performance', 'wasm']
        },
        {
          id: 'memory-5',
          text: "The state management issue appears to be caused by multiple components modifying the same slice of state. Recommend implementing an event-based architecture with proper data flow.",
          timestamp: new Date(2025, 3, 13, 14, 15).getTime(),
          isUser: false,
          tags: ['development', 'architecture', 'debugging']
        },
        {
          id: 'memory-6',
          text: "Code review strategy for Team Orion: Automated linting and test coverage checks first, then 2-person reviews for architectural changes, 1-person for standard features.",
          timestamp: new Date(2025, 3, 13, 11, 10).getTime(),
          isUser: false,
          tags: ['development', 'team_process']
        },
        
        // Product strategy memories
        {
          id: 'memory-7',
          text: "Competitor analysis shows our unique value prop is the real-time collaboration + AI assistance combo. None of the top 5 competitors integrate both effectively.",
          timestamp: new Date(2025, 3, 12, 13, 25).getTime(),
          isUser: true,
          tags: ['strategy', 'competitive_analysis']
        },
        {
          id: 'memory-8',
          text: "Based on current usage patterns, these 3 features should be prioritized for Q2: 1) Enhanced thread organization, 2) AI summary generation, 3) Integration with project management tools",
          timestamp: new Date(2025, 3, 12, 10, 5).getTime(),
          isUser: false,
          tags: ['strategy', 'roadmap', 'features']
        },
        
        // Team collaboration memories
        {
          id: 'memory-9',
          text: "Meeting notes from design sprint: Focus on solving the multi-workspace navigation problem. Users with 5+ spaces report confusion when switching contexts.",
          timestamp: new Date(2025, 3, 11, 15, 30).getTime(),
          isUser: true,
          tags: ['meeting', 'design_sprint', 'navigation']
        },
        {
          id: 'memory-10',
          text: "Survey data shows 89% of power users prefer keyboard shortcuts for common actions. Ghost generated a comprehensive shortcut system that doesn't conflict with browser defaults.",
          timestamp: new Date(2025, 3, 11, 14, 0).getTime(),
          isUser: true,
          tags: ['research', 'accessibility', 'power_users']
        },
        {
          id: 'memory-11',
          text: "For the cross-functional team structure to work effectively, recommend organizing spaces by project rather than department. This improved team velocity by 34% in similar case studies.",
          timestamp: new Date(2025, 3, 11, 11, 45).getTime(), 
          isUser: false,
          tags: ['team_organization', 'productivity']
        },
        
        // Research findings
        {
          id: 'memory-12',
          text: "User testing session revealed confusion around the notification settings. Need to simplify options and provide clearer explanations of each notification type.",
          timestamp: new Date(2025, 3, 10, 16, 15).getTime(),
          isUser: true,
          tags: ['research', 'usability', 'notifications']
        },
        {
          id: 'memory-13',
          text: "Market analysis suggests expanding the AI capabilities to include data visualization would address an unmet need for 68% of our enterprise customers.",
          timestamp: new Date(2025, 3, 10, 13, 20).getTime(),
          isUser: false,
          tags: ['research', 'market_analysis', 'enterprise']
        }
      ];
      
      setMemories(demoMemories);
      setLoading(false);
    }, 800); // Simulate loading
  };
  
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
      
      // In demo mode, do client-side filtering to simulate search
      const isDemoMode = true;
      
      if (isDemoMode) {
        setTimeout(() => {
          const results = memories.filter(memory => {
            const lowerQuery = query.toLowerCase();
            const matchesText = memory.text.toLowerCase().includes(lowerQuery);
            const matchesTags = memory.tags && memory.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
            return matchesText || matchesTags;
          });
          
          setSearchResults(results);
          setIsSearching(false);
        }, 1000);
        return;
      }
      
      // Normal search via API
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121214" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Memory</Text>
        
        {!isSearchMode ? (
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setIsSearchMode(true)}
            activeOpacity={0.7}
          >
            <Search size={20} color="#FFFFFF" strokeWidth={1.5} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {
              setIsSearchMode(false);
              setSearchQuery('');
            }}
            activeOpacity={0.7}
          >
            <XCircle size={20} color="#FFFFFF" strokeWidth={1.5} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Search Input - Only visible in search mode */}
      {isSearchMode && (
        <View style={styles.searchInputContainer}>
          <View style={styles.searchInput}>
            <Search size={16} color="rgba(255, 255, 255, 0.5)" strokeWidth={1.5} />
            <TouchableOpacity 
              style={styles.searchInputField}
              activeOpacity={0.7}
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
      
      {/* Main Content Area */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3ECFB2" />
          <Text style={styles.loadingText}>Loading memories...</Text>
        </View>
      ) : isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3ECFB2" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : isSearchMode ? (
        // Search results
        searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderMemoryChip}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.searchResultsContainer,
              { paddingBottom: insets.bottom + 20 }
            ]}
            showsVerticalScrollIndicator={false}
          />
        ) : searchQuery ? (
          <View style={styles.emptyContainer}>
            <Bookmark size={40} color="rgba(255, 255, 255, 0.2)" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>Try a different search term or create a new memory</Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Search size={40} color="rgba(255, 255, 255, 0.2)" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Search for memories</Text>
            <Text style={styles.emptySubtitle}>Enter a search term to find related memories</Text>
          </View>
        )
      ) : (
        <View style={styles.timelineView}>
          {/* Memory Type Filter Tabs */}
          <View style={styles.memoryTypeTabs}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.memoryTypeTabsContent}
            >
              <TouchableOpacity
                style={[styles.memoryTypeTab, selectedTag === null && styles.activeMemoryTypeTab]}
                onPress={() => setSelectedTag(null)}
                activeOpacity={0.7}
              >
                <Text style={[styles.memoryTypeTabText, selectedTag === null && styles.activeMemoryTypeTabText]}>All</Text>
              </TouchableOpacity>
              
              {getAllTags().map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.memoryTypeTab, selectedTag === tag && styles.activeMemoryTypeTab]}
                  onPress={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.memoryTypeTabText, selectedTag === tag && styles.activeMemoryTypeTabText]}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Memory Timeline */}
          {filteredMemories.length > 0 ? (
            <FlatList
              data={groupedMemoriesArray}
              keyExtractor={item => item.date}
              contentContainerStyle={[
                styles.timelineContainer,
                { paddingBottom: insets.bottom + 20 }
              ]}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.dateGroup}>
                  <View style={styles.dateHeader}>
                    <Calendar size={16} color="#FFFFFF" strokeWidth={1.5} />
                    <Text style={styles.dateHeaderText}>{item.date}</Text>
                  </View>
                  
                  <FlatList
                    data={item.memories}
                    renderItem={renderMemoryChip}
                    keyExtractor={memory => memory.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.memoryChipsContainer}
                    snapToInterval={width * 0.75 + 16}
                    decelerationRate="fast"
                    snapToAlignment="start"
                  />
                </View>
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Bookmark size={40} color="rgba(255, 255, 255, 0.2)" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No memories yet</Text>
              <Text style={styles.emptySubtitle}>Your memories will appear here</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = {
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
  searchInputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(26, 26, 30, 0.8)',
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
  // New Memory Type Tabs
  timelineView: {
    flex: 1,
  },
  memoryTypeTabs: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  memoryTypeTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  memoryTypeTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeMemoryTypeTab: {
    backgroundColor: '#3ECFB2',
  },
  memoryTypeTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeMemoryTypeTabText: {
    color: '#121214',
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
    paddingBottom: 40,
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
    marginRight: 12,
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
    backgroundColor: 'rgba(62, 207, 178, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(62, 207, 178, 0.9)',
  },
};

export default MemoryScreen;
