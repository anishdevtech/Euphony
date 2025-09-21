// src/storage/db.ts
import { open } from 'react-native-nitro-sqlite';
export const db = open({ name: 'musicapp.db' });

export function migrate() {
  db.exec(`CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trackId TEXT, title TEXT, artist TEXT, album TEXT, artwork TEXT, playedAt INTEGER
  );`);
  db.exec(`CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY, name TEXT, createdAt INTEGER
  );`);
  db.exec(`CREATE TABLE IF NOT EXISTS playlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlistId TEXT, trackId TEXT, title TEXT, artist TEXT, album TEXT, artwork TEXT, position INTEGER
  );`);
}
