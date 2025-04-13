/**
 * Firebase Test Screen
 * This screen allows testing the Firebase integration
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { testFirebaseAuth, testFirestore } from '../utils/testFirebase';
import { auth, signOutUser } from '../services/firebase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlaskConical } from 'lucide-react-native';

const TestFirebaseScreen = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Update user state when auth state changes
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);

  // Add log message with timestamp
  const addLog = (message, isError = false) => {
    const timestamp = new Date().toISOString().slice(11, 19);
    setLogs(current => [
      { timestamp, message, isError },
      ...current
    ]);
    console.log(`${timestamp}: ${message}`);
  };

  // Test Firebase Authentication
  const handleTestAuth = async () => {
    setLoading(true);
    addLog('Starting Firebase Auth test...');
    
    try {
      const success = await testFirebaseAuth();
      if (success) {
        addLog('✅ Firebase Auth test completed successfully');
        setUser(auth.currentUser);
      } else {
        addLog('❌ Firebase Auth test failed', true);
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Test Firestore
  const handleTestFirestore = async () => {
    setLoading(true);
    addLog('Starting Firestore test...');
    
    try {
      const success = await testFirestore();
      if (success) {
        addLog('✅ Firestore test completed successfully');
      } else {
        addLog('❌ Firestore test failed', true);
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    setLoading(true);
    addLog('Signing out...');
    
    try {
      const { error } = await signOutUser();
      if (error) {
        addLog(`❌ Sign out error: ${error}`, true);
      } else {
        addLog('✅ Signed out successfully');
        setUser(null);
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-ghost-bg">
      <View 
        style={{ paddingTop: insets.top + 10 }}
        className="px-6 pb-4 border-b border-ghost-border bg-[#1A1A1E]"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="bg-[rgba(229,164,105,0.1)] p-1 rounded-full">
              <FlaskConical size={20} color="#E5A469" strokeWidth={1.5} />
            </View>
            <Text className="text-xl font-semibold text-ghost-text ml-2">Firebase Test</Text>
          </View>
        </View>
      </View>
      
      <ScrollView className="flex-1 p-6">
        {/* User Status */}
        <View className="bg-ghost-card rounded-2xl p-6 mb-6 border border-ghost-border">
          <Text className="text-lg font-bold text-ghost-text mb-2">Authentication Status</Text>
          {user ? (
            <View>
              <Text className="text-ghost-text">Signed in as: <Text className="text-[#3ECFB2]">{user.email}</Text></Text>
              <Text className="text-ghost-text">User ID: <Text className="text-ghost-text-secondary">{user.uid}</Text></Text>
            </View>
          ) : (
            <Text className="text-ghost-text-secondary">Not signed in</Text>
          )}
        </View>
        
        {/* Test Buttons */}
        <View className="flex-row mb-6 space-x-4">
          <TouchableOpacity 
            className="flex-1 bg-[#3ECFB2] p-4 rounded-xl items-center justify-center" 
            onPress={handleTestAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold">Test Auth</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 bg-[#9179FF] p-4 rounded-xl items-center justify-center" 
            onPress={handleTestFirestore}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold">Test Firestore</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {user && (
          <TouchableOpacity 
            className="bg-[#FF6B6B]/80 p-4 rounded-xl items-center mb-6" 
            onPress={handleSignOut}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold">Sign Out</Text>
            )}
          </TouchableOpacity>
        )}
        
        {/* Logs */}
        <View className="bg-ghost-card rounded-2xl p-4 border border-ghost-border">
          <Text className="text-lg font-bold text-ghost-text mb-2">Test Logs</Text>
          <ScrollView 
            className="max-h-60 bg-[#1A1A1E] rounded-xl p-4" 
            nestedScrollEnabled={true}
          >
            {logs.length === 0 ? (
              <Text className="text-ghost-text-secondary italic">No logs yet. Run a test to see results here.</Text>
            ) : (
              logs.map((log, index) => (
                <Text 
                  key={index} 
                  className={`text-sm mb-1 ${log.isError ? 'text-[#FF6B6B]' : 'text-ghost-text'}`}
                >
                  <Text className="text-ghost-text-secondary">[{log.timestamp}]</Text> {log.message}
                </Text>
              ))
            )}
          </ScrollView>
        </View>
        
        <View className="h-10" />
      </ScrollView>
    </View>
  );
};

export default TestFirebaseScreen;
