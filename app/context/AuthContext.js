/**
 * Authentication Context Provider for GhostMode
 * Manages global authentication state and provides auth methods
 * Following Apple-like precision with clean architecture
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { auth, subscribeToAuthChanges, signIn, signUp, signOutUser, getUserProfile } from '../services/firebase';

// Create the auth context
const AuthContext = createContext({});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        // Get user profile data
        const { profile, error } = await getUserProfile(authUser.uid);
        if (profile) {
          setUserProfile(profile);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      
      if (initializing) setInitializing(false);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, [initializing]);

  // Sign in with email and password
  const handleSignIn = async (email, password) => {
    setLoading(true);
    const { user, error } = await signIn(email, password);
    setLoading(false);
    
    if (error) {
      Alert.alert('Sign In Error', error);
      return false;
    }
    
    return true;
  };

  // Sign up with email and password
  const handleSignUp = async (email, password, displayName) => {
    setLoading(true);
    const { user, error } = await signUp(email, password, displayName);
    setLoading(false);
    
    if (error) {
      Alert.alert('Sign Up Error', error);
      return false;
    }
    
    return true;
  };

  // Sign out
  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await signOutUser();
    setLoading(false);
    
    if (error) {
      Alert.alert('Sign Out Error', error);
      return false;
    }
    
    return true;
  };

  // Export auth values and methods
  const value = {
    user,
    userProfile,
    loading,
    initializing,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
