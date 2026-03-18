<div align="center">

<h1>🕌 Sunan Ibn Majah</h1>

![npm version](https://img.shields.io/npm/v/sunan-ibn-majah?style=for-the-badge&logo=npm)
![npm downloads](https://img.shields.io/npm/dt/sunan-ibn-majah?style=for-the-badge&logo=npm)
![npm downloads per month](https://img.shields.io/npm/dm/sunan-ibn-majah?style=for-the-badge&logo=npm)
![license](https://img.shields.io/github/license/SENODROOM/sunan-ibn-majah?style=for-the-badge&logo=gnu)
![node version](https://img.shields.io/node/v/sunan-ibn-majah?style=for-the-badge&logo=node.js)
![bundle size](https://img.shields.io/bundlephobia/minzip/sunan-ibn-majah?style=for-the-badge)
![GitHub stars](https://img.shields.io/github/stars/SENODROOM/sunan-ibn-majah?style=for-the-badge&logo=github)

**📚 Complete Sunan Ibn Majah for JavaScript — CLI, Node.js, React, Vue, and every bundler. Tiny package, data served from CDN.**

[![NPM](https://nodei.co/npm/sunan-ibn-majah.png)](https://nodei.co/npm/sunan-ibn-majah/)

</div>

---

## 📊 Package Statistics

| Metric | Value | Description |
|--------|-------|-------------|
| 📚 **Total Hadiths** | 4,341 | Complete Sunan Ibn Majah collection |
| 📝 **Chapters** | 1,560 | Detailed chapter organization |
| 📦 **Package Size** | ~3KB | Core package — data loads from CDN |
| 🔧 **Dependencies** | 0 | Zero external dependencies |
| 🌐 **Bilingual** | ✅ | Full Arabic text + English translations |
| 📘 **TypeScript** | ✅ | Built-in type definitions |

---

## 🚀 Installation

```bash
npm install sunan-ibn-majah        # local
npm install -g sunan-ibn-majah     # global CLI
```

---

## 🖥️ CLI Usage

```bash
majah 1                  # First hadith
majah 2345               # Hadith #2345
majah 23 34              # 34th hadith of chapter 23
majah 2345 -a            # Arabic only
majah 2345 -b            # Arabic + English
majah --react            # Generate React hook in current project
majah --help
majah --version
```

---

## ⚛️ React / Vue / Vite

```bash
cd my-react-app
majah --react
# ✓ Generated: src/hooks/useMajah.js
```

```jsx
import { useMajah } from '../hooks/useMajah';

function HadithOfTheDay() {
  const majah = useMajah();
  if (!majah) return <p>Loading...</p>;

  const hadith = majah.getRandom();
  return (
    <div>
      <p><strong>{hadith.english.narrator}</strong></p>
      <p>{hadith.english.text}</p>
    </div>
  );
}
```

---

## 🟩 Node.js Usage

```javascript
// CommonJS
const majah = require('sunan-ibn-majah');
console.log(majah.get(1));
console.log(majah.search('prayer'));
console.log(majah.getRandom());
console.log(majah.getByChapter(1));
console.log(majah.length);

// ESM
import majah from 'sunan-ibn-majah';
const hadith = majah.get(23);
console.log(hadith.english.text);
```

---

## 🛠️ API Reference

| Method / Property | Description |
|-------------------|-------------|
| `majah[0]` | Hadith at index 0 |
| `majah.get(id)` | Hadith by ID |
| `majah.getByChapter(id)` | All hadiths in a chapter |
| `majah.search(query)` | Full-text search |
| `majah.getRandom()` | Random hadith |
| `majah.length` | Total hadiths |
| `majah.metadata` | Book metadata |
| `majah.chapters` | All chapters |

All native array methods work: `find`, `filter`, `map`, `forEach`, `slice`.

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

[![GitHub stars](https://img.shields.io/github/stars/SENODROOM/sunan-ibn-majah?style=for-the-badge&logo=github)](https://github.com/SENODROOM/sunan-ibn-majah)

</div>
