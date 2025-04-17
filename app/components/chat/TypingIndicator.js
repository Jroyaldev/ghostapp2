/**
 * Typing Indicator Component
 * Animated dots to show when the ghost is typing - iOS style
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const DOTS = 3;
const DOT_SIZE = 5; // Smaller dots for iOS style
const DOT_SPACING = 3; // Tighter spacing
const ANIMATION_DURATION = 300; // Faster animation for subtlety

const TypingIndicator = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animations = useRef(
    Array.from({ length: DOTS }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Fade in the entire indicator
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Create staggered animations for each dot
    const createAnimation = (i) => {
      // Add slight delay for each dot
      const delay = i * 120;
      
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animations[i], {
            toValue: 1,
            duration: ANIMATION_DURATION,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(animations[i], {
            toValue: 0,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anims = animations.map((_, i) => {
      return createAnimation(i).start();
    });
    
    return () => {
      // Fade out when unmounting
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      // Stop all animations
      anims.forEach(anim => anim && anim.stop && anim.stop());
    };
  }, [animations, fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {animations.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 0.9],
              }),
              transform: [{
                scale: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.1],
                })
              }],
              marginLeft: i === 0 ? 0 : DOT_SPACING,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(142, 142, 147, 0.12)', // Light gray background like iOS
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#8E8E93', // Gray color like iOS
  },
});

export default TypingIndicator;
