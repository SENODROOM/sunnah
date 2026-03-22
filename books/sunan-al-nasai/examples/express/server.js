import express from 'express';
import nasai from 'sunan-al-nasai';
const app = express();
app.get('/api/hadith/random', (_, res) => res.json(nasai.getRandom()));
app.get('/api/hadith/:id', (req, res) => { const h = nasai.get(parseInt(req.params.id)); h ? res.json(h) : res.status(404).json({error:'Not found'}); });
app.get('/api/search', (req, res) => res.json(nasai.search(req.query.q||'', parseInt(req.query.limit)||0)));
app.get('/api/chapters', (_, res) => res.json(nasai.chapters));
app.listen(3000, () => console.log("Sunan al-Nasa'i API at http://localhost:3000"));
