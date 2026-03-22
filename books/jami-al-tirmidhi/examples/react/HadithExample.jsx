// Run `tirmidhi --react` in your project first
import { useState } from 'react';
import { useTirmidhi } from '../hooks/useTirmidhi';

export function HadithOfTheDay() {
  const tirmidhi = useTirmidhi();
  if (!tirmidhi) return <p>Loading...</p>;
  const h = tirmidhi.getRandom();
  return (<div><strong>{h.english.narrator}</strong><p>{h.english.text}</p></div>);
}

export function HadithSearch() {
  const tirmidhi = useTirmidhi();
  const [results, setResults] = useState([]);
  if (!tirmidhi) return <p>Loading...</p>;
  return (<><input placeholder="Search..." onChange={e => setResults(tirmidhi.search(e.target.value, 20))} />{results.map(h => <div key={h.id}><p>{h.english.text}</p></div>)}</>);
}
