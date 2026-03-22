'use strict';
const dawud = require('sunan-abi-dawud');
console.log('Total hadiths:', dawud.length);
const h = dawud.get(1);
console.log('Hadith #1:', h.english.narrator, '-', h.english.text.slice(0,60)+'...');
console.log('Search "prayer":', dawud.search('prayer').length, 'results');
console.log('Random:', dawud.getRandom().id);
