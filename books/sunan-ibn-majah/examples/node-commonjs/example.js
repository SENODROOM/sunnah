'use strict';
const majah = require('sunan-ibn-majah');
console.log('Total hadiths:', majah.length);
const h = majah.get(1);
console.log('Hadith #1:', h.english.narrator, '-', h.english.text.slice(0,60)+'...');
console.log('Search "prayer":', majah.search('prayer').length, 'results');
console.log('Random:', majah.getRandom().id);
