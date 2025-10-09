import { YouTubeService } from '@/src/services/YouTubeService';
import { Audio } from 'expo-av';

export function MusicPlayer({ videoId }: { videoId: string }) {
  const [sound, setSound] = useState<Audio.Sound>();

  async function playVideo() {
    try {
      // Get stream URL (fast with cache!)
      const url = await YouTubeService.getStreamUrl(videoId);
      
      if (!url) {
        console.error('No URL found');
        return;
      }

      // Play with expo-av
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      
      setSound(sound);
    } catch (error) {
      console.error('Play error:', error);
    }
  }

  return <Button onPress={playVideo} title="Play" />;
}