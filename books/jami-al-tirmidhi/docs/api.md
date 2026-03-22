# API Reference — jami-al-tirmidhi

## tirmidhi.get(id)
Returns the hadith with the given global ID, or `undefined`/`None`.

## tirmidhi.getByChapter(chapterId)
Returns all hadiths in a chapter.

## tirmidhi.search(query, limit?)
Full-text search. `limit=0` means return all results.

## tirmidhi.getRandom()
Returns a random hadith.

## tirmidhi.find / filter / map / forEach / slice
Same as JS Array prototype methods.

## Properties
- `tirmidhi.length` — total hadiths
- `tirmidhi.metadata` — `{ english: { title, author }, arabic: { title, author } }`
- `tirmidhi.chapters` — array of `{ id, arabic, english }`

## Hadith shape
```json
{ "id": 1, "chapterId": 1, "arabic": "...", "english": { "narrator": "...", "text": "..." } }
```
