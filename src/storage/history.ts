// src/storage/history.ts
import { db } from './db';

export function addHistory(item: { trackId: string; title: string; artist?: string; album?: string; artwork?: string }) {
  const playedAt = Date.now();
  db.exec(
    `INSERT INTO history (trackId,title,artist,album,artwork,playedAt) VALUES (?,?,?,?,?,?)`,
    [item.trackId, item.title, item.artist ?? '', item.album ?? '', item.artwork ?? '', playedAt]
  );
}

export function getHistory(limit = 200) {
  return db.query(`SELECT * FROM history ORDER BY playedAt DESC LIMIT ?`, [limit])?.rows ?? [];
}
