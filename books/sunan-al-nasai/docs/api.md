# API Reference — sunan-al-nasai

## nasai.get(id)
Returns the hadith with the given global ID, or `undefined`/`None`.

## nasai.getByChapter(chapterId)
Returns all hadiths in a chapter.

## nasai.search(query, limit?)
Full-text search. `limit=0` returns all results.

## nasai.getRandom()
Returns a random hadith.

## nasai.find / filter / map / forEach / slice
Same as JS Array prototype methods / Python equivalents.

## Properties
- `nasai.length` — total hadiths
- `nasai.metadata` — `{ english: { title, author }, arabic: { title, author } }`
- `nasai.chapters` — array of `{ id, arabic, english }`

## Hadith shape
```json
{ "id": 1, "chapterId": 1, "arabic": "...", "english": { "narrator": "...", "text": "..." } }
```
