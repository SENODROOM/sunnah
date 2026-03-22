// Run `majah --react` in your project first
import { useState } from 'react';
import { useMajah } from '../hooks/useMajah';

export function HadithOfTheDay() {
  const majah = useMajah();
  if (!majah) return <p>Loading...</p>;
  const h = majah.getRandom();
  return (<div><strong>{h.english.narrator}</strong><p>{h.english.text}</p></div>);
}

export function HadithSearch() {
  const majah = useMajah();
  const [results, setResults] = useState([]);
  if (!majah) return <p>Loading...</p>;
  return (<><input placeholder="Search..." onChange={e => setResults(majah.search(e.target.value, 20))} />{results.map(h => <div key={h.id}><p>{h.english.text}</p></div>)}</>);
}
