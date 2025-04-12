import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';

// Enable screens for better navigation performance
enableScreens(true);

// Import global CSS for NativeWind
import './app/styles/global.css';

// Import the Navigation component
import Navigation from './app/navigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#121214" />
        <View style={styles.container}>
          <Navigation />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214', // Dark background from GhostMode theme
  },
});
