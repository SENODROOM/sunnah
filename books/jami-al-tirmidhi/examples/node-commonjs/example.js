'use strict';
const tirmidhi = require('jami-al-tirmidhi');
console.log('Total hadiths:', tirmidhi.length);
const h = tirmidhi.get(1);
console.log('Hadith #1:', h.english.narrator, '-', h.english.text.slice(0,60)+'...');
console.log('Search "prayer":', tirmidhi.search('prayer').length, 'results');
console.log('Random:', tirmidhi.getRandom().id);
