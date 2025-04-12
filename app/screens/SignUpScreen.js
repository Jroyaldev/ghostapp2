import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors } from '../theme';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-ghost-bg p-6" contentContainerStyle={{ paddingBottom: 48 }}>
        <View className="mt-16 mb-8">
          <Text className="text-2xl font-bold text-ghost-text mb-2">Create Account</Text>
          <Text className="text-base text-ghost-text-secondary">Join the GhostMode experience</Text>
        </View>
        
        <View className="mb-8">
          <View className="mb-4">
            <Text className="text-sm text-ghost-text-secondary mb-1">Name</Text>
            <TextInput
              className="bg-ghost-card rounded-xl p-4 text-ghost-text border border-ghost-border"
              placeholder="Enter your name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-sm text-ghost-text-secondary mb-1">Email</Text>
            <TextInput
              className="bg-ghost-card rounded-xl p-4 text-ghost-text border border-ghost-border"
              placeholder="Enter your email"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-sm text-ghost-text-secondary mb-1">Password</Text>
            <TextInput
              className="bg-ghost-card rounded-xl p-4 text-ghost-text border border-ghost-border"
              placeholder="Create a password"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <Text className="text-xs text-ghost-text-secondary text-center mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
        
        <View className="mt-8">
          <TouchableOpacity 
            className="bg-ghost-teal p-4 rounded-xl items-center"
            onPress={() => {
              // For development, we'll navigate directly to Main
              // In a real app, this would create an account with Supabase
              navigation.navigate('Main');
            }}
          >
            <Text className="text-base font-medium text-ghost-bg-deep">Create Account</Text>
          </TouchableOpacity>
          
          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-ghost-text-secondary">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text className="text-sm font-medium text-ghost-teal">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
