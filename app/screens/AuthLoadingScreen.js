import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const AuthLoadingScreen = ({ navigation }) => {
  const { user, initialized } = useAuth();

  // Log for debugging
  console.log('AuthLoadingScreen - User:', user?.uid, 'Initialized:', initialized);

  useEffect(() => {
    // Check authentication state and navigate accordingly
    if (initialized) {
      if (user) {
        console.log('AuthLoadingScreen - Navigating to Main');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        console.log('AuthLoadingScreen - Navigating to Auth');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      }
    }
  }, [user, initialized, navigation]);

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
