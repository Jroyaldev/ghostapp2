import React, { useRef } from 'react';
import { View, Text, FlatList, Animated, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Sparkle, ListChecks, Star, Bookmark, Copy, Globe2, Smile } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = 80; // Narrower width for more compact layout
const CENTER_OFFSET = (width - ITEM_WIDTH) / 2;

// Map prompt to icon
const promptIcons = {
  'Summarize this chat': Sparkle,
  'Highlight key points': Star,
  'Add a checklist': ListChecks,
  'Send a spooky joke': Smile,
  'Translate last message': Globe2,
  // fallback: Copy
};

export default function PromptBanner({ prompts, onPromptPress }) {
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH,
    ];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1.2, 0.9],
      extrapolate: 'clamp',
    });
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.2, 1, 0.2],
      extrapolate: 'clamp',
    });
    const labelOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });
    const Icon = promptIcons[item] || Copy;
    return (
      <View style={{ width: ITEM_WIDTH, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={{
          transform: [{ scale }],
          backgroundColor: 'rgba(62,207,178,0.10)',
          borderRadius: 20,
          padding: 10,
          shadowColor: '#3ECFB2',
          shadowOpacity: 0.10,
          shadowRadius: 12,
          marginBottom: 2,
        }}>
          <TouchableOpacity onPress={() => onPromptPress(item)}>
            <Icon color="#3ECFB2" size={22} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.Text style={[styles.label, { 
          opacity: labelOpacity, 
          marginTop: 6, 
          width: 90, 
          fontSize: 13, 
          fontWeight: '600', 
          color: '#fff', 
          letterSpacing: 0.2,
          textShadowColor: 'rgba(0,0,0,0.18)', 
          textShadowRadius: 4 
        }]}>
          {item}
        </Animated.Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={prompts}
        keyExtractor={item => item}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: CENTER_OFFSET }}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 2,
  },
  label: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    width: 80,
    alignSelf: 'center',
  },
});
