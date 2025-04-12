import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme';

const MemoryScreen = () => {
  // Placeholder data for memory chips
  const memories = [
    { id: '1', title: 'Project Roadmap', source: 'Design Team', date: '2 days ago', type: 'document' },
    { id: '2', title: 'Meeting Notes', source: 'Project Alpha', date: '1 week ago', type: 'text' },
    { id: '3', title: 'Vacation Ideas', source: 'Personal', date: 'Yesterday', type: 'list' },
  ];

  return (
    <View className="flex-1 bg-ghost-bg">
      <View className="p-6 border-b border-ghost-border bg-ghost-bg-deep">
        <Text className="text-xl font-bold text-ghost-text">Memory</Text>
      </View>
      
      <View className="p-4 border-b border-ghost-border">
        <TouchableOpacity className="bg-ghost-card p-4 rounded-xl flex-row items-center border border-ghost-border">
          <Text className="text-ghost-text-secondary">Search memories...</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1 p-6">
        <Text className="text-md font-semibold text-ghost-text mb-3">Recent Memories</Text>
        
        {memories.length > 0 ? (
          memories.map(memory => (
            <TouchableOpacity key={memory.id} className="bg-ghost-card rounded-2xl p-4 mb-3 border border-ghost-border">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base font-semibold text-ghost-text">{memory.title}</Text>
                <Text className="text-xs text-ghost-text-secondary">{memory.date}</Text>
              </View>
              <Text className="text-sm text-ghost-text-secondary mb-3">From: {memory.source}</Text>
              <View className="bg-[rgba(255,255,255,0.1)] px-3 py-1 rounded-full self-start">
                <Text className="text-xs text-ghost-text">{memory.type}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="bg-ghost-card rounded-2xl p-8 mb-6 items-center border border-ghost-border">
            <Text className="text-base font-medium text-ghost-text mb-2">No memories saved yet</Text>
            <Text className="text-sm text-ghost-text-secondary text-center">Your saved memories will appear here</Text>
          </View>
        )}
        
        <Text className="text-md font-semibold text-ghost-text mt-6 mb-3">Memory Timeline</Text>
        <View className="bg-ghost-card rounded-2xl p-8 mb-6 h-30 justify-center items-center border border-ghost-border">
          <Text className="text-sm text-ghost-text-secondary text-center">Memory timeline visualization will be here</Text>
        </View>
        
        <Text className="text-md font-semibold text-ghost-text mt-6 mb-3">Tagged Memories</Text>
        <View className="flex-row flex-wrap mb-8">
          <TouchableOpacity className="bg-[rgba(255,255,255,0.1)] px-4 py-1 rounded-full m-1">
            <Text className="text-sm text-ghost-text">Work</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[rgba(255,255,255,0.1)] px-4 py-1 rounded-full m-1">
            <Text className="text-sm text-ghost-text">Personal</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[rgba(255,255,255,0.1)] px-4 py-1 rounded-full m-1">
            <Text className="text-sm text-ghost-text">Ideas</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[rgba(255,255,255,0.1)] px-4 py-1 rounded-full m-1">
            <Text className="text-sm text-ghost-text">Tasks</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default MemoryScreen;
