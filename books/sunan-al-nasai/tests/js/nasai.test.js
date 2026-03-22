import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import nasai from 'sunan-al-nasai';

describe('Nasai', () => {
  it('has hadiths', () => { assert.ok(nasai.length > 0); });
  it('get(1) returns hadith', () => { const h = nasai.get(1); assert.ok(h); assert.equal(h.id, 1); });
  it('get(999999) returns undefined', () => { assert.equal(nasai.get(999999), undefined); });
  it('getByChapter(1) returns array', () => { assert.ok(nasai.getByChapter(1).length > 0); });
  it('search returns results', () => { assert.ok(nasai.search('prayer').length > 0); });
  it('getRandom returns hadith', () => { assert.ok(nasai.getRandom().id); });
  it('metadata has title', () => { assert.ok(nasai.metadata.english.title); });
  it('chapters is array', () => { assert.ok(Array.isArray(nasai.chapters)); });
});
