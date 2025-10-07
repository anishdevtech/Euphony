// app/(tabs)/library.tsx
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function Library() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 20 }}>Library</Text>
      </View>
    </SafeAreaView>
  );
}