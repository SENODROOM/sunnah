// CommonJS example — run with: node examples/node-commonjs/example.js
'use strict';

const bukhari = require('sahih-al-bukhari');

console.log('Total hadiths:', bukhari.length);

// Get by ID
const h = bukhari.get(1);
console.log('\nHadith #1:');
console.log('Narrator:', h.english.narrator);
console.log('Text:', h.english.text);

// Search
const results = bukhari.search('prayer', 3);
console.log(`\nTop 3 results for "prayer":`);
results.forEach((r, i) => console.log(`  ${i + 1}. [${r.id}] ${r.english.text.slice(0, 80)}...`));

// Random
const random = bukhari.getRandom();
console.log('\nRandom hadith:', random.id, '-', random.english.text.slice(0, 60) + '...');
