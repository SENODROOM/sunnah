'use strict';
const nasai = require('sunan-al-nasai');
console.log('Total hadiths:', nasai.length);
const h = nasai.get(1);
console.log('Hadith #1:', h.english.narrator, '-', h.english.text.slice(0,60)+'...');
console.log('Search "prayer":', nasai.search('prayer').length, 'results');
console.log('Random:', nasai.getRandom().id);
