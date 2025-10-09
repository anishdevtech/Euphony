import { Innertube } from 'youtubei.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Singleton client instance
let cachedClient: Innertube | null = null;

export class YouTubeService {
  
  // Get or create YouTube client (cached)
  static async getClient(): Promise<Innertube> {
    if (cachedClient) return cachedClient;
    
    cachedClient = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
    
    return cachedClient;
  }

  // Get stream URL with 6-hour cache
  static async getStreamUrl(videoId: string): Promise<string | null> {
    try {
      const cacheKey = `stream_${videoId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      // Check cache first
      if (cached) {
        const { url, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        // Cache valid for 6 hours
        if (age < 6 * 60 * 60 * 1000) {
          console.log('✅ Using cached stream URL');
          return url;
        }
      }
      
      // Fetch fresh URL
      console.log('🔄 Fetching stream URL from YouTube...');
      const youtube = await this.getClient();
      const info = await youtube.getInfo(videoId);
      
      // Get best audio format
      const audioFormat = info.streaming_data?.adaptive_formats
        ?.find(f => f.mime_type.includes('audio'))
        || info.streaming_data?.formats?.[0];
      
      const url = audioFormat?.decipher(youtube.session.player);
      
      if (!url) throw new Error('No stream URL found');
      
      // Cache it
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        url,
        timestamp: Date.now()
      }));
      
      console.log('✅ Stream URL cached');
      return url;
      
    } catch (error) {
      console.error('❌ Error getting stream URL:', error);
      return null;
    }
  }

  // Search for videos
  static async search(query: string, limit: number = 20) {
    try {
      const youtube = await this.getClient();
      const results = await youtube.search(query, { type: 'video' });
      
      return results.videos.slice(0, limit).map(video => ({
        id: video.id,
        title: video.title.text,
        artist: video.author?.name,
        thumbnail: video.thumbnails[0]?.url,
        duration: video.duration?.text
      }));
      
    } catch (error) {
      console.error('❌ Search error:', error);
      return [];
    }
  }

  // Get video details
  static async getVideoInfo(videoId: string) {
    try {
      const youtube = await this.getClient();
      const info = await youtube.getInfo(videoId);
      
      return {
        id: videoId,
        title: info.basic_info.title,
        artist: info.basic_info.author,
        thumbnail: info.basic_info.thumbnail?.[0]?.url,
        duration: info.basic_info.duration
      };
      
    } catch (error) {
      console.error('❌ Error getting video info:', error);
      return null;
    }
  }

  // Pre-warm the cache on app start
  static async warmup() {
    try {
      await this.getClient();
      console.log('✅ YouTube client warmed up');
    } catch (error) {
      console.error('❌ Warmup failed:', error);
    }
  }
}