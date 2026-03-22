import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import majah from 'sunan-ibn-majah';

describe('Majah', () => {
  it('has hadiths', () => { assert.ok(majah.length > 0); });
  it('get(1) returns hadith', () => { const h = majah.get(1); assert.ok(h); assert.equal(h.id, 1); });
  it('get(999999) returns undefined', () => { assert.equal(majah.get(999999), undefined); });
  it('getByChapter(1) returns array', () => { assert.ok(majah.getByChapter(1).length > 0); });
  it('search returns results', () => { assert.ok(majah.search('prayer').length > 0); });
  it('getRandom returns hadith', () => { assert.ok(majah.getRandom().id); });
  it('metadata has title', () => { assert.ok(majah.metadata.english.title); });
  it('chapters is array', () => { assert.ok(Array.isArray(majah.chapters)); });
});
