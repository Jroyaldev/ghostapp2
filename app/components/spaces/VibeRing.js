/**
 * Vibe Ring Component
 * A glassmorphic ring that visualizes the vibe of a space or conversation
 * Changes color and animation based on the detected vibe
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { VIBE_TYPES } from '../../services/vibe-service';

const VibeRing = ({ vibe = VIBE_TYPES.NEUTRAL, size = 60, strength = 0.5, pulseEnabled = true }) => {
  // Animation values
  const pulseAnim = React.useRef(new Animated.Value(0)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  
  // Start animations when component mounts or vibe changes
  useEffect(() => {
    if (pulseEnabled) {
      // Reset animation
      pulseAnim.setValue(0);
      
      // Create pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000 - (strength * 800), // Faster pulse for stronger vibes
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 2000 - (strength * 800),
            useNativeDriver: false,
          })
        ])
      ).start();
      
      // Create rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000 - (strength * 15000), // Faster rotation for stronger vibes
          useNativeDriver: false,
        })
      ).start();
    }
    
    return () => {
      // Clean up animations when component unmounts
      pulseAnim.stopAnimation();
      rotateAnim.stopAnimation();
    };
  }, [vibe, strength, pulseEnabled]);
  
  // Interpolate pulse animation
  const pulse = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [size * 0.9, size * 1.05]
  });
  
  // Interpolate rotation animation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Determine colors based on the vibe
  const vibeColor = vibe?.color || VIBE_TYPES.NEUTRAL.color;
  const vibeDarkColor = vibe?.darkColor || VIBE_TYPES.NEUTRAL.darkColor;
  
  // Size calculations
  const outerSize = pulseEnabled ? pulse : size;
  const innerSize = size * 0.7;
  
  // Only animate if pulseEnabled
  const AnimatedComponent = pulseEnabled ? Animated.View : View;
  
  return (
    <AnimatedComponent
      style={[
        styles.container,
        {
          width: outerSize,
          height: outerSize,
          borderRadius: outerSize / 2,
          borderColor: vibeColor,
          transform: pulseEnabled ? [{ rotate }] : []
        },
      ]}
    >
      <View
        style={[
          styles.innerRing,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            borderColor: vibeDarkColor,
          },
        ]}
      />
    </AnimatedComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    // Apply a subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  innerRing: {
    borderWidth: 1.5,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});

export default VibeRing;
