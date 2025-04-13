/**
 * Firebase Test Screen
 * This screen allows testing the Firebase integration
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { testFirebaseAuth, testFirestore } from '../utils/testFirebase';
import { auth, signOutUser } from '../services/firebase';

const TestFirebaseScreen = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

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
      <View className="p-6 border-b border-ghost-border bg-ghost-bg-deep">
        <Text className="text-xl font-bold text-ghost-text">Firebase Test</Text>
      </View>
      
      <ScrollView className="flex-1 p-6">
        {/* User Status */}
        <View className="bg-ghost-card rounded-2xl p-6 mb-6 border border-ghost-border">
          <Text className="text-lg font-bold text-ghost-text mb-2">Authentication Status</Text>
          {user ? (
            <View>
              <Text className="text-ghost-text">Signed in as: <Text className="text-ghost-teal">{user.email}</Text></Text>
              <Text className="text-ghost-text">User ID: <Text className="text-ghost-text-secondary">{user.uid}</Text></Text>
            </View>
          ) : (
            <Text className="text-ghost-text-secondary">Not signed in</Text>
          )}
        </View>
        
        {/* Test Buttons */}
        <View className="flex-row mb-6 space-x-4">
          <TouchableOpacity 
            className="flex-1 bg-ghost-teal p-4 rounded-xl items-center justify-center" 
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
            className="flex-1 bg-ghost-violet p-4 rounded-xl items-center justify-center" 
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
            className="bg-ghost-coral/80 p-4 rounded-xl items-center mb-6" 
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
            className="max-h-60 bg-ghost-bg-deep rounded-xl p-4" 
            nestedScrollEnabled={true}
          >
            {logs.length === 0 ? (
              <Text className="text-ghost-text-secondary italic">No logs yet. Run a test to see results here.</Text>
            ) : (
              logs.map((log, index) => (
                <Text 
                  key={index} 
                  className={`text-sm mb-1 ${log.isError ? 'text-ghost-coral' : 'text-ghost-text'}`}
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
