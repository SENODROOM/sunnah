# API Reference — sunan-abi-dawud

## dawud.get(id)
Returns the hadith with the given global ID, or `undefined`/`None`.

## dawud.getByChapter(chapterId)
Returns all hadiths in a chapter.

## dawud.search(query, limit?)
Full-text search. `limit=0` means return all results.

## dawud.getRandom()
Returns a random hadith.

## dawud.find / filter / map / forEach / slice
Same as JS Array prototype methods.

## Properties
- `dawud.length` — total hadiths
- `dawud.metadata` — `{ english: { title, author }, arabic: { title, author } }`
- `dawud.chapters` — array of `{ id, arabic, english }`

## Hadith shape
```json
{ "id": 1, "chapterId": 1, "arabic": "...", "english": { "narrator": "...", "text": "..." } }
```
