// src/screens/Album.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { api } from '../api/client';
import TrackPlayer from 'react-native-track-player';

export default function Album({ route }: any) {
  const { id } = route.params;
  const [album, setAlbum] = useState<any>(null);

  useEffect(() => { api.album(id).then(setAlbum).catch(console.error); }, [id]);
  if (!album) return <View className="flex-1 bg-black" />;

  return (
    <View className="flex-1 bg-black">
      <Image source={{ uri: album.artwork }} className="w-full h-72" />
      <Text className="text-white text-2xl font-semibold px-4 py-3">{album.title}</Text>
      <FlatList
        data={album.tracks}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row items-center px-4 py-3"
            onPress={async () => {
              await TrackPlayer.reset();
              await TrackPlayer.add(album.tracks.map((t: any) => ({
                id: t.id, url: t.streamUrl, title: t.title, artist: t.artist, artwork: t.artwork,
              })));
              await TrackPlayer.skip(String(item.id));
              await TrackPlayer.play();
            }}
          >
            <Text className="text-white flex-1" numberOfLines={1}>{item.title}</Text>
            <Text className="text-gray-400">{item.durationText}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
