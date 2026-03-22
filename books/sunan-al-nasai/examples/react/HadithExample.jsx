// Run `nasai --react` in your project first
import { useState } from 'react';
import { useNasai } from '../hooks/useNasai';

export function HadithOfTheDay() {
  const nasai = useNasai();
  if (!nasai) return <p>Loading...</p>;
  const h = nasai.getRandom();
  return (<div><strong>{h.english.narrator}</strong><p>{h.english.text}</p></div>);
}

export function HadithSearch() {
  const nasai = useNasai();
  const [results, setResults] = useState([]);
  if (!nasai) return <p>Loading...</p>;
  return (<><input placeholder="Search..." onChange={e => setResults(nasai.search(e.target.value, 20))} />{results.map(h => <div key={h.id}><p>{h.english.text}</p></div>)}</>);
}
