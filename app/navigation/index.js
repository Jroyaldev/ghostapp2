/**
 * GhostMode Navigation System
 * Features a bottom tab navigation with glassmorphic effect
 * and stack navigators for each main section
 */

import React, { useEffect } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';

// Screen imports
import WelcomeScreen from '../screens/WelcomeScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import SpacesScreen from '../screens/SpacesScreen';
import MemoryScreen from '../screens/MemoryScreen';
import MemoriesScreen from '../screens/MemoriesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TestFirebaseScreen from '../screens/TestFirebaseScreen';
import GhostChatScreen from '../screens/GhostChatScreen';
import SpaceChatScreen from '../screens/SpaceChatScreen';

// Custom tab bar component
import GlassmorphicTabBar from '../components/ui/GlassmorphicTabBar';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
const AuthStack = () => (
  <Stack.Navigator 
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#121214' }
    }}
  >
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="SignIn" component={SignInScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

// Primary Navigation Flow
const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#121214' }
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="GhostChat" component={GhostChatScreen} />
      <Stack.Screen name="Memories" component={MemoriesScreen} />
      <Stack.Screen name="SpaceChat" component={SpaceChatScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabs = () => (
  <Tab.Navigator
    tabBar={props => <GlassmorphicTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Spaces" component={SpacesScreen} />
    <Tab.Screen name="Memory" component={MemoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="TestFirebase" component={TestFirebaseScreen} />
  </Tab.Navigator>
);

// Root Navigator that includes both auth and main flows
const RootNavigator = () => {
  const { user, loading, pendingVerification } = useAuth();

  console.log('RootNavigator - Auth state:', { 
    userExists: !!user, 
    userId: user?.uid, 
    loading, 
    pendingVerification 
  });
  
  // Simple loading screen
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121214' }}>
        <Text style={{ color: '#fff', marginBottom: 10 }}>Loading GhostMode...</Text>
        <ActivityIndicator size="large" color="#3ECFB2" />
      </View>
    );
  }

  // When not loading, show either auth flow or main app based on authentication state
  // If pendingVerification is true, we need to keep the user in the auth flow
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user && !pendingVerification ? (
        <Stack.Screen name="MainApp" component={AppStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

// Main Navigation Container
const Navigation = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default Navigation;
