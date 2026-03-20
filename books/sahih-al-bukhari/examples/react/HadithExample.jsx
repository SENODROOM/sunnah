// React example — run `bukhari --react` inside your React project first
// to generate src/hooks/useBukhari.js, then use like this:
import { useState } from 'react';
import { useBukhari } from '../hooks/useBukhari';

// ── Hadith of the Day ─────────────────────────────────────────────────────────
export function HadithOfTheDay() {
  const bukhari = useBukhari();
  if (!bukhari) return <p>Loading...</p>;

  const h = bukhari.getRandom();
  return (
    <div className="hadith-card">
      <p className="narrator"><strong>{h.english.narrator}</strong></p>
      <p className="text">{h.english.text}</p>
      <small>Hadith #{h.id} · Chapter {h.chapterId}</small>
    </div>
  );
}

// ── Search ────────────────────────────────────────────────────────────────────
export function HadithSearch() {
  const bukhari  = useBukhari();
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);

  if (!bukhari) return <p>Loading hadiths...</p>;

  const handleSearch = (e) => {
    const q = e.target.value;
    setQuery(q);
    setResults(q.length > 1 ? bukhari.search(q, 20) : []);
  };

  return (
    <div>
      <input
        value={query}
        onChange={handleSearch}
        placeholder="Search hadiths..."
      />
      <p>{results.length} results</p>
      {results.map(h => (
        <div key={h.id}>
          <strong>{h.english.narrator}</strong>
          <p>{h.english.text}</p>
        </div>
      ))}
    </div>
  );
}

// ── By Chapter ────────────────────────────────────────────────────────────────
export function ChapterView({ chapterId = 1 }) {
  const bukhari = useBukhari();
  if (!bukhari) return <p>Loading...</p>;

  const hadiths = bukhari.getByChapter(chapterId);
  const chapter = bukhari.chapters.find(c => c.id === chapterId);

  return (
    <div>
      <h2>{chapter?.english}</h2>
      <p>{hadiths.length} hadiths</p>
      {hadiths.map(h => (
        <div key={h.id}>
          <strong>#{h.id} — {h.english.narrator}</strong>
          <p>{h.english.text}</p>
        </div>
      ))}
    </div>
  );
}
