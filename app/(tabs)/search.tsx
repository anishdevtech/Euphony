import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../../src/components/SearchBar';
import { SongCard } from '../../src/components/SongCard';
import YouTubeService from '../../src/services/YouTubeService';
import { Song } from '../../src/types/music';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initStatus, setInitStatus] = useState('Click search to initialize');

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setInitStatus('Initializing YouTube.js... (first time takes 30-60s)');
    
    try {
      const results = await YouTubeService.searchSongs(searchQuery);
      setSongs(results);
      setInitStatus('Ready!');
    } catch (error: any) {
      setInitStatus('Failed: ' + error.message);
      Alert.alert('Error', error.message);
    }
    
    setLoading(false);
  };

  const handleSongPress = async (song: Song) => {
    try {
      setIsLoading(true);
      
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      setSelectedSong(song);
      console.log('🎵 Playing:', song.title);
      
      const audioUrl = await YouTubeService.getAudioUrl(song.id);
      
      console.log('📡 Loading audio...');

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);
      setIsLoading(false);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          handleNext();
        }
      });
      
      console.log('✅ Playing!');
    } catch (err: any) {
      console.error('❌ Play error:', err);
      setIsLoading(false);
      Alert.alert('Playback Error', err.message || 'Failed to play');
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;
    
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    const currentIndex = songs.findIndex(s => s.id === selectedSong?.id);
    if (currentIndex < songs.length - 1) {
      handleSongPress(songs[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = songs.findIndex(s => s.id === selectedSong?.id);
    if (currentIndex > 0) {
      handleSongPress(songs[currentIndex - 1]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Search Music</Text>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loading}>{initStatus}</Text>
          </View>
        )}

        <FlatList
          data={songs}
          renderItem={({ item }) => (
            <SongCard
              song={item}
              onPress={handleSongPress}
              isPlaying={selectedSong?.id === item.id && isPlaying}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      </View>

      {/* Custom Player */}
      {selectedSong && (
        <View style={styles.playerBar}>
          <Image 
            source={{ uri: selectedSong.thumbnail }} 
            style={styles.albumArt}
          />
          <View style={styles.songInfo}>
            <Text style={styles.songTitle} numberOfLines={1}>
              {selectedSong.title}
            </Text>
            <Text style={styles.songArtist} numberOfLines={1}>
              {isLoading ? 'Loading...' : selectedSong.artist}
            </Text>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity onPress={handlePrevious}>
              <Ionicons name="play-skip-back" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={togglePlayPause}
              style={styles.playBtn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons 
                  name={isPlaying ? 'pause' : 'play'} 
                  size={32} 
                  color="#fff" 
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext}>
              <Ionicons name="play-skip-forward" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loading: {
    color: '#808080',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  list: {
    paddingBottom: 20,
  },
  playerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  songArtist: {
    color: '#b3b3b3',
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playBtn: {
    backgroundColor: '#0066cc',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});