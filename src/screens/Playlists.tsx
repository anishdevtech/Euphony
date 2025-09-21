// src/screens/Playlists.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { db } from '../storage/db';

function loadPlaylists() {
  return db.query('SELECT * FROM playlists ORDER BY createdAt DESC')?.rows ?? [];
}

export default function Playlists() {
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState('');

  const refresh = () => setRows(loadPlaylists());
  useEffect(() => { refresh(); }, []);

  const create = () => {
    db.exec('INSERT INTO playlists (id,name,createdAt) VALUES (?,?,?)', [String(Date.now()), name, Date.now()]);
    setName('');
    refresh();
  };

  const remove = (id: string) => {
    db.exec('DELETE FROM playlist_items WHERE playlistId=?', [id]);
    db.exec('DELETE FROM playlists WHERE id=?', [id]);
    refresh();
  };

  return (
    <View className="flex-1 bg-black">
      <Text className="text-white text-2xl font-semibold px-4 py-3">Playlists</Text>
      <View className="px-4 pb-3">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="New playlist name"
          placeholderTextColor="#888"
          className="bg-neutral-900 text-white px-3 py-2 rounded-md"
        />
        <TouchableOpacity onPress={create} className="bg-emerald-600 px-3 py-2 rounded-md mt-2">
          <Text className="text-white text-center">Create</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between px-4 py-3">
            <Text className="text-white">{item.name}</Text>
            <TouchableOpacity onPress={() => remove(item.id)}>
              <Text className="text-red-400">Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
