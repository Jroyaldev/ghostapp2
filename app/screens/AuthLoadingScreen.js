import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const AuthLoadingScreen = ({ navigation }) => {
  const { user, initializing } = useAuth();

  useEffect(() => {
    // Check authentication state and navigate accordingly
    if (!initializing) {
      if (user) {
        navigation.replace('Main');
      } else {
        navigation.replace('Auth');
      }
    }
  }, [user, initializing, navigation]);

  return (
    <View className="flex-1 bg-ghost-bg justify-center items-center">
      <View className="bg-ghost-card/30 backdrop-blur-md rounded-2xl p-8 items-center border border-ghost-border">
        <Text className="text-ghost-text text-2xl font-bold mb-4">GhostMode</Text>
        <ActivityIndicator size="large" color="#3ECFB2" />
      </View>
    </View>
  );
};

export default AuthLoadingScreen;
