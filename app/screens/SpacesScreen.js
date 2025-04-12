import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme';

const SpacesScreen = () => {
  // Placeholder data for spaces
  const spaces = [
    { id: '1', name: 'Design Team', members: 8, vibe: 'helpful' },
    { id: '2', name: 'Project Alpha', members: 5, vibe: 'serious' },
    { id: '3', name: 'Meme Vault', members: 12, vibe: 'chaotic' },
    { id: '4', name: 'Reading Club', members: 4, vibe: 'friendly' },
  ];

  const getVibeColor = (vibe) => {
    switch(vibe) {
      case 'friendly': return colors.vibe.friendly;
      case 'helpful': return colors.vibe.helpful;
      case 'chaotic': return colors.vibe.chaotic;
      case 'serious': return colors.vibe.serious;
      default: return colors.vibe.helpful;
    }
  };

  return (
    <View className="flex-1 bg-ghost-bg">
      <View className="p-6 border-b border-ghost-border bg-ghost-bg-deep">
        <Text className="text-xl font-bold text-ghost-text">Spaces</Text>
      </View>
      
      <ScrollView className="flex-1 p-6">
        <View className="bg-ghost-card rounded-2xl p-6 mb-8 border border-ghost-border">
          <Text className="text-lg font-bold text-ghost-text mb-1">Create a New Space</Text>
          <Text className="text-sm text-ghost-text-secondary mb-6">Start a conversation with friends or colleagues</Text>
          <TouchableOpacity className="bg-ghost-teal p-4 rounded-xl items-center">
            <Text className="text-base font-medium text-ghost-bg-deep">+ New Space</Text>
          </TouchableOpacity>
        </View>
        
        <Text className="text-md font-semibold text-ghost-text mt-6 mb-3">Your Spaces</Text>
        
        {spaces.map(space => (
          <TouchableOpacity key={space.id} className="flex-row bg-ghost-card rounded-2xl p-4 mb-3 items-center border border-ghost-border">
            <View 
              style={{
                width: 12,
                height: 50,
                borderRadius: 6,
                marginRight: 16,
                backgroundColor: getVibeColor(space.vibe)
              }} 
            />
            <View className="flex-1">
              <Text className="text-base font-semibold text-ghost-text mb-1">{space.name}</Text>
              <Text className="text-sm text-ghost-text-secondary">{space.members} members</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default SpacesScreen;
