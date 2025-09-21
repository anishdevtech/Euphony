// src/api/client.ts
const API_BASE = 'http://localhost:3000';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export const api = {
  quickPicks: () => get<{ sections: any[] }>('/api/quickpicks'),
  history: () => get<{ items: any[] }>('/api/history'),
  playlist: (id: string) => get(`/api/playlists/${id}`),
  album: (id: string) => get(`/api/albums/${id}`),
  stream: (trackId: string) => get(`/api/stream/${trackId}`),
  search: (q: string) => get(`/api/search?q=${encodeURIComponent(q)}`),
};
