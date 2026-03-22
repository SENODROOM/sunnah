import express from 'express';
import tirmidhi from 'jami-al-tirmidhi';
const app = express();
app.get('/api/hadith/random', (_, res) => res.json(tirmidhi.getRandom()));
app.get('/api/hadith/:id', (req, res) => { const h = tirmidhi.get(parseInt(req.params.id)); h ? res.json(h) : res.status(404).json({error:'Not found'}); });
app.get('/api/search', (req, res) => res.json(tirmidhi.search(req.query.q||'', parseInt(req.query.limit)||0)));
app.listen(3000, () => console.log('Jami al-Tirmidhi API at http://localhost:3000'));
