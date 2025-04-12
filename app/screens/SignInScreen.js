import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuth();

  const handleSignIn = async () => {
    if (email.trim() === '' || password === '') {
      alert('Please enter both email and password');
      return;
    }

    const success = await signIn(email, password);
    if (success) {
      // Auth context will automatically navigate to Main screen once user is authenticated
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-ghost-bg"
    >
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View className="px-6 py-12 flex-1 justify-center">
          {/* Logo and Welcome */}
          <View className="items-center mb-10">
            <Image 
              source={require('../../assets/icon.png')} 
              className="w-24 h-24 mb-4"
              resizeMode="contain"
            />
            <Text className="text-ghost-text text-2xl font-bold">Welcome Back</Text>
            <Text className="text-ghost-text-secondary text-center mt-2">
              Sign in to continue your conversations
            </Text>
          </View>
          
          {/* Form */}
          <View className="mb-6">
            <View className="mb-4">
              <Text className="text-ghost-text-secondary mb-2">Email</Text>
              <TextInput
                className="bg-ghost-card border border-ghost-border rounded-xl p-4 text-ghost-text"
                placeholder="your@email.com"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-ghost-text-secondary mb-2">Password</Text>
              <TextInput
                className="bg-ghost-card border border-ghost-border rounded-xl p-4 text-ghost-text"
                placeholder="Your password"
                placeholderTextColor="#6B7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>
          
          {/* Actions */}
          <View>
            <TouchableOpacity 
              className="bg-ghost-teal p-4 rounded-xl items-center"
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold">Sign In</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="mt-4 p-4 items-center"
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text className="text-ghost-text-secondary">
                Don't have an account? <Text className="text-ghost-teal">Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;
