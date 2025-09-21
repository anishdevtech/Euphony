// src/components/MiniPlayer.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import TrackPlayer, { State, usePlaybackState, useActiveTrack } from 'react-native-track-player';

export default function MiniPlayer({ onExpand }: { onExpand: () => void }) {
  const playback = usePlaybackState();
  const active = useActiveTrack();

  const playing = playback.state === State.Playing;
  const title = active?.title ?? 'Not Playing';
  const artist = active?.artist ?? '';

  return (
    <TouchableOpacity onPress={onExpand} activeOpacity={0.9} className="bg-neutral-900 border-t border-neutral-800">
      <View className="flex-row items-center px-3 py-2">
        <Image source={{ uri: (active?.artwork as string) ?? 'https://placehold.co/64' }} className="w-10 h-10 rounded mr-3" />
        <View className="flex-1">
          <Text className="text-white" numberOfLines={1}>{title}</Text>
          <Text className="text-gray-400" numberOfLines={1}>{artist}</Text>
        </View>
        <TouchableOpacity onPress={() => (playing ? TrackPlayer.pause() : TrackPlayer.play())}>
          <Text className="text-white mx-2">{playing ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => TrackPlayer.skipToNext()}>
          <Text className="text-white">Next</Text>
        </TouchableOpacity>
      </View>
      <View className="h-0.5 bg-emerald-500 w-1/3" />
    </TouchableOpacity>
  );
}
