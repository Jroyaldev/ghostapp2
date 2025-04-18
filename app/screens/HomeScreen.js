import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StatusBar, 
  Platform, 
  TouchableOpacity, 
  Image,
  FlatList,
  Animated,
  Dimensions,
  Pressable,
  BlurView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, MessageCircle, ChevronRight, Bookmark, Users, Sparkles, Plus, Zap, Clock, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { colors } from '../theme';

const { width, height } = Dimensions.get('window');
const MEMORY_CARD_WIDTH = width * 0.75;
const CATEGORY_CARD_WIDTH = width * 0.28;
const CHIP_WIDTH = width * 0.33;
const CARD_SPACING = 16;

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [animatedValue] = useState(new Animated.Value(0));
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 70],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0.7, 1],
    extrapolate: 'clamp'
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.85],
    extrapolate: 'clamp'
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: 'clamp'
  });

  // Start subtle animation effect for ghost glow
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulseAnimation.start();
    
    return () => pulseAnimation.stop();
  }, []);

  // Animation for the subtle ghost glow
  const glowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.8],
  });
  
  // Function to navigate to GhostChat
  const goToGhostChat = () => {
    navigation.navigate('GhostChat');
  };

  // Featured categories - horizontally scrollable
  const categories = [
    { id: '1', title: 'Writing', icon: '✍️', color: '#77ACF1' },
    { id: '2', title: 'Planning', icon: '🗓️', color: '#FF6B6B' },
    { id: '3', title: 'Learning', icon: '📚', color: '#9D50BB' },
    { id: '4', title: 'Creativity', icon: '🎨', color: '#FFD166' },
    { id: '5', title: 'Coding', icon: '💻', color: '#4ECDC4' },
  ];

  // Recent memories - using horizontal scrolling per UI specifications
  const memories = [
    { id: '1', title: 'Trip Planning', excerpt: 'Summer vacation ideas for the Mediterranean', timestamp: '3h ago', type: 'plan', icon: '✈️', color: '#4ECDC4' },
    { id: '2', title: 'Movie Night Ideas', excerpt: 'Sci-fi classics from the 90s and 2000s', timestamp: '1d ago', type: 'idea', icon: '🎬', color: '#FF6B6B' },
    { id: '3', title: 'Project Notes', excerpt: 'Design system improvements for Q3', timestamp: '2d ago', type: 'note', icon: '📝', color: '#9D50BB' },
  ];

  // Trending topics
  const trending = [
    { id: '1', title: 'AI Research', icon: '🧠', color: '#4ECDC4', mentions: 253 },
    { id: '2', title: 'Travel Hacks', icon: '✈️', color: '#9D50BB', mentions: 189 },
    { id: '3', title: 'Tech News', icon: '📱', color: '#FF6B6B', mentions: 155 },
  ];

  // Spaces - community-focused content
  const spaces = [
    { id: '1', name: 'Creative Writing', members: 1243, image: 'https://images.unsplash.com/photo-1579762593175-20226054cad0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2942&q=80' },
    { id: '2', name: 'Tech Explorers', members: 845, image: 'https://images.unsplash.com/photo-1581089778245-3ce67677f718?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' },
    { id: '3', name: 'Future Filmmakers', members: 643, image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' },
  ];
  
  return (
    <View style={{ flex: 1, backgroundColor: '#121214' }}> 
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Animated Header */}
      <Animated.View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: headerHeight,
        zIndex: 1000,
        backgroundColor: 'rgba(18, 18, 20, 0)',
      }}>
        <Animated.View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + 60,
          backgroundColor: '#121214',
          opacity: headerOpacity,
          zIndex: -1,
        }} />
        
        {/* Header Content */}
        <View style={{ 
          paddingTop: insets.top + 10, 
          paddingHorizontal: 24, 
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image 
              source={require('../../assets/logo-ghostmode.png')} 
              style={{ width: 34, height: 34, resizeMode: 'contain' }}
            />
            <Animated.Text 
              style={{ 
                marginLeft: 12, 
                fontSize: 22, 
                fontWeight: '700', 
                color: '#FFFFFF',
                transform: [
                  { scale: titleScale },
                  { translateY: titleTranslateY }
                ]
              }}
            >
              GhostMode
            </Animated.Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Search Button */}
            <TouchableOpacity 
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12
              }}
            >
              <Search size={20} color="rgba(255, 255, 255, 0.9)" strokeWidth={1.5} />
            </TouchableOpacity>
            
            {/* Notifications Button */}
            <TouchableOpacity 
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Bell size={20} color="rgba(255, 255, 255, 0.9)" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      
      <Animated.ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingTop: insets.top + 70, 
          paddingBottom: 100 
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          {/* Main Action Card */}
          <TouchableOpacity 
            style={{
              height: 180,
              borderRadius: 28,
              overflow: 'hidden',
              backgroundColor: 'rgba(32, 32, 36, 0.6)',
              marginBottom: 16,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
            activeOpacity={0.85}
            onPress={goToGhostChat}
          >
            <LinearGradient
              colors={['rgba(78, 205, 196, 0.2)', 'rgba(157, 80, 187, 0.2)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            
            {/* Animated Glow Effect */}
            <Animated.View 
              style={{
                position: 'absolute',
                top: 40,
                right: 20,
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: 'rgba(78, 205, 196, 0.4)',
                opacity: glowOpacity,
                transform: [{ scale: 1.5 }]
              }}
            />
            
            <View style={{ 
              padding: 24,
              flex: 1,
              justifyContent: 'space-between'
            }}>
              <View>
                <Text style={{ 
                  fontSize: 28, 
                  fontWeight: '700', 
                  color: '#FFFFFF',
                  marginBottom: 8,
                  letterSpacing: -0.5,
                }}>
                  Start a New Chat
                </Text>
                <Text style={{ 
                  fontSize: 16, 
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: 22,
                  maxWidth: '80%'
                }}>
                  Ask anything, create anything – your AI companion is ready
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  height: 42,
                  paddingHorizontal: 20,
                  borderRadius: 21,
                  backgroundColor: '#4ECDC4',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 5,
                }}>
                  <MessageCircle size={18} color="#121214" strokeWidth={2} style={{ marginRight: 6 }} />
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: '#121214',
                  }}>
                    New Chat
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Categories Section */}
        <View style={{ marginBottom: 32 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            marginBottom: 16,
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '700', 
              color: '#FFFFFF',
              letterSpacing: -0.5,
            }}>
              Categories
            </Text>
          </View>
          
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            data={categories}
            ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={{
                  width: CATEGORY_CARD_WIDTH,
                  aspectRatio: 1,
                  borderRadius: 24,
                  overflow: 'hidden',
                  backgroundColor: 'rgba(32, 32, 36, 0.8)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[`${item.color}30`, 'rgba(32, 32, 36, 0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
                <Text style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</Text>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  color: '#FFFFFF' 
                }}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
          
        {/* Recent Memories Section */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingHorizontal: 24,
            marginBottom: 16
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '700', 
              color: '#FFFFFF',
              letterSpacing: -0.5,
            }}>
              Recent Memories
            </Text>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => navigation.navigate('Memories')}
            >
              <Text style={{ 
                fontSize: 15, 
                fontWeight: '500',
                color: '#4ECDC4', 
                marginRight: 4
              }}>
                View All
              </Text>
              <ChevronRight size={16} color="#4ECDC4" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 24, paddingRight: 16 }}
            data={memories}
            ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Pressable 
                style={({ pressed }) => [
                  {
                    width: MEMORY_CARD_WIDTH,
                    borderRadius: 24,
                    overflow: 'hidden',
                    backgroundColor: 'rgba(32, 32, 36, 0.8)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    paddingHorizontal: 20,
                    paddingVertical: 20,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  }
                ]}
              >
                <LinearGradient
                  colors={[`${item.color}20`, 'rgba(32, 32, 36, 0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 20, 
                    backgroundColor: `${item.color}20`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                  </View>
                  <View>
                    <Text style={{ 
                      fontSize: 12, 
                      fontWeight: '500', 
                      color: item.color, 
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      {item.type}
                    </Text>
                  </View>
                </View>
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: '700', 
                  color: '#FFFFFF',
                  marginBottom: 8,
                  letterSpacing: -0.5,
                }}>
                  {item.title}
                </Text>
                <Text style={{ 
                  fontSize: 15, 
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: 16,
                  lineHeight: 20,
                }}>
                  {item.excerpt}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Clock size={14} color="rgba(255, 255, 255, 0.5)" />
                  <Text style={{ 
                    fontSize: 13, 
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginLeft: 6,
                  }}>
                    {item.timestamp}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </View>
        
        {/* Trending Now Section */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingHorizontal: 24,
            marginBottom: 16
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '700', 
              color: '#FFFFFF',
              letterSpacing: -0.5,
            }}>
              Trending Now
            </Text>
          </View>
          
          <View style={{ paddingHorizontal: 24 }}>
            {trending.map((item) => (
              <TouchableOpacity 
                key={item.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: 70,
                  borderRadius: 20,
                  overflow: 'hidden',
                  backgroundColor: 'rgba(32, 32, 36, 0.6)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  paddingHorizontal: 16,
                  marginBottom: 12,
                }}
                activeOpacity={0.85}
              >
                <View style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 22, 
                  backgroundColor: `${item.color}20`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                }}>
                  <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: '#FFFFFF',
                    marginBottom: 4,
                  }}>
                    {item.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Zap size={14} color="rgba(255, 255, 255, 0.6)" />
                    <Text style={{ 
                      fontSize: 13, 
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginLeft: 4,
                    }}>
                      {item.mentions} mentions today
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color="rgba(255, 255, 255, 0.3)" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Spaces Section */}
        <View style={{ marginBottom: 42 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingHorizontal: 24,
            marginBottom: 16
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '700', 
              color: '#FFFFFF',
              letterSpacing: -0.5,
            }}>
              Spaces
            </Text>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => navigation.navigate('Spaces')}
            >
              <Text style={{ 
                fontSize: 15, 
                fontWeight: '500',
                color: '#4ECDC4', 
                marginRight: 4
              }}>
                Explore
              </Text>
              <ChevronRight size={16} color="#4ECDC4" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 24, paddingRight: 16 }}
            data={spaces}
            ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Pressable 
                style={({ pressed }) => [
                  {
                    width: MEMORY_CARD_WIDTH,
                    height: 160,
                    borderRadius: 24,
                    overflow: 'hidden',
                    backgroundColor: 'rgba(32, 32, 36, 0.75)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  }
                ]}
              >
                <Image
                  source={{ uri: item.image }}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    opacity: 0.5,
                  }}
                />
                <LinearGradient
                  colors={['rgba(18, 18, 20, 0)', 'rgba(18, 18, 20, 0.8)', 'rgba(18, 18, 20, 0.95)']}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 100,
                  }}
                />
                <View style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  padding: 20
                }}>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginBottom: 6 
                  }}>
                    <Sparkles size={14} color="#FFD166" />
                    <Text style={{ 
                      fontSize: 12, 
                      fontWeight: '600', 
                      color: '#FFD166', 
                      marginLeft: 4,
                      letterSpacing: 0.5,
                      textTransform: 'uppercase'
                    }}>
                      TRENDING
                    </Text>
                  </View>
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: '700', 
                    color: '#FFFFFF',
                    marginBottom: 4,
                    letterSpacing: -0.5,
                  }}>
                    {item.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Users size={14} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={{ 
                      fontSize: 14, 
                      color: 'rgba(255, 255, 255, 0.7)',
                      marginLeft: 4
                    }}>
                      {item.members.toLocaleString()} members
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        </View>
        
        {/* Add floating action button */}
        <TouchableOpacity 
          style={{
            position: 'absolute',
            bottom: insets.bottom + 80,
            right: 24,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#4ECDC4',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 10,
          }}
          activeOpacity={0.85}
          onPress={goToGhostChat}
        >
          <Plus size={26} color="#121214" strokeWidth={2} />
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );
};

export default HomeScreen;
