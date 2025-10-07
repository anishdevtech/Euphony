import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Song } from '../types/music';

interface SongCardProps {
  song: Song;
  onPress: (song: Song) => void;
  isPlaying?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({ song, onPress, isPlaying = false }) => {
  return (
    <TouchableOpacity
      style={[styles.container, isPlaying && styles.playing]}
      onPress={() => onPress(song)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: song.thumbnail }} style={styles.thumbnail} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
        </Text>
        <Text style={styles.duration}>{song.duration}</Text>
      </View>
      {isPlaying && (
        <View style={styles.playingIndicator}>
          <Text style={styles.playingIcon}>🎵</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  playing: {
    backgroundColor: '#0066cc',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 14,
    marginBottom: 2,
  },
  duration: {
    color: '#808080',
    fontSize: 12,
  },
  playingIndicator: {
    marginLeft: 8,
  },
  playingIcon: {
    fontSize: 20,
  },
});

export default SongCard;