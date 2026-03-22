import majah from 'sunan-ibn-majah';
console.log('Total hadiths:', majah.length);
console.log('Title:', majah.metadata.english.title);
const h = majah.get(1);
console.log('Hadith #1:', h.english.narrator, '-', h.english.text.slice(0,60)+'...');
console.log('Chapter 1 hadiths:', majah.getByChapter(1).length);
