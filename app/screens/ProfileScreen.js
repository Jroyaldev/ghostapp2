import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme';

const ProfileScreen = ({ navigation }) => {
  // Placeholder user data
  const user = {
    name: 'Alex Johnson',
    handle: '@alexj',
    joinDate: 'April 2025',
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { id: '1', label: 'Edit Profile' },
        { id: '2', label: 'Notifications' },
        { id: '3', label: 'Privacy' },
      ],
    },
    {
      title: 'Ghost Preferences',
      items: [
        { id: '4', label: 'Personality Settings' },
        { id: '5', label: 'Memory Management' },
        { id: '6', label: 'Vibe Controls' },
      ],
    },
    {
      title: 'App Settings',
      items: [
        { id: '7', label: 'Appearance' },
        { id: '8', label: 'About GhostMode' },
        { id: '9', label: 'Help & Support' },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-ghost-bg">
      <View className="p-6 border-b border-ghost-border bg-ghost-bg-deep">
        <Text className="text-xl font-bold text-ghost-text">Profile</Text>
      </View>
      
      <ScrollView className="flex-1 p-6">
        <View className="flex-row bg-ghost-card rounded-2xl p-6 mb-8 items-center border border-ghost-border">
          <View className="w-15 h-15 rounded-full bg-ghost-coral justify-center items-center mr-4">
            <Text className="text-xl font-bold text-ghost-bg-deep">{user.name.charAt(0)}</Text>
          </View>
          
          <View className="flex-1">
            <Text className="text-lg font-semibold text-ghost-text mb-1">{user.name}</Text>
            <Text className="text-sm text-ghost-text-secondary mb-1">{user.handle}</Text>
            <Text className="text-xs text-ghost-text-secondary">Joined {user.joinDate}</Text>
          </View>
          
          <TouchableOpacity className="bg-[rgba(255,255,255,0.1)] px-3 py-1 rounded-xl">
            <Text className="text-sm text-ghost-text">Edit</Text>
          </TouchableOpacity>
        </View>
        
        <View className="mb-8">
          <Text className="text-md font-semibold text-ghost-text mb-3">Your Ghost</Text>
          <View className="flex-row bg-ghost-card rounded-2xl p-4 items-center border border-ghost-border">
            <View className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.1)] justify-center items-center mr-4">
              <Text className="text-2xl">👻</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-ghost-text mb-1">Helper Ghost</Text>
              <Text className="text-sm text-ghost-text-secondary">Your friendly and helpful assistant</Text>
            </View>
            <TouchableOpacity className="bg-ghost-teal px-3 py-1 rounded-xl">
              <Text className="text-sm text-ghost-bg-deep">Change</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {settingsSections.map(section => (
          <View key={section.title} className="mb-8">
            <Text className="text-md font-semibold text-ghost-text mb-3">{section.title}</Text>
            
            <View className="bg-ghost-card rounded-2xl overflow-hidden border border-ghost-border">
              {section.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <TouchableOpacity className="p-4">
                    <Text className="text-base text-ghost-text">{item.label}</Text>
                  </TouchableOpacity>
                  {index < section.items.length - 1 && <View className="h-[1px] bg-ghost-divider" />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}
        
        <TouchableOpacity 
          className="bg-[rgba(255,107,107,0.2)] p-4 rounded-xl items-center mb-8"
          onPress={() => navigation.navigate('Auth')}
        >
          <Text className="text-base font-medium text-ghost-coral">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
