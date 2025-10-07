import { useState, useCallback } from 'react';
import YouTubeMusicService from '../services/YouTubeMusicService';
import { Song, VideoInfo, StreamResponse } from '../types/music';

export const useYouTubeMusic = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchSongs = useCallback(async (query: string): Promise<Song[]> => {
    setLoading(true);
    setError(null);
    try {
      const results = await YouTubeMusicService.searchSongs(query);
      return results;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getVideoInfo = useCallback(async (videoId: string): Promise<VideoInfo | null> => {
    setLoading(true);
    setError(null);
    try {
      const info = await YouTubeMusicService.getVideoInfo(videoId);
      return info;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAudioStream = useCallback(async (videoId: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const stream = await YouTubeMusicService.getAudioStream(videoId);
      return stream.url;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPlaylist = useCallback(async (playlistId: string): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const playlist = await YouTubeMusicService.getPlaylist(playlistId);
      return playlist;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRelated = useCallback(async (videoId: string): Promise<Song[]> => {
    try {
      return await YouTubeMusicService.getRelatedVideos(videoId);
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  }, []);

  const getSuggestions = useCallback(async (query: string): Promise<string[]> => {
    try {
      return await YouTubeMusicService.getSuggestions(query);
    } catch (err: any) {
      return [];
    }
  }, []);

  return {
    loading,
    error,
    searchSongs,
    getVideoInfo,
    getAudioStream,
    getPlaylist,
    getRelated,
    getSuggestions,
  };
};

// Default export as well
export default useYouTubeMusic;