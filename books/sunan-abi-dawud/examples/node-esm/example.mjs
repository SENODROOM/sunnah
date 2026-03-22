import dawud from 'sunan-abi-dawud';
console.log('Total hadiths:', dawud.length);
console.log('Title:', dawud.metadata.english.title);
const h = dawud.get(1);
console.log('Hadith #1:', h.english.narrator, '-', h.english.text.slice(0,60)+'...');
console.log('Chapter 1 hadiths:', dawud.getByChapter(1).length);
