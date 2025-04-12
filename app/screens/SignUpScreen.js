import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, loading } = useAuth();

  const handleSignUp = async () => {
    if (name.trim() === '' || email.trim() === '' || password === '') {
      alert('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    const success = await signUp(email, password, name);
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
            <Text className="text-2xl font-bold text-ghost-text">Create Account</Text>
            <Text className="text-base text-ghost-text-secondary text-center mt-2">
              Join the GhostMode experience
            </Text>
          </View>
          
          {/* Form */}
          <View className="mb-6">
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
          </View>
          
          {/* Actions */}
          <View>
            <TouchableOpacity 
              className="bg-ghost-teal p-4 rounded-xl items-center"
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-medium text-ghost-bg-deep">Create Account</Text>
              )}
            </TouchableOpacity>
            
            <View className="flex-row justify-center mt-6">
              <Text className="text-sm text-ghost-text-secondary">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text className="text-sm font-medium text-ghost-teal">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
