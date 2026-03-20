// JS tests — run with: node --test tests/js/bukhari.test.js
// (requires Node.js 18+ for built-in test runner)
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bukhari from 'sahih-al-bukhari';

describe('Bukhari', () => {
  it('has 7277 hadiths', () => {
    assert.equal(bukhari.length, 7277);
  });

  it('get(1) returns hadith with id 1', () => {
    const h = bukhari.get(1);
    assert.ok(h);
    assert.equal(h.id, 1);
    assert.equal(h.chapterId, 1);
    assert.ok(h.english.narrator);
    assert.ok(h.english.text);
  });

  it('get(999999) returns undefined', () => {
    assert.equal(bukhari.get(999999), undefined);
  });

  it('getByChapter(1) returns an array', () => {
    const hadiths = bukhari.getByChapter(1);
    assert.ok(Array.isArray(hadiths));
    assert.ok(hadiths.length > 0);
    assert.ok(hadiths.every(h => h.chapterId === 1));
  });

  it('search returns matching hadiths', () => {
    const results = bukhari.search('prayer');
    assert.ok(results.length > 0);
  });

  it('search with limit returns at most limit results', () => {
    const results = bukhari.search('prayer', 5);
    assert.ok(results.length <= 5);
  });

  it('getRandom returns a valid hadith', () => {
    const h = bukhari.getRandom();
    assert.ok(h.id);
    assert.ok(h.english.text);
  });

  it('index access works', () => {
    assert.equal(bukhari[0].id, bukhari.get(bukhari[0].id).id);
  });

  it('metadata has title and author', () => {
    assert.ok(bukhari.metadata.english.title);
    assert.ok(bukhari.metadata.english.author);
  });

  it('chapters is a non-empty array', () => {
    assert.ok(Array.isArray(bukhari.chapters));
    assert.ok(bukhari.chapters.length > 0);
  });
});
