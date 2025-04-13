import React from 'react';
import { View, Text, ScrollView, StatusBar, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, GhostIcon, MessageCircle } from 'lucide-react-native';
import { colors } from '../theme';

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // Function to navigate to GhostChat while ensuring consistent navigation
  const goToGhostChat = () => {
    // With our new navigation structure, we navigate to the GhostChat screen directly
    navigation.navigate('GhostChat');
  };
  
  return (
    <View className="flex-1 bg-ghost-bg">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Premium Hero Section */}
      <View style={{ backgroundColor: '#1A1A1E' }} className="border-b border-ghost-border">
        <View 
          style={{ paddingTop: insets.top + 10 }}
          className="px-6 pb-6"
        >
          {/* Top Navigation */}
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center">
              <View className="bg-[rgba(62,207,178,0.1)] p-1 rounded-full">
                <GhostIcon size={20} color="#FFFFFF" strokeWidth={1.5} />
              </View>
              <Text className="text-xl font-semibold text-ghost-text ml-2">GhostMode</Text>
            </View>
            <View className="bg-[rgba(255,255,255,0.05)] p-2 rounded-full">
              <Bell size={18} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
            </View>
          </View>
          
          {/* Feature highlight */}
          <View className="mb-3">
            <View className="flex-row items-center mb-1.5">
              <View className="bg-[rgba(62,207,178,0.15)] px-2 py-0.5 rounded-full">
                <Text className="text-xs font-semibold text-[#3ECFB2]">SPOTLIGHT</Text>
              </View>
            </View>
            
            {/* Hero Headline */}
            <Text className="text-2xl font-bold text-ghost-text leading-tight mb-2">Your digital companion</Text>
            <Text className="text-base text-ghost-text-secondary opacity-80 leading-relaxed">Experience AI that adapts to your vibe and remembers what matters to you</Text>
          </View>
        </View>
      </View>
      
      <ScrollView className="flex-1 px-6 pt-5">
        <View className="bg-ghost-card rounded-2xl p-6 mb-8 border border-ghost-border shadow-lg">
          <Text className="text-lg font-bold text-ghost-text mb-1">Welcome to GhostMode</Text>
          <Text className="text-sm text-ghost-text-secondary mb-6">Your personal AI companion is here</Text>
          
          <TouchableOpacity 
            className="flex-row bg-[rgba(255,255,255,0.08)] p-4 rounded-xl items-center shadow-inner"
            onPress={goToGhostChat}
            activeOpacity={0.8}
          >
            <View className="bg-[rgba(62,207,178,0.1)] p-1.5 rounded-full mr-3">
              <Text className="text-xl">👻</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm text-ghost-text">Hi there! I'm your Ghost. What would you like to talk about today?</Text>
            </View>
            <View className="bg-[#3ECFB2] rounded-full p-2 ml-2">
              <MessageCircle size={16} color="#FFFFFF" strokeWidth={2} />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Ghost Chat Card */}
        <TouchableOpacity 
          className="bg-ghost-card rounded-2xl p-6 mb-6 border border-ghost-border flex-row items-center justify-between"
          onPress={goToGhostChat}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <View className="bg-[rgba(62,207,178,0.15)] p-2.5 rounded-full mr-3">
              <GhostIcon size={24} color="#FFFFFF" strokeWidth={1.5} />
            </View>
            <View>
              <Text className="text-lg font-semibold text-ghost-text">Ghost Chat</Text>
              <Text className="text-sm text-ghost-text-secondary">Talk with your AI companion</Text>
            </View>
          </View>
          <View className="bg-[rgba(255,255,255,0.08)] p-2 rounded-full">
            <MessageCircle size={18} color="#FFFFFF" strokeWidth={1.5} />
          </View>
        </TouchableOpacity>
        
        <Text className="text-md font-semibold text-ghost-text mt-2 mb-3">Recent Conversations</Text>
        <View className="bg-ghost-card rounded-2xl p-6 mb-6 h-30 justify-center items-center border border-ghost-border">
          <Text className="text-sm text-ghost-text-secondary text-center">Your conversations will appear here</Text>
        </View>
        
        <Text className="text-md font-semibold text-ghost-text mt-6 mb-3">Memories</Text>
        <View className="bg-ghost-card rounded-2xl p-6 mb-6 h-30 justify-center items-center border border-ghost-border">
          <Text className="text-sm text-ghost-text-secondary text-center">Your memories will be stored here</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
