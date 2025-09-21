// server/index.ts
import express from 'express';
const app = express();

app.get('/api/quickpicks', (_req, res) => {
  res.json({
    sections: [
      { id: 'rec', title: 'Recommended', items: [] },
      { id: 'frequent', title: 'Frequently Played', items: [] },
      { id: 'playlists', title: 'Your Playlists', items: [] },
    ],
  });
});

app.get('/api/history', (_req, res) => { res.json({ items: [] }); });
app.get('/api/playlists/:id', (req, res) => { res.json({ id: req.params.id, name: 'My Playlist', tracks: [] }); });
app.get('/api/albums/:id', (req, res) => { res.json({ id: req.params.id, title: 'Album', artwork: '', tracks: [] }); });
app.get('/api/stream/:trackId', (req, res) => { res.json({ url: `https://cdn.example.com/stream/${req.params.trackId}.mp3` }); });

app.listen(3000, () => console.log('API on :3000'));
