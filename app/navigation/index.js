/**
 * GhostMode Navigation System
 * Features a bottom tab navigation with glassmorphic effect
 * and stack navigators for each main section
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screen imports
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import SpacesScreen from '../screens/SpacesScreen';
import MemoryScreen from '../screens/MemoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Custom tab bar component
import GlassmorphicTabBar from '../components/ui/GlassmorphicTabBar';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => (
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

// Main Tab Navigator
const MainTabNavigator = () => (
  <Tab.Navigator
    tabBar={props => <GlassmorphicTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
    }}
    initialRouteName="Home"
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Spaces" component={SpacesScreen} />
    <Tab.Screen name="Memory" component={MemoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Root Navigator
const RootNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#121214' }
    }}
    initialRouteName="AuthLoading"
  >
    <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
    <Stack.Screen name="Auth" component={AuthNavigator} />
    <Stack.Screen name="Main" component={MainTabNavigator} />
  </Stack.Navigator>
);

// Main Navigation Container
const Navigation = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default Navigation;
