<div align="center">
<h1> 🕌 Sahih al-Bukhari </h1>

![npm version](https://img.shields.io/npm/v/sahih-al-bukhari?style=for-the-badge&logo=npm)
![npm downloads](https://img.shields.io/npm/dt/sahih-al-bukhari?style=for-the-badge&logo=npm)
![npm downloads per month](https://img.shields.io/npm/dm/sahih-al-bukhari?style=for-the-badge&logo=npm)
![license](https://img.shields.io/github/license/SENODROOM/sahih-al-bukhari?style=for-the-badge&logo=gnu)
![node version](https://img.shields.io/node/v/sahih-al-bukhari?style=for-the-badge&logo=node.js)
![bundle size](https://img.shields.io/bundlephobia/minzip/sahih-al-bukhari?style=for-the-badge)
![GitHub stars](https://img.shields.io/github/stars/SENODROOM/sahih-al-bukhari?style=for-the-badge&logo=github)
![GitHub issues](https://img.shields.io/github/issues/SENODROOM/sahih-al-bukhari?style=for-the-badge&logo=github)
![GitHub last commit](https://img.shields.io/github/last-commit/SENODROOM/sahih-al-bukhari?style=for-the-badge&logo=github)

**📚 Complete Sahih al-Bukhari for JavaScript — CLI, Node.js, React, Vue, and every bundler. Tiny package, data served from CDN.**

[![NPM](https://nodei.co/npm/sahih-al-bukhari.png)](https://nodei.co/npm/sahih-al-bukhari/)

</div>

---

## 📊 Package Statistics

| Metric | Value | Description |
|--------|-------|-------------|
| 📚 **Total Hadiths** | 7,277 | Complete Sahih al-Bukhari collection |
| 📝 **Chapters** | 4,000+ | Detailed chapter organization |
| 🗣️ **Narrators** | 1,000+ | Clean narrator names |
| 📦 **Package Size** | ~3KB | Core package — data loads from CDN |
| 🔧 **Dependencies** | 0 | Zero external dependencies |
| 🌐 **Bilingual** | ✅ | Full Arabic text + English translations |
| 📘 **TypeScript** | ✅ | Built-in type definitions |

---

## ✨ Features

- 📚 **Complete Collection** — All 7,277 authentic hadiths
- 🔍 **Full-text Search** — Search English text and narrator names
- 🌐 **Bilingual** — Original Arabic + English translation
- ⚡ **Tiny Install** — ~3KB package, 12MB data loaded from CDN on demand
- 🖥️ **CLI** — Terminal access with Arabic/English flags
- ⚛️ **React Hook** — One command generates `useBukhari()` in your project
- 📦 **Universal** — Node.js CJS, Node.js ESM, React, Vue, Vite, webpack
- 📘 **TypeScript** — Full type definitions included
- 🔧 **Zero Config** — Works out of the box everywhere

---

## 🚀 Installation

```bash
# Local (for Node.js / React / Vue projects)
npm install sahih-al-bukhari

# Global (for CLI usage)
npm install -g sahih-al-bukhari
```

---

## 🖥️ CLI Usage

```bash
# Show a hadith by ID
bukhari 1
bukhari 2345

# Show a hadith within a specific chapter
bukhari 23 34

# Language flags
bukhari 2345           # English only (default)
bukhari 2345 -a        # Arabic only
bukhari 2345 --arabic  # Arabic only
bukhari 2345 -b        # Arabic + English
bukhari 2345 --both    # Arabic + English

# Other flags
bukhari --help         # Show help
bukhari --version      # Show version and stats

# React hook generator (run inside your React project)
bukhari --react
```

### Example CLI output

```
------------------------------------------------------------
Hadith #1  |  Chapter: 1 - Revelation
------------------------------------------------------------

'Umar bin Al-Khattab

I heard Allah's Messenger (ﷺ) saying, "The reward of deeds depends
upon the intentions..."
------------------------------------------------------------
```

---

## ⚛️ React / Vue / Vite Usage

The easiest way to use this in a React project is to let the CLI generate the hook for you.

**Step 1** — run this inside your React project directory:

```bash
cd my-react-app
bukhari --react
```

This automatically creates `src/hooks/useBukhari.js`. Output:

```
  ✓ Created src/hooks/
  ✓ Generated: src/hooks/useBukhari.js

  Use in any component:

    import { useBukhari } from '../hooks/useBukhari';

    function MyComponent() {
      const bukhari = useBukhari();
      if (!bukhari) return <p>Loading...</p>;
      return <p>{bukhari.get(1).english.text}</p>;
    }
```

**Step 2** — use the hook anywhere in your app:

```jsx
import { useBukhari } from '../hooks/useBukhari';

function HadithOfTheDay() {
  const bukhari = useBukhari();

  if (!bukhari) return <p>Loading...</p>;

  const hadith = bukhari.getRandom();

  return (
    <div>
      <p><strong>{hadith.english.narrator}</strong></p>
      <p>{hadith.english.text}</p>
    </div>
  );
}
```

```jsx
// Search example
function HadithSearch() {
  const bukhari = useBukhari();
  const [results, setResults] = useState([]);

  if (!bukhari) return <p>Loading...</p>;

  return (
    <div>
      <input
        placeholder="Search hadiths..."
        onChange={e => setResults(bukhari.search(e.target.value))}
      />
      {results.map(h => (
        <p key={h.id}>{h.english.text}</p>
      ))}
    </div>
  );
}
```

> **Note:** Data is fetched from jsDelivr CDN once and cached globally. All components using `useBukhari()` share the same fetch — no duplicate requests.

---

## 🟩 Node.js Usage

### CommonJS (require)

```javascript
const bukhari = require('sahih-al-bukhari');

console.log(bukhari[0]);                        // First hadith (index 0)
console.log(bukhari.get(1));                    // Hadith with id: 1
console.log(bukhari.search('prayer'));          // Search
console.log(bukhari.getByChapter(1));           // All hadiths in chapter 1
console.log(bukhari.getRandom());               // Random hadith
console.log(bukhari.length);                    // 7277
console.log(bukhari.metadata);                  // Book metadata
console.log(bukhari.chapters);                  // All chapters
```

### ESM (import)

```javascript
import bukhari from 'sahih-al-bukhari';

const hadith = bukhari.get(23);
console.log(hadith.english.narrator);
console.log(hadith.english.text);
console.log(hadith.arabic);
```

### Express.js API

```javascript
import express from 'express';
import bukhari from 'sahih-al-bukhari';

const app = express();

app.get('/api/hadith/random', (req, res) => {
  res.json(bukhari.getRandom());
});

app.get('/api/hadith/:id', (req, res) => {
  const hadith = bukhari.get(parseInt(req.params.id));
  if (!hadith) return res.status(404).json({ error: 'Not found' });
  res.json(hadith);
});

app.get('/api/search', (req, res) => {
  const results = bukhari.search(req.query.q || '');
  res.json(results);
});

app.listen(3000);
```

---

## 🛠️ API Reference

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `length` | `number` | Total hadiths (7277) |
| `metadata` | `object` | Collection title, author info |
| `chapters` | `array` | All chapter objects |

### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `get(id)` | `number` | `Hadith` | Hadith by its ID |
| `getByChapter(id)` | `number` | `Hadith[]` | All hadiths in a chapter |
| `search(query)` | `string` | `Hadith[]` | Full-text search |
| `getRandom()` | — | `Hadith` | Random hadith |

### Array methods (all native array methods work)

```javascript
bukhari[0]                              // index access
bukhari.find(h => h.id === 23)          // find
bukhari.filter(h => h.chapterId === 1)  // filter
bukhari.map(h => h.english.narrator)    // map
bukhari.forEach(h => console.log(h.id)) // forEach
bukhari.slice(0, 10)                    // slice
```

---

## 📐 Data Structure

### Hadith object

```javascript
{
  "id": 1,
  "chapterId": 1,
  "arabic": "حَدَّثَنَا الْحُمَيْدِيُّ...",
  "english": {
    "narrator": "Umar bin Al-Khattab",
    "text": "I heard Allah's Messenger (ﷺ) saying..."
  }
}
```

### Chapter object

```javascript
{
  "id": 1,
  "arabic": "كتاب بدء الوحى",
  "english": "Revelation"
}
```

### Metadata object

```javascript
{
  "id": 1,
  "length": 7277,
  "arabic":  { "title": "صحيح البخاري", "author": "الإمام محمد بن إسماعيل البخاري" },
  "english": { "title": "Sahih al-Bukhari", "author": "Imam Muhammad ibn Ismail al-Bukhari" }
}
```

---

## 📘 TypeScript

Full TypeScript definitions are included. No `@types` package needed.

```typescript
import bukhari, { Hadith, Chapter, Metadata, BukhariInstance } from 'sahih-al-bukhari';

// All types are inferred automatically
const hadith: Hadith = bukhari.get(1);
const results: Hadith[] = bukhari.search('prayer');
const chapters: Chapter[] = bukhari.chapters;
const meta: Metadata = bukhari.metadata;
```

---

## 💡 Examples

### Hadith of the Day (Node.js)

```javascript
import bukhari from 'sahih-al-bukhari';

const hadith = bukhari.getRandom();
console.log(`📖 ${hadith.english.narrator}`);
console.log(hadith.english.text);
```

### Seed a MongoDB database

```javascript
import { MongoClient } from 'mongodb';
import bukhari from 'sahih-al-bukhari';

async function seed() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  await client.db('islam').collection('hadiths').insertMany([...bukhari]);
  await client.close();
  console.log('Seeded', bukhari.length, 'hadiths');
}
seed();
```

### Thematic search (Node.js / React)

```javascript
const topics = {
  prayer:    bukhari.search('prayer'),
  charity:   bukhari.search('charity'),
  fasting:   bukhari.search('fasting'),
  knowledge: bukhari.search('knowledge'),
  patience:  bukhari.search('patience'),
};

Object.entries(topics).forEach(([topic, hadiths]) => {
  console.log(`${topic}: ${hadiths.length} hadiths`);
});
```

### React: Hadith search component

```jsx
import { useState } from 'react';
import { useBukhari } from '../hooks/useBukhari';

export function HadithSearch() {
  const bukhari = useBukhari();
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState([]);

  if (!bukhari) return <p>Loading hadiths...</p>;

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setResults(bukhari.search(e.target.value).slice(0, 20));
  };

  return (
    <div>
      <input value={query} onChange={handleSearch} placeholder="Search..." />
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

## 🔧 Development

```bash
git clone https://github.com/SENODROOM/sahih-al-bukhari.git
cd sahih-al-bukhari

# Build chapters/ folder and index.browser.js
node build.mjs

# Publish
npm publish
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

Licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **📖 Source** — Sahih al-Bukhari, the most authentic hadith collection
- **👨‍🏫 Translations** — By reputable Islamic scholars
- **💚 Inspiration** — The Muslim community worldwide seeking knowledge

---

<div align="center">

## 🌟 Star This Project

If you find this useful, please give it a ⭐ on GitHub!

[![GitHub stars](https://img.shields.io/github/stars/SENODROOM/sahih-al-bukhari?style=for-the-badge&logo=github)](https://github.com/SENODROOM/sahih-al-bukhari)
[![GitHub forks](https://img.shields.io/github/forks/SENODROOM/sahih-al-bukhari?style=for-the-badge&logo=github)](https://github.com/SENODROOM/sahih-al-bukhari)
[![GitHub issues](https://img.shields.io/github/issues/SENODROOM/sahih-al-bukhari?style=for-the-badge&logo=github)](https://github.com/SENODROOM/sahih-al-bukhari/issues)

**Made with ❤️ for the Muslim community | Seeking knowledge together**

[📖 Documentation](https://github.com/SENODROOM/sahih-al-bukhari/wiki) •
[🚀 Getting Started](#-installation) •
[💡 Examples](#-examples) •
[🤝 Contribute](#-contributing)

</div>