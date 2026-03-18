<div align="center">

<h1>🕌 Sunan Abi Dawud</h1>

![npm version](https://img.shields.io/npm/v/sunan-abi-dawud?style=for-the-badge&logo=npm)
![npm downloads](https://img.shields.io/npm/dt/sunan-abi-dawud?style=for-the-badge&logo=npm)
![npm downloads per month](https://img.shields.io/npm/dm/sunan-abi-dawud?style=for-the-badge&logo=npm)
![license](https://img.shields.io/github/license/SENODROOM/sunan-abi-dawud?style=for-the-badge&logo=gnu)
![node version](https://img.shields.io/node/v/sunan-abi-dawud?style=for-the-badge&logo=node.js)
![bundle size](https://img.shields.io/bundlephobia/minzip/sunan-abi-dawud?style=for-the-badge)
![GitHub stars](https://img.shields.io/github/stars/SENODROOM/sunan-abi-dawud?style=for-the-badge&logo=github)

**📚 Complete Sunan Abi Dawud for JavaScript — CLI, Node.js, React, Vue, and every bundler. Tiny package, data served from CDN.**

[![NPM](https://nodei.co/npm/sunan-abi-dawud.png)](https://nodei.co/npm/sunan-abi-dawud/)

</div>

---

## 📊 Package Statistics

| Metric | Value | Description |
|--------|-------|-------------|
| 📚 **Total Hadiths** | 5,274 | Complete Sunan Abi Dawud collection |
| 📝 **Chapters** | 1,871 | Detailed chapter organization |
| 📦 **Package Size** | ~3KB | Core package — data loads from CDN |
| 🔧 **Dependencies** | 0 | Zero external dependencies |
| 🌐 **Bilingual** | ✅ | Full Arabic text + English translations |
| 📘 **TypeScript** | ✅ | Built-in type definitions |

---

## 🚀 Installation

```bash
npm install sunan-abi-dawud        # local
npm install -g sunan-abi-dawud     # global CLI
```

---

## 🖥️ CLI Usage

```bash
dawud 1                  # First hadith
dawud 2345               # Hadith #2345
dawud 23 34              # 34th hadith of chapter 23
dawud 2345 -a            # Arabic only
dawud 2345 -b            # Arabic + English
dawud --react            # Generate React hook in current project
dawud --help
dawud --version
```

---

## ⚛️ React / Vue / Vite

```bash
cd my-react-app
dawud --react
# ✓ Generated: src/hooks/useDawud.js
```

```jsx
import { useDawud } from '../hooks/useDawud';

function HadithOfTheDay() {
  const dawud = useDawud();
  if (!dawud) return <p>Loading...</p>;

  const hadith = dawud.getRandom();
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
const dawud = require('sunan-abi-dawud');
console.log(dawud.get(1));
console.log(dawud.search('prayer'));
console.log(dawud.getRandom());
console.log(dawud.getByChapter(1));
console.log(dawud.length);

// ESM
import dawud from 'sunan-abi-dawud';
const hadith = dawud.get(23);
console.log(hadith.english.text);
```

---

## 🛠️ API Reference

| Method / Property | Description |
|-------------------|-------------|
| `dawud[0]` | Hadith at index 0 |
| `dawud.get(id)` | Hadith by ID |
| `dawud.getByChapter(id)` | All hadiths in a chapter |
| `dawud.search(query)` | Full-text search |
| `dawud.getRandom()` | Random hadith |
| `dawud.length` | Total hadiths |
| `dawud.metadata` | Book metadata |
| `dawud.chapters` | All chapters |

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

[![GitHub stars](https://img.shields.io/github/stars/SENODROOM/sunan-abi-dawud?style=for-the-badge&logo=github)](https://github.com/SENODROOM/sunan-abi-dawud)

</div>
