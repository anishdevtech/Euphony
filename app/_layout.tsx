// app/_layout.tsx
import { useColorScheme } from 'react-native';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { AppDarkTheme, AppLightTheme } from '../src/theme/theme';

export default function RootLayout() {
  const scheme = useColorScheme(); // 'light' | 'dark'
  return (
    <ThemeProvider value={scheme === 'dark' ? AppDarkTheme : AppLightTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}