import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors } from '../theme';

const HomeScreen = () => {
  return (
    <View className="flex-1 bg-ghost-bg">
      <View className="p-6 border-b border-ghost-border bg-ghost-bg-deep">
        <Text className="text-xl font-bold text-ghost-text">Home</Text>
      </View>
      
      <ScrollView className="flex-1 p-6">
        <View className="bg-ghost-card rounded-2xl p-6 mb-8 border border-ghost-border">
          <Text className="text-lg font-bold text-ghost-text mb-1">Welcome to GhostMode</Text>
          <Text className="text-sm text-ghost-text-secondary mb-6">Your personal AI companion is here</Text>
          
          <View className="flex-row bg-[rgba(255,255,255,0.1)] p-4 rounded-xl items-center">
            <Text className="text-2xl mr-2">👻</Text>
            <Text className="flex-1 text-sm text-ghost-text">Hi there! I'm your Ghost. What would you like to talk about today?</Text>
          </View>
        </View>
        
        <Text className="text-md font-semibold text-ghost-text mt-6 mb-3">Recent Conversations</Text>
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
