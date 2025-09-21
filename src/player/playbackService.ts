// src/player/playbackService.ts
import TrackPlayer, { Event } from 'react-native-track-player';
import { addHistory } from '../storage/history';

export async function playbackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.destroy());

  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async ({ nextTrack }) => {
    if (!nextTrack) return;
    const track = await TrackPlayer.getTrack(nextTrack);
    if (track) addHistory({
      trackId: String(track.id), title: track.title ?? '', artist: track.artist ?? '', album: track.album ?? '', artwork: track.artwork as string | undefined,
    });
  });
}
