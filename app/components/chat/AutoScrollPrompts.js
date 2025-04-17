/**
 * AutoScrollPrompts Component
 * Horizontally scrollable prompts bar with auto-scroll and pause/play toggle
 * Remembers user's scroll state in Firebase
 */
import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, ScrollView, TouchableOpacity, Text, StyleSheet, Platform, Easing } from 'react-native';
// Optionally use expo-haptics or react-native-haptic-feedback for haptics
let Haptics;
try {
  Haptics = require('expo-haptics');
} catch {}

const SCROLL_DURATION = 1800; // ms, faster
const SCROLL_PAUSE = 400; // ms pause at ends

const AutoScrollPrompts = ({ prompts = [], onPromptPress }) => {
  const scrollRef = useRef();
  const animValue = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hasAutoplayed, setHasAutoplayed] = useState(false);

  // Animate on mount: start far right, roll left fast then slow to a stop
  useEffect(() => {
    if (!contentWidth || !containerWidth || hasAutoplayed) return;
    setHasAutoplayed(true);
    const maxScroll = Math.max(0, contentWidth - containerWidth);
    if (maxScroll === 0) return;

    animValue.setValue(maxScroll);
    Animated.timing(animValue, {
      toValue: 0,
      duration: 1600, // fast
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic), // fast then slow deceleration
    }).start();
  }, [contentWidth, containerWidth, hasAutoplayed]);

  // Scroll the ScrollView when animValue changes
  useEffect(() => {
    const id = animValue.addListener(({ value }) => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ x: value, animated: false });
      }
    });
    return () => animValue.removeListener(id);
  }, [animValue]);

  // Haptic feedback on manual scroll
  const lastHaptic = useRef(0);
  const handleScroll = (e) => {
    const now = Date.now();
    if (now - lastHaptic.current > 60) {
      if (Haptics && Haptics.impactAsync) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      lastHaptic.current = now;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onContentSizeChange={(w, h) => setContentWidth(w)}
        onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
        onScrollBeginDrag={() => animValue.stopAnimation()}
        onScroll={handleScroll}
        style={{ flex: 1 }}
      >
        {prompts.map((prompt, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.promptButton}
            onPress={() => onPromptPress(prompt)}
            activeOpacity={0.8}
          >
            <Text style={styles.promptText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 16,
    backgroundColor: 'rgba(26, 26, 30, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(62,207,178,0.07)',
    shadowColor: '#3ECFB2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.09 : 0.13,
    shadowRadius: 8,
    elevation: 3,
  },
  promptButton: {
    backgroundColor: 'rgba(62, 207, 178, 0.13)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(62, 207, 178, 0.17)',
    shadowColor: '#3ECFB2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  promptText: {
    color: '#3ECFB2',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.2,
  },
});

export default AutoScrollPrompts;
