// ESM example — run with: node examples/node-esm/example.mjs
import bukhari from 'sahih-al-bukhari';

console.log('Total hadiths:', bukhari.length);
console.log('Total chapters:', bukhari.chapters.length);
console.log('Title:', bukhari.metadata.english.title);

// Get by ID
const h = bukhari.get(23);
console.log('\nHadith #23:');
console.log('Narrator:', h.english.narrator);
console.log('Text:', h.english.text);

// Get by chapter
const chapter1 = bukhari.getByChapter(1);
console.log(`\nChapter 1 has ${chapter1.length} hadiths`);

// Search
const results = bukhari.search('fasting');
console.log(`\n"fasting" → ${results.length} results`);

// Native array methods
const narrators = bukhari.slice(0, 5).map(h => h.english.narrator);
console.log('\nFirst 5 narrators:', narrators);
