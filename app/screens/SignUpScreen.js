import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const { phoneSignIn, verifyCode, loading, user } = useAuth();

  // When user state changes, check if we should navigate
  useEffect(() => {
    if (user) {
      console.log('SignUpScreen - User authenticated, navigating to Main');
      // No need to navigate manually - navigation container will handle this
    }
  }, [user, navigation]);

  const handleSendCode = () => {
    if (name.trim() === '' || phoneNumber.trim() === '') {
      Alert.alert('GhostMode', 'Please enter your name and phone number');
      return;
    }

    // Format phone number if needed (remove non-numeric chars)
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    
    // Send verification code
    phoneSignIn(formattedPhone, () => {
      // On success callback
      setCodeSent(true);
    }, (error) => {
      // On error callback
      Alert.alert('GhostMode', `Error sending verification code: ${error}`);
    });
  };

  const handleSignUp = async () => {
    if (verificationCode.trim() === '') {
      Alert.alert('GhostMode', 'Please enter the verification code');
      return;
    }

    // Verify the code and create the account
    verifyCode(phoneNumber, verificationCode, name);
    // No need to navigate manually - the navigation container will handle this
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
            <Text className="text-ghost-text text-2xl font-bold">Create Account</Text>
            <Text className="text-ghost-text-secondary text-center mt-2">
              Join the conversation with GhostMode
            </Text>
          </View>
          
          {/* Form */}
          <View className="mb-6">
            {!codeSent ? (
              // Step 1: Enter name and phone
              <>
                <View className="mb-4">
                  <Text className="text-sm text-ghost-text-secondary mb-1">Name</Text>
                  <TextInput
                    className="bg-ghost-card rounded-xl p-4 text-ghost-text border border-ghost-border"
                    placeholder="Your name"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
                
                <View className="mb-4">
                  <Text className="text-sm text-ghost-text-secondary mb-1">Phone Number</Text>
                  <TextInput
                    className="bg-ghost-card rounded-xl p-4 text-ghost-text border border-ghost-border"
                    placeholder="+1 (555) 123-4567"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    autoCompleteType="tel"
                  />
                </View>
              </>
            ) : (
              // Step 2: Enter verification code
              <View className="mb-4">
                <Text className="text-sm text-ghost-text-secondary mb-1">Verification Code</Text>
                <TextInput
                  className="bg-ghost-card rounded-xl p-4 text-ghost-text border border-ghost-border"
                  placeholder="Enter the code sent to your phone"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            )}
          </View>
          
          {/* Actions */}
          <View>
            <TouchableOpacity 
              className="bg-ghost-teal p-4 rounded-xl items-center"
              onPress={codeSent ? handleSignUp : handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-medium text-ghost-bg-deep">
                  {codeSent ? "Create Account" : "Send Verification Code"}
                </Text>
              )}
            </TouchableOpacity>
            
            {codeSent && (
              <TouchableOpacity 
                className="mt-4 p-2 items-center"
                onPress={() => setCodeSent(false)}
                disabled={loading}
              >
                <Text className="text-ghost-teal">Change Phone Number</Text>
              </TouchableOpacity>
            )}
            
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
