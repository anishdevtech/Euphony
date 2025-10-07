import { getInnertube } from '../lib/youtube';
import { Song } from '../types/music';

class YouTubeService {
  async searchSongs(query: string): Promise<Song[]> {
    try {
      console.log('🔍 Searching:', query);
      const innertube = await getInnertube();
      
      const search = await innertube.search(query, { type: 'video' });
      
      const songs: Song[] = [];
      
      for (const result of search.results) {
        if (result.type === 'Video') {
          songs.push({
            id: result.id,
            title: result.title.text || 'Unknown',
            artist: result.author?.name || 'Unknown',
            duration: result.duration?.text || '',
            thumbnail: result.thumbnails?.[0]?.url || '',
          });
        }
      }
      
      console.log(`✅ Found ${songs.length} songs`);
      return songs;
    } catch (error) {
      console.error('❌ Search error:', error);
      return [];
    }
  }

  async getAudioUrl(videoId: string): Promise<string> {
    try {
      console.log('🎵 Getting audio for:', videoId);
      const innertube = await getInnertube();
      
      const info = await innertube.getInfo(videoId);
      
      const formats = info.streaming_data?.adaptive_formats || [];
      const audioFormats = formats.filter((f: any) => 
        f.has_audio && !f.has_video
      );

      if (audioFormats.length === 0) {
        throw new Error('No audio formats found');
      }

      const bestAudio = audioFormats.sort((a: any, b: any) => 
        (b.bitrate || 0) - (a.bitrate || 0)
      )[0];

      let url = bestAudio.url;
      
      if (!url && bestAudio.decipher) {
        console.log('🔐 Deciphering...');
        url = bestAudio.decipher(innertube.session.player);
      }

      if (!url) {
        throw new Error('Could not get audio URL');
      }
      
      console.log('✅ Got audio URL!');
      return url;
      
    } catch (error: any) {
      console.error('❌ Get audio error:', error.message);
      throw error;
    }
  }
}

export default new YouTubeService();