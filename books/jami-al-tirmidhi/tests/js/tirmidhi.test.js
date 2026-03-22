import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import tirmidhi from 'jami-al-tirmidhi';

describe('Tirmidhi', () => {
  it('has hadiths', () => { assert.ok(tirmidhi.length > 0); });
  it('get(1) returns hadith', () => { const h = tirmidhi.get(1); assert.ok(h); assert.equal(h.id, 1); });
  it('get(999999) returns undefined', () => { assert.equal(tirmidhi.get(999999), undefined); });
  it('getByChapter(1) returns array', () => { assert.ok(tirmidhi.getByChapter(1).length > 0); });
  it('search returns results', () => { assert.ok(tirmidhi.search('prayer').length > 0); });
  it('getRandom returns hadith', () => { assert.ok(tirmidhi.getRandom().id); });
  it('metadata has title', () => { assert.ok(tirmidhi.metadata.english.title); });
  it('chapters is array', () => { assert.ok(Array.isArray(tirmidhi.chapters)); });
});
