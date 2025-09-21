// src/components/QueueSheet.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import TrackPlayer, { useQueue, useActiveTrack } from 'react-native-track-player';
import { reorderQueue } from '../player/queue';

export default function QueueSheet() {
  const queue = useQueue();
  const active = useActiveTrack();

  const onReorder = async (newOrder: any[]) => {
    await reorderQueue(newOrder, String(active?.id ?? newOrder[0]?.id));
  };

  return (
    <View className="bg-black flex-1 px-4 py-3">
      <Text className="text-white text-xl mb-3">Current Queue</Text>
      <FlatList
        data={queue}
        keyExtractor={(t) => String(t.id)}
        renderItem={({ item }) => (
          <TouchableOpacity className="py-2">
            <Text className="text-white">{item.title}</Text>
            <Text className="text-gray-400">{item.artist}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
