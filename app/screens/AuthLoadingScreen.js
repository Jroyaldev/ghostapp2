import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { colors } from '../theme';

const AuthLoadingScreen = ({ navigation }) => {
  useEffect(() => {
    // Simulating authentication check
    // In a real app, this would check if the user is authenticated
    const checkAuth = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For now, always redirect to Auth flow
      // Change this to 'Main' once authentication is implemented
      navigation.replace('Auth');
    };
    
    checkAuth();
  }, []);
  
  return (
    <View className="flex-1 justify-center items-center bg-ghost-bg">
      <ActivityIndicator size="large" color={colors.vibe.helpful} />
      <Text className="text-ghost-text-secondary mt-4">Loading GhostMode...</Text>
    </View>
  );
};

export default AuthLoadingScreen;
