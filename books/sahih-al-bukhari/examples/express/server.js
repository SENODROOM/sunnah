// Express.js REST API example
// Run: node examples/express/server.js
import express from 'express';
import bukhari from 'sahih-al-bukhari';

const app  = express();
const PORT = process.env.PORT || 3000;

// GET /api/hadith/random
app.get('/api/hadith/random', (_, res) => {
  res.json(bukhari.getRandom());
});

// GET /api/hadith/:id
app.get('/api/hadith/:id', (req, res) => {
  const h = bukhari.get(parseInt(req.params.id));
  if (!h) return res.status(404).json({ error: 'Hadith not found' });
  res.json(h);
});

// GET /api/chapter/:id
app.get('/api/chapter/:id', (req, res) => {
  const hadiths = bukhari.getByChapter(parseInt(req.params.id));
  if (!hadiths.length) return res.status(404).json({ error: 'Chapter not found' });
  res.json({ count: hadiths.length, hadiths });
});

// GET /api/search?q=prayer&limit=10
app.get('/api/search', (req, res) => {
  const q      = req.query.q || '';
  const limit  = parseInt(req.query.limit) || 0;
  const results = bukhari.search(q, limit);
  res.json({ query: q, count: results.length, results });
});

// GET /api/chapters
app.get('/api/chapters', (_, res) => {
  res.json(bukhari.chapters);
});

// GET /api/meta
app.get('/api/meta', (_, res) => {
  res.json({ ...bukhari.metadata, total: bukhari.length });
});

app.listen(PORT, () => {
  console.log(`Sahih al-Bukhari API running at http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/api/hadith/1`);
});
