// src/screens/History.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import { getHistory } from '../storage/history';

export default function History() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { setRows(getHistory(500)); }, []);

  return (
    <View className="flex-1 bg-black">
      <Text className="text-white text-2xl font-semibold px-4 py-3">Listening History</Text>
      <FlatList
        data={rows}
        keyExtractor={(r) => String(r.id)}
        renderItem={({ item }) => (
          <View className="flex-row items-center px-4 py-3">
            <Image source={{ uri: item.artwork }} className="w-12 h-12 rounded-md mr-3" />
            <View className="flex-1">
              <Text className="text-white" numberOfLines={1}>{item.title}</Text>
              <Text className="text-gray-400" numberOfLines={1}>{item.artist}</Text>
            </View>
            <Text className="text-gray-500">{new Date(item.playedAt).toLocaleTimeString()}</Text>
          </View>
        )}
      />
    </View>
  );
}
