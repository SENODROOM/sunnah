import express from 'express';
import majah from 'sunan-ibn-majah';
const app = express();
app.get('/api/hadith/random', (_, res) => res.json(majah.getRandom()));
app.get('/api/hadith/:id', (req, res) => { const h = majah.get(parseInt(req.params.id)); h ? res.json(h) : res.status(404).json({error:'Not found'}); });
app.get('/api/search', (req, res) => res.json(majah.search(req.query.q||'', parseInt(req.query.limit)||0)));
app.get('/api/chapters', (_, res) => res.json(majah.chapters));
app.listen(3000, () => console.log('Sunan Ibn Majah API at http://localhost:3000'));
