import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { colors, typography, spacing } from '../theme';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View className="flex-1 bg-ghost-bg p-6 justify-between">
      <View className="items-center mt-16">
        <Text className="text-3xl font-bold text-ghost-text mb-2">GhostMode</Text>
        <Text className="text-base text-ghost-text-secondary">Chat with depth and memory</Text>
      </View>
      
      <View className="items-center justify-center flex-1">
        {/* Placeholder for ghost animation/image */}
        <View className="w-36 h-36 rounded-full bg-ghost-glow justify-center items-center border border-ghost-border">
          <Text className="text-6xl">👻</Text>
        </View>
      </View>
      
      <View className="mb-8">
        <TouchableOpacity 
          className="bg-ghost-teal p-4 rounded-xl items-center mb-3"
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text className="text-base font-medium text-ghost-bg-deep">Create Account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-transparent p-4 rounded-xl items-center border border-ghost-border"
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text className="text-base font-medium text-ghost-text">Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WelcomeScreen;
