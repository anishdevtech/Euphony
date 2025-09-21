// src/screens/QuickPicks.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { api } from '../api/client';

export default function QuickPicks() {
  const [data, setData] = useState<any>(null);

  useEffect(() => { api.quickPicks().then(setData).catch(console.error); }, []);
  if (!data) return <View className="flex-1 bg-black"><Text className="text-white p-4">Loading...</Text></View>;

  return (
    <FlatList
      className="flex-1 bg-black"
      data={data.sections}
      keyExtractor={(s: any) => s.id}
      renderItem={({ item }) => (
        <View className="mb-6">
          <Text className="text-white text-xl font-semibold px-4 mb-3">{item.title}</Text>
          <FlatList
            horizontal
            data={item.items}
            keyExtractor={(it: any) => it.id}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item: it }) => (
              <TouchableOpacity className="w-40 mr-4">
                <Image source={{ uri: it.artwork }} className="w-40 h-40 rounded-lg" />
                <Text className="text-white mt-2" numberOfLines={1}>{it.title}</Text>
                <Text className="text-gray-400" numberOfLines={1}>{it.subtitle}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    />
  );
}
