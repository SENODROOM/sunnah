import tirmidhi from 'jami-al-tirmidhi';
console.log('Total hadiths:', tirmidhi.length);
console.log('Title:', tirmidhi.metadata.english.title);
const h = tirmidhi.get(1);
console.log('Hadith #1:', h.english.narrator, '-', h.english.text.slice(0,60)+'...');
console.log('Chapter 1 hadiths:', tirmidhi.getByChapter(1).length);
