// src/components/FullPlayer.tsx
import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import TrackPlayer, { useProgress, useActiveTrack } from 'react-native-track-player';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { usePlayerStore } from '../state/playerStore';

export default function FullPlayer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { position, duration } = useProgress(250);
  const track = useActiveTrack();
  const shuffle = usePlayerStore((s) => s.shuffle);
  const setShuffle = usePlayerStore((s) => s.setShuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const setRepeat = usePlayerStore((s) => s.setRepeat);

  const p = useSharedValue(visible ? 0 : 1);
  useEffect(() => { p.value = withTiming(visible ? 0 : 1, { duration: 280 }); }, [visible]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(p.value, [0, 1], [0, 800]) }],
  }));

  return (
    <Animated.View style={style} className="absolute inset-0 bg-black">
      <Image source={{ uri: (track?.artwork as string) ?? 'https://placehold.co/1024' }} className="w-full h-[50%]" />
      <View className="p-4">
        <Text className="text-white text-2xl font-semibold">{track?.title ?? '—'}</Text>
        <Text className="text-gray-400 mb-4">{track?.artist ?? ''}</Text>

        <View className="w-full h-1 bg-neutral-700 rounded-full overflow-hidden mb-2">
          <View className="h-1 bg-emerald-500" style={{ width: `${(position / Math.max(duration, 1)) * 100}%` }} />
        </View>
        <View className="flex-row justify-between mb-4">
          <Text className="text-gray-400">{Math.floor(position)}s</Text>
          <Text className="text-gray-400">{Math.max(Math.floor(duration - position), 0)}s</Text>
        </View>

        <View className="flex-row items-center justify-around">
          <TouchableOpacity onPress={() => TrackPlayer.skipToPrevious()}><Text className="text-white">Prev</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => TrackPlayer.play()}><Text className="text-white">Play</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => TrackPlayer.pause()}><Text className="text-white">Pause</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => TrackPlayer.skipToNext()}><Text className="text-white">Next</Text></TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-around mt-6">
          <TouchableOpacity onPress={() => setShuffle(!shuffle)}><Text className="text-gray-300">{shuffle ? 'Shuffle On' : 'Shuffle Off'}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')}><Text className="text-gray-300">Repeat: {repeat}</Text></TouchableOpacity>
          <TouchableOpacity><Text className="text-gray-300">+ Playlist</Text></TouchableOpacity>
          <TouchableOpacity><Text className="text-gray-300">Lyrics</Text></TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onClose} className="mt-6 self-center">
          <Text className="text-white">Close</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
