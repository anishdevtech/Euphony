import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

export default function Home() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 20 }}>Home</Text>
      </View>
    </SafeAreaView>
  );
}