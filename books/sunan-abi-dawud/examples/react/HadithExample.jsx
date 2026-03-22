// Run `dawud --react` in your project first
import { useState } from 'react';
import { useDawud } from '../hooks/useDawud';

export function HadithOfTheDay() {
  const dawud = useDawud();
  if (!dawud) return <p>Loading...</p>;
  const h = dawud.getRandom();
  return (<div><strong>{h.english.narrator}</strong><p>{h.english.text}</p></div>);
}

export function HadithSearch() {
  const dawud = useDawud();
  const [results, setResults] = useState([]);
  if (!dawud) return <p>Loading...</p>;
  return (<><input placeholder="Search..." onChange={e => setResults(dawud.search(e.target.value, 20))} />{results.map(h => <div key={h.id}><p>{h.english.text}</p></div>)}</>);
}
