import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import dawud from 'sunan-abi-dawud';

describe('Dawud', () => {
  it('has hadiths', () => { assert.ok(dawud.length > 0); });
  it('get(1) returns hadith', () => { const h = dawud.get(1); assert.ok(h); assert.equal(h.id, 1); });
  it('get(999999) returns undefined', () => { assert.equal(dawud.get(999999), undefined); });
  it('getByChapter(1) returns array', () => { assert.ok(dawud.getByChapter(1).length > 0); });
  it('search returns results', () => { assert.ok(dawud.search('prayer').length > 0); });
  it('getRandom returns hadith', () => { assert.ok(dawud.getRandom().id); });
  it('metadata has title', () => { assert.ok(dawud.metadata.english.title); });
  it('chapters is array', () => { assert.ok(Array.isArray(dawud.chapters)); });
});
