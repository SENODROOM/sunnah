# API Reference

## Bukhari instance

Both the JS and Python packages expose the same API.

---

### `get(id)`

Returns the hadith with the given global ID, or `undefined` / `None`.

```js
bukhari.get(1)      // → Hadith
bukhari.get(99999)  // → undefined
```

```python
bukhari.get(1)      # → Hadith
bukhari.get(99999)  # → None
```

---

### `getByChapter(chapterId)`

Returns all hadiths in a chapter as an array.

```js
bukhari.getByChapter(1)  // → Hadith[]
```

```python
bukhari.getByChapter(1)  # → list[Hadith]
```

---

### `search(query, limit?)`

Full-text search across English text and narrator names. Case-insensitive.

| Param | Type | Default | Description |
|---|---|---|---|
| `query` | string | — | Search term |
| `limit` | number | `0` | Max results. `0` = return all |

```js
bukhari.search('prayer')      // → all matches
bukhari.search('prayer', 5)   // → top 5
```

```python
bukhari.search("prayer")           # → all matches
bukhari.search("prayer", limit=5)  # → top 5
```

---

### `getRandom()`

Returns a random hadith.

```js
bukhari.getRandom()  // → Hadith
```

---

### `find(predicate)`

Returns the first hadith matching the predicate, or `undefined` / `None`.

```js
bukhari.find(h => h.id === 23)
```

```python
bukhari.find(lambda h: h.id == 23)
```

---

### `filter(predicate)`

Returns all hadiths matching the predicate.

```js
bukhari.filter(h => h.chapterId === 1)
```

```python
bukhari.filter(lambda h: h.chapterId == 1)
```

---

### `map(fn)`

Transforms each hadith and returns a new array.

```js
bukhari.map(h => h.english.narrator)
```

```python
bukhari.map(lambda h: h.narrator)
```

---

### `forEach(fn)`

Iterates over all hadiths. Returns nothing.

```js
bukhari.forEach((h, i) => console.log(i, h.id))
```

```python
bukhari.forEach(lambda h, i: print(i, h.id))
```

---

### `slice(start, end?)`

Returns a slice of the hadiths array.

```js
bukhari.slice(0, 10)   // first 10
bukhari.slice(100)     // from index 100 to end
```

```python
bukhari.slice(0, 10)   # first 10
bukhari.slice(100)     # from index 100 to end
```

---

## Properties

### `length`

Total number of hadiths (7,277).

```js
bukhari.length  // → 7277
```

### `metadata`

```js
bukhari.metadata
// {
//   id: 1,
//   length: 7277,
//   arabic:  { title, author, introduction },
//   english: { title, author, introduction }
// }
```

### `chapters`

Array of all chapter objects.

```js
bukhari.chapters[0]
// { id: 1, arabic: "كتاب بدء الوحى", english: "Revelation" }
```

---

## Data shapes

### Hadith

```ts
{
  id:        number,       // global unique ID
  chapterId: number,       // parent chapter ID
  arabic:    string,       // Arabic text
  english: {
    narrator: string,      // narrator name
    text:     string       // English translation
  }
}
```

### Chapter

```ts
{
  id:      number,
  arabic:  string,
  english: string
}
```

### Metadata

```ts
{
  id:     number,
  length: number,
  arabic:  { title: string, author: string, introduction: string },
  english: { title: string, author: string, introduction: string }
}
```
