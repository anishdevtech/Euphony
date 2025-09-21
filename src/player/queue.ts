// src/player/queue.ts
import TrackPlayer from 'react-native-track-player';

export async function loadAndPlay(tracks: any[], startId?: string) {
  await TrackPlayer.reset();
  await TrackPlayer.add(tracks);
  if (startId) await TrackPlayer.skip(String(startId));
  await TrackPlayer.play();
}

export async function reorderQueue(newOrder: any[], activeId: string) {
  const state = await TrackPlayer.getPlaybackState();
  const wasPlaying = state.state === 3;
  await TrackPlayer.reset();
  await TrackPlayer.add(newOrder);
  await TrackPlayer.skip(String(activeId));
  if (wasPlaying) await TrackPlayer.play();
}
