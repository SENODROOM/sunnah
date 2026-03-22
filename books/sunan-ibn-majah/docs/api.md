# API Reference — sunan-ibn-majah

## majah.get(id)
Returns the hadith with the given global ID, or `undefined`/`None`.

## majah.getByChapter(chapterId)
Returns all hadiths in a chapter.

## majah.search(query, limit?)
Full-text search. `limit=0` returns all results.

## majah.getRandom()
Returns a random hadith.

## majah.find / filter / map / forEach / slice
Same as JS Array prototype methods.

## Properties
- `majah.length` — total hadiths
- `majah.metadata` — `{ english: { title, author }, arabic: { title, author } }`
- `majah.chapters` — array of `{ id, arabic, english }`

## Hadith shape
```json
{ "id": 1, "chapterId": 1, "arabic": "...", "english": { "narrator": "...", "text": "..." } }
```
