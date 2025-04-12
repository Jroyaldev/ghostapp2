import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../theme';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 bg-ghost-bg p-6">
        <View className="mt-16 mb-8">
          <Text className="text-2xl font-bold text-ghost-text mb-2">Welcome Back</Text>
          <Text className="text-base text-ghost-text-secondary">Sign in to continue</Text>
        </View>
        
        <View className="mb-8">
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
              placeholder="Enter your password"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity>
            <Text className="text-ghost-teal text-sm text-right mt-2">Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        
        <View className="mt-auto mb-8">
          <TouchableOpacity 
            className="bg-ghost-teal p-4 rounded-xl items-center"
            onPress={() => {
              // For development, we'll navigate directly to Main
              // In a real app, this would authenticate with Firebase, then navigate to Main.
              navigation.navigate('Main');
            }}
          >
            <Text className="text-base font-medium text-ghost-bg-deep">Sign In</Text>
          </TouchableOpacity>
          
          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-ghost-text-secondary">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text className="text-sm font-medium text-ghost-teal">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;
