// src/navigation/AppNavigator.tsx
import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuickPicks from '../screens/QuickPicks';
import History from '../screens/History';
import Playlists from '../screens/Playlists';
import Album from '../screens/Album';
import MiniPlayer from '../components/MiniPlayer';
import FullPlayer from '../components/FullPlayer';
import { View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [fullVisible, setFullVisible] = useState(false);

  return (
    <View className="flex-1 bg-black">
      <Stack.Navigator
        screenOptions={{ headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff', contentStyle: { backgroundColor: '#000' } }}
      >
        <Stack.Screen name="QuickPicks" component={QuickPicks} options={{ title: 'Quick Picks' }} />
        <Stack.Screen name="History" component={History} />
        <Stack.Screen name="Playlists" component={Playlists} />
        <Stack.Screen name="Album" component={Album} />
      </Stack.Navigator>

      <MiniPlayer onExpand={() => setFullVisible(true)} />
      <FullPlayer visible={fullVisible} onClose={() => setFullVisible(false)} />
    </View>
  );
}
