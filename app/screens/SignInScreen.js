import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const SignInScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const { 
    phoneSignIn, 
    verifyCode, 
    loading, 
    user, 
    recaptchaVerifier, 
    pendingVerification,
    verificationPhoneNumber 
  } = useAuth();

  // Debug message to track component rendering
  console.log('SignInScreen rendered, codeSent:', codeSent, 'pendingVerification:', pendingVerification);

  // When user state changes, check if we should navigate
  useEffect(() => {
    if (user) {
      console.log('SignInScreen - User authenticated:', user.uid);
    }
  }, [user]);

  // Set codeSent state based on pendingVerification from auth context
  useEffect(() => {
    if (pendingVerification) {
      setCodeSent(true);
      console.log('Setting codeSent to true because pendingVerification is true');
    }
  }, [pendingVerification]);

  // Pre-fill phone number from context if available
  useEffect(() => {
    if (verificationPhoneNumber && !phoneNumber) {
      setPhoneNumber(verificationPhoneNumber);
      console.log('Pre-filling phone number from context:', verificationPhoneNumber);
    }
  }, [verificationPhoneNumber, phoneNumber]);

  const handleSendCode = () => {
    if (phoneNumber.trim() === '') {
      Alert.alert('GhostMode', 'Please enter your phone number');
      return;
    }

    // Show confirmation to user before continuing
    Alert.alert(
      'Verify Phone Number',
      `We'll send a verification code to: ${phoneNumber}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Code', 
          onPress: () => {
            if (!recaptchaVerifier.current) {
              Alert.alert('GhostMode', 'reCAPTCHA verifier is not initialized. Please try again.');
              return;
            }

            phoneSignIn(phoneNumber, (verificationId) => {
              // On success callback
              console.log('Code sent successfully to:', phoneNumber);
              setCodeSent(true);
            }, (error) => {
              // On error callback
              Alert.alert('GhostMode', `Error sending verification code: ${error.message || error}`);
            });
          }
        }
      ]
    );
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.trim().length < 6) {
      Alert.alert('GhostMode', 'Please enter a valid 6-digit verification code');
      return;
    }

    // Log the verification attempt
    console.log(`Attempting verification for ${phoneNumber} with code ${verificationCode}`);
    
    try {
      // Verify the code - this will set the user in the auth context
      const success = await verifyCode(phoneNumber, verificationCode);
      console.log('Verification result:', success ? 'success' : 'failed');
      
      if (!success) {
        Alert.alert('GhostMode', 'Invalid verification code. Please try again.');
      }
    } catch (error) {
      Alert.alert('GhostMode', `Verification error: ${error.message || error}`);
    }
  };

  const handleChangePhoneNumber = () => {
    // This function resets the verification state completely
    setCodeSent(false);
    setVerificationCode('');
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
            {!codeSent ? (
              // Phone number input
              <View className="mb-4">
                <Text className="text-ghost-text-secondary mb-2">Phone Number</Text>
                <TextInput
                  className="bg-ghost-card border border-ghost-border rounded-xl p-4 text-ghost-text"
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor="#6B7280"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  autoCompleteType="tel"
                />
                <Text className="text-ghost-text-secondary text-xs mt-2">Enter your phone number with country code</Text>
              </View>
            ) : (
              // Verification code input
              <View className="mb-4">
                <Text className="text-ghost-text-secondary mb-2">Verification Code</Text>
                <TextInput
                  className="bg-ghost-card border border-ghost-border rounded-xl p-4 text-ghost-text"
                  placeholder="Enter the code sent to your phone"
                  placeholderTextColor="#6B7280"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus={true}
                />
                <Text className="text-ghost-text-secondary text-xs mt-2">Enter the 6-digit code sent to your phone</Text>
              </View>
            )}
          </View>
          
          {/* Actions */}
          <View>
            <TouchableOpacity 
              className="bg-ghost-teal p-4 rounded-xl items-center"
              onPress={codeSent ? handleVerifyCode : handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold">
                  {codeSent ? "Verify Code" : "Send Verification Code"}
                </Text>
              )}
            </TouchableOpacity>
            
            {codeSent && (
              <TouchableOpacity 
                className="mt-4 p-2 items-center"
                onPress={handleChangePhoneNumber}
                disabled={loading}
              >
                <Text className="text-ghost-teal">Change Phone Number</Text>
              </TouchableOpacity>
            )}
            
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
