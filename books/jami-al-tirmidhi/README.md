<div align="center">

<h1>🕌 Jami al-Tirmidhi</h1>

![npm version](https://img.shields.io/npm/v/jami-al-tirmidhi?style=for-the-badge&logo=npm)
![npm downloads](https://img.shields.io/npm/dt/jami-al-tirmidhi?style=for-the-badge&logo=npm)
![npm downloads per month](https://img.shields.io/npm/dm/jami-al-tirmidhi?style=for-the-badge&logo=npm)
![license](https://img.shields.io/github/license/SENODROOM/jami-al-tirmidhi?style=for-the-badge&logo=gnu)
![node version](https://img.shields.io/node/v/jami-al-tirmidhi?style=for-the-badge&logo=node.js)
![bundle size](https://img.shields.io/bundlephobia/minzip/jami-al-tirmidhi?style=for-the-badge)
![GitHub stars](https://img.shields.io/github/stars/SENODROOM/jami-al-tirmidhi?style=for-the-badge&logo=github)

**📚 Complete Jami al-Tirmidhi for JavaScript — CLI with colors & search, Node.js, React, Vue. Tiny package, data from CDN.**

[![NPM](https://nodei.co/npm/jami-al-tirmidhi.png)](https://nodei.co/npm/jami-al-tirmidhi/)

</div>

---

## 📊 Package Statistics

| Metric | Value | Description |
|--------|-------|-------------|
| 📚 **Total Hadiths** | 3,956 | Complete Jami al-Tirmidhi collection |
| 📝 **Chapters** | 1,871 | Detailed chapter organization |
| 📦 **Package Size** | ~3KB | Core package — data loads from CDN |
| ⚡ **CLI Search** | O(n) | Instant results with ms timing shown |
| 🔧 **Dependencies** | 0 | Zero external dependencies |
| 🌐 **Bilingual** | ✅ | Full Arabic text + English translations |
| 📘 **TypeScript** | ✅ | Built-in type definitions |

---

## 🚀 Installation

```bash
npm install jami-al-tirmidhi        # local
npm install -g jami-al-tirmidhi     # global CLI
```

---

## 🖥️ CLI Usage

### Read a hadith

```bash
tirmidhi 1                 # First hadith
tirmidhi 2345              # Hadith #2345
tirmidhi 23 34             # 34th hadith of chapter 23
tirmidhi 2345 -a           # Arabic only
tirmidhi 2345 -b           # Arabic + English
```

### Search hadiths

```bash
tirmidhi --search "prayer"            # top 5 results (fast)
tirmidhi --search "fasting" --all     # all results
tirmidhi -s "charity"                 # shorthand
```

Search output shows:
- Result count + time taken (e.g. `42 results  (1ms)`)
- Narrator, chapter name, hadith text
- Search term highlighted in yellow
- `...more results` hint when > 5 found

### Browse a chapter

```bash
tirmidhi --chapter 5       # all hadiths in chapter 5
tirmidhi -c 5              # shorthand
```

### Random hadith

```bash
tirmidhi --random          # random hadith in English
tirmidhi --random -b       # random hadith in Arabic + English
tirmidhi -r                # shorthand
```

### Other flags

```bash
tirmidhi --react            # generate useTirmidhi hook in React project
tirmidhi --help
tirmidhi --version
```

---

## ⚛️ React / Vue / Vite

```bash
cd my-react-app
tirmidhi --react
# ✓ Generated: src/hooks/useTirmidhi.js
```

```jsx
import { useTirmidhi } from '../hooks/useTirmidhi';

function HadithSearch() {
  const tirmidhi = useTirmidhi();
  const [results, setResults] = useState([]);

  if (!tirmidhi) return <p>Loading...</p>;

  return (
    <div>
      <input
        placeholder="Search hadiths..."
        onChange={e => setResults(tirmidhi.search(e.target.value, 5))}
      />
      {results.map(h => (
        <div key={h.id}>
          <strong>{h.english.narrator}</strong>
          <p>{h.english.text}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🟩 Node.js Usage

```javascript
// CommonJS
const tirmidhi = require('jami-al-tirmidhi');
console.log(tirmidhi.get(1));
console.log(tirmidhi.search('prayer'));        // all results
console.log(tirmidhi.search('prayer', 5));     // top 5 only
console.log(tirmidhi.getRandom());
console.log(tirmidhi.getByChapter(1));
console.log(tirmidhi.length);

// ESM
import tirmidhi from 'jami-al-tirmidhi';
const hadith = tirmidhi.get(23);
console.log(hadith.english.text);
```

---

## 🛠️ API Reference

| Method / Property | Description |
|-------------------|-------------|
| `tirmidhi[0]` | Hadith at index 0 |
| `tirmidhi.get(id)` | Hadith by ID — O(1) map lookup |
| `tirmidhi.getByChapter(id)` | All hadiths in a chapter |
| `tirmidhi.search(query)` | Full-text search — all results |
| `tirmidhi.search(query, 5)` | Full-text search — top 5 |
| `tirmidhi.getRandom()` | Random hadith |
| `tirmidhi.length` | Total hadiths |
| `tirmidhi.metadata` | Book metadata |
| `tirmidhi.chapters` | All chapters |

All native array methods work: `find`, `filter`, `map`, `forEach`, `slice`.

---

## ⚡ Performance

Lookups use a `Map` for O(1) access instead of array scanning:

```javascript
// O(1) — instant regardless of collection size
tirmidhi.get(2345)

// O(n) — scans all hadiths
tirmidhi.search('prayer')
```

---

## 📐 Data Structure

```javascript
{
  "id": 1,
  "chapterId": 1,
  "arabic": "حَدَّثَنَا...",
  "english": {
    "narrator": "Abu Huraira",
    "text": "The Prophet (ﷺ) said..."
  }
}
```

---

## 📄 License

**GNU Affero General Public License v3.0 (AGPL-3.0)**

---

<div align="center">

**Made with ❤️ for the Muslim community | Seeking knowledge together**

[![GitHub stars](https://img.shields.io/github/stars/SENODROOM/jami-al-tirmidhi?style=for-the-badge&logo=github)](https://github.com/SENODROOM/jami-al-tirmidhi)

</div>
