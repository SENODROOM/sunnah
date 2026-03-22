import nasai from 'sunan-al-nasai';
console.log('Total hadiths:', nasai.length);
console.log('Title:', nasai.metadata.english.title);
const h = nasai.get(1);
console.log('Hadith #1:', h.english.narrator, '-', h.english.text.slice(0,60)+'...');
console.log('Chapter 1 hadiths:', nasai.getByChapter(1).length);
