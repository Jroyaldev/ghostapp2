import React, { useEffect, useState } from 'react';
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
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, GhostIcon, MessageCircle, ChevronRight, Bookmark, Users, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

const { width } = Dimensions.get('window');
const MEMORY_CARD_WIDTH = width * 0.75;
const CHIP_WIDTH = width * 0.33;
const CARD_SPACING = 12;

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [animatedValue] = useState(new Animated.Value(0));

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

  // Memory chips - using horizontal scrolling per UI specifications
  const memoryChips = [
    { id: '1', title: 'Trip Planning', type: 'plan', icon: '✈️', color: '#4ECDC4' },
    { id: '2', title: 'Movie Night Ideas', type: 'idea', icon: '🎬', color: '#FF6B6B' },
    { id: '3', title: 'Project Notes', type: 'note', icon: '📝', color: '#9D50BB' },
    { id: '4', title: 'Gift Ideas', type: 'idea', icon: '🎁', color: '#FFD166' },
  ];

  // Spaces - community-focused content
  const spaces = [
    { id: '1', name: 'Creative Writing', members: 1243, image: 'https://images.unsplash.com/photo-1579762593175-20226054cad0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2942&q=80' },
    { id: '2', name: 'Tech Explorers', members: 845, image: 'https://images.unsplash.com/photo-1581089778245-3ce67677f718?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' },
  ];
  
  return (
    <View style={{ flex: 1, backgroundColor: '#121214' }}> 
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Area */}
        <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 24, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image 
                source={require('../../assets/logo-ghostmode.png')} 
                style={{ width: 46, height: 46, resizeMode: 'contain' }}
              />
              <Text style={{ marginLeft: 12, fontSize: 22, fontWeight: '600', color: '#FFFFFF' }}>
                GhostMode
              </Text>
            </View>
            
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
          
          {/* Hero Text - Minimalist per brand guidelines */}
          <View style={{ marginBottom: 28 }}>
            <Text style={{ 
              fontSize: 32, 
              fontWeight: '700', 
              color: '#FFFFFF', 
              lineHeight: 38,
              marginBottom: 8
            }}>
              Your digital{'\n'}companion
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: 'rgba(255, 255, 255, 0.7)', 
              lineHeight: 22 
            }}>
              AI that adapts to your vibe and remembers what matters
            </Text>
          </View>
        </View>
        
        {/* Ghost Interaction Card - Glassmorphic UI per guidelines */}
        <TouchableOpacity 
          style={{
            marginHorizontal: 24,
            borderRadius: 18,
            backgroundColor: 'rgba(32, 32, 36, 0.75)', 
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            padding: 20,
            marginBottom: 32,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 5
          }}
          onPress={goToGhostChat}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Ghost Avatar with Subtle Glow */}
            <Animated.View style={{ 
              width: 48, 
              height: 48, 
              borderRadius: 24,
              backgroundColor: 'rgba(78, 205, 196, 0.1)',
              justifyContent: 'center', 
              alignItems: 'center',
              marginRight: 16,
            }}>
              <Image 
                source={require('../../assets/logo-ghostmode.png')} 
                style={{ width: 40, height: 40, resizeMode: 'contain' }}
              />
              <Animated.View 
                style={{ 
                  position: 'absolute', 
                  width: '100%', 
                  height: '100%', 
                  borderRadius: 24, 
                  backgroundColor: '#4ECDC4',
                  opacity: glowOpacity,
                  transform: [{ scale: 1.1 }]
                }} 
              />
            </Animated.View>
            
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '500',
                color: '#FFFFFF', 
                marginBottom: 4
              }}>
                Ghost
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                What's on your mind today?
              </Text>
            </View>
            
            <TouchableOpacity 
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: '#4ECDC4',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <MessageCircle size={18} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        
        {/* Memory Section - Horizontal memory bar per UI specs */}
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
              fontWeight: '600', 
              color: '#FFFFFF' 
            }}>
              Memories
            </Text>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => navigation.navigate('Memories')}
            >
              <Text style={{ 
                fontSize: 14, 
                color: '#4ECDC4', 
                marginRight: 4
              }}>
                View all
              </Text>
              <ChevronRight size={14} color="#4ECDC4" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 24, paddingRight: 16 }}
            data={memoryChips}
            ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={{
                  width: CHIP_WIDTH,
                  height: 110,
                  borderRadius: 16,
                  backgroundColor: 'rgba(32, 32, 36, 0.75)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  padding: 16,
                  justifyContent: 'space-between',
                }}
                activeOpacity={0.7}
              >
                <View 
                  style={{ 
                    width: 42, 
                    height: 42, 
                    borderRadius: 12, 
                    backgroundColor: `${item.color}20`,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                </View>
                <View>
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '500', 
                    color: '#FFFFFF',
                    marginBottom: 2
                  }}>
                    {item.title}
                  </Text>
                  <Text style={{ 
                    fontSize: 12, 
                    color: 'rgba(255, 255, 255, 0.5)'
                  }}>
                    {item.type === 'plan' ? 'Plan' : item.type === 'idea' ? 'Idea' : 'Note'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        
        {/* Ghost Chat Card */}
        <TouchableOpacity 
          style={{
            marginHorizontal: 24,
            borderRadius: 18,
            backgroundColor: 'rgba(32, 32, 36, 0.75)', 
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            padding: 20,
            marginBottom: 32,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          onPress={goToGhostChat}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ 
              width: 42, 
              height: 42, 
              borderRadius: 16,
              backgroundColor: 'rgba(78, 205, 196, 0.15)',
              justifyContent: 'center', 
              alignItems: 'center',
              marginRight: 12
            }}>
              <GhostIcon size={24} color="#FFFFFF" strokeWidth={1.5} />
            </View>
            
            <View>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: '#FFFFFF',
                marginBottom: 2
              }}>
                Ghost Chat
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                Open full conversation
              </Text>
            </View>
          </View>
          
          <View style={{ 
            width: 36, 
            height: 36, 
            borderRadius: 18, 
            backgroundColor: 'rgba(255, 255, 255, 0.07)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <ChevronRight size={18} color="#FFFFFF" strokeWidth={1.5} />
          </View>
        </TouchableOpacity>
        
        {/* Spaces Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingHorizontal: 24,
            marginBottom: 16
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '600', 
              color: '#FFFFFF' 
            }}>
              Spaces
            </Text>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => navigation.navigate('Spaces')}
            >
              <Text style={{ 
                fontSize: 14, 
                color: '#4ECDC4', 
                marginRight: 4
              }}>
                Explore
              </Text>
              <ChevronRight size={14} color="#4ECDC4" />
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
              <TouchableOpacity 
                style={{
                  width: MEMORY_CARD_WIDTH,
                  height: 160,
                  borderRadius: 18,
                  overflow: 'hidden',
                  backgroundColor: 'rgba(32, 32, 36, 0.75)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
                activeOpacity={0.7}
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
                  padding: 16
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
                      marginLeft: 4 
                    }}>
                      TRENDING
                    </Text>
                  </View>
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: '700', 
                    color: '#FFFFFF',
                    marginBottom: 4
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
              </TouchableOpacity>
            )}
          />
        </View>
        
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
