import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Users, BookMarked, User, FlaskConical } from 'lucide-react-native';
import { colors } from '../../theme';

// Tab icon mapping component
const TabIcon = ({ routeName, isFocused }) => {
  const iconColor = isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)';
  const iconSize = 22;
  
  switch (routeName) {
    case 'Home':
      return <Home size={iconSize} color={iconColor} strokeWidth={1.5} />;
    case 'Spaces':
      return <Users size={iconSize} color={iconColor} strokeWidth={1.5} />;
    case 'Memory':
      return <BookMarked size={iconSize} color={iconColor} strokeWidth={1.5} />;
    case 'Profile':
      return <User size={iconSize} color={iconColor} strokeWidth={1.5} />;
    case 'TestFirebase':
      return <FlaskConical size={iconSize} color={iconColor} strokeWidth={1.5} />;
    default:
      return null;
  }
};

const GlassmorphicTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  
  // Calculate bottom padding based on safe area
  const bottomPadding = Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 16;
  
  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
            });
            
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabButton}
            >
              <View style={[styles.tabContent, isFocused && styles.activeTabContent]}>
                <View style={styles.iconContainer}>
                  <TabIcon routeName={route.name} isFocused={isFocused} />
                </View>
              </View>
              {isFocused && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    borderTopWidth: 0,
  },
  tabBarContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(32, 32, 36, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  activeTabContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: 20,
    backgroundColor: '#4ECDC4', // Teal accent color
    borderRadius: 1.5,
  },
});

export default GlassmorphicTabBar;
