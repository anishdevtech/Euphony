// App.tsx
import React, { useEffect } from 'react';
import { NativeWindStyleSheet } from 'nativewind';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { setupPlayer } from './src/player/setup';
import { migrate } from './src/storage/db';

// Force dark globally for NativeWind
NativeWindStyleSheet.setColorScheme('dark');

export default function App() {
  useEffect(() => {
    migrate();
    setupPlayer();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={DarkTheme}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
