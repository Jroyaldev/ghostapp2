import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Switch, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { user, userProfile, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            signOut();
          }
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-ghost-bg">
      <View className="p-6 border-b border-ghost-border bg-ghost-bg-deep">
        <Text className="text-xl font-bold text-ghost-text">Profile</Text>
      </View>
      
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="p-6 items-center">
          <View className="h-24 w-24 rounded-full overflow-hidden mb-4 border-2 border-ghost-teal">
            <Image 
              source={{ uri: userProfile?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=ghost' }}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>
          <Text className="text-xl font-bold text-ghost-text">{userProfile?.displayName || user?.email}</Text>
          <Text className="text-ghost-text-secondary">{user?.email}</Text>
        </View>
        
        {/* Settings Sections */}
        <View className="px-6 mb-8">
          <View className="bg-ghost-card rounded-2xl overflow-hidden border border-ghost-border">
            {/* Account Settings */}
            <View className="p-4 border-b border-ghost-border">
              <Text className="text-lg font-semibold text-ghost-text mb-2">Account</Text>
            </View>
            
            <TouchableOpacity className="p-4 flex-row justify-between items-center">
              <Text className="text-ghost-text">Edit Profile</Text>
              <Text className="text-ghost-text-secondary">→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="p-4 flex-row justify-between items-center border-t border-ghost-border">
              <Text className="text-ghost-text">Notifications</Text>
              <Text className="text-ghost-text-secondary">→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="p-4 flex-row justify-between items-center border-t border-ghost-border">
              <Text className="text-ghost-text">Privacy</Text>
              <Text className="text-ghost-text-secondary">→</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View className="px-6 mb-8">
          <View className="bg-ghost-card rounded-2xl overflow-hidden border border-ghost-border">
            {/* Appearance Settings */}
            <View className="p-4 border-b border-ghost-border">
              <Text className="text-lg font-semibold text-ghost-text mb-2">Appearance</Text>
            </View>
            
            <View className="p-4 flex-row justify-between items-center">
              <Text className="text-ghost-text">Dark Mode</Text>
              <Switch
                value={true}
                trackColor={{ false: '#4B5563', true: 'rgba(62, 207, 178, 0.4)' }}
                thumbColor="#3ECFB2"
              />
            </View>
            
            <TouchableOpacity className="p-4 flex-row justify-between items-center border-t border-ghost-border">
              <Text className="text-ghost-text">Themes</Text>
              <Text className="text-ghost-text-secondary">→</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View className="px-6 mb-8">
          <TouchableOpacity 
            className="bg-ghost-card p-4 rounded-2xl border border-ghost-border items-center" 
            onPress={handleSignOut}
            disabled={loading}
          >
            <Text className="text-red-500 font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
