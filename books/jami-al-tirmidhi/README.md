<div align="center">

<h1>
  <img src="https://em-content.zobj.net/source/apple/391/mosque_1f54c.png" width="36" />
  &nbsp;jami-al-tirmidhi
</h1>

<p align="center">
  <strong>The complete Jami al-Tirmidhi — 3,956 hadiths, full Arabic & English.</strong><br />
  Offline-first · zero dependencies · published on both <strong>npm</strong> and <strong>PyPI</strong>.
</p>

<br />

<p>
  <a href="https://www.npmjs.com/package/jami-al-tirmidhi">
    <img src="https://img.shields.io/npm/v/jami-al-tirmidhi?style=for-the-badge&logo=npm&logoColor=white&color=CB3837&labelColor=1a1a1a" />
  </a>
  &nbsp;
  <a href="https://pypi.org/project/jami-al-tirmidhi/">
    <img src="https://img.shields.io/pypi/v/jami-al-tirmidhi?style=for-the-badge&logo=pypi&logoColor=white&color=3775A9&labelColor=1a1a1a" />
  </a>
  &nbsp;
  <a href="https://github.com/SENODROOM/jami-al-tirmidhi/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/SENODROOM/jami-al-tirmidhi?style=for-the-badge&logo=gnu&logoColor=white&color=A42E2B&labelColor=1a1a1a" />
  </a>
</p>

<p>
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=for-the-badge&logo=node.js&logoColor=white&labelColor=1a1a1a" />
  &nbsp;
  <img src="https://img.shields.io/badge/Python-%3E%3D3.8-3776AB?style=for-the-badge&logo=python&logoColor=white&labelColor=1a1a1a" />
  &nbsp;
  <img src="https://img.shields.io/badge/Zero-Dependencies-00C853?style=for-the-badge&logoColor=white&labelColor=1a1a1a" />
  &nbsp;
  <img src="https://img.shields.io/badge/TypeScript-Typed-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=1a1a1a" />
</p>

</div>

---

## ✨ Features

| | Feature | Details |
|---|---|---|
| 📚 | **Complete Collection** | All 3,956 authentic hadiths from Jami al-Tirmidhi |
| 🌐 | **Bilingual** | Full Arabic text + English translation |
| ⚡ | **Offline-first** | Data bundled — no CDN needed |
| 🔧 | **Zero Dependencies** | Nothing extra to install |
| 🔍 | **Full-text Search** | Search English text and narrator names instantly |
| 🖥️ | **CLI** | Terminal access with Arabic/English/both flags |
| ⚛️ | **React Hook** | One command generates `useTirmidhi()` |
| 🐍 | **Python** | Identical API — same camelCase method names |
| 📘 | **TypeScript** | Full type definitions included |

---

## 🚀 Installation

```bash
npm install jami-al-tirmidhi       # JS local
npm install -g jami-al-tirmidhi    # JS global CLI
pip install jami-al-tirmidhi       # Python
```

---

## 🟨 JavaScript / Node.js

```javascript
const tirmidhi = require('jami-al-tirmidhi');  // CJS
import tirmidhi from 'jami-al-tirmidhi';       // ESM

tirmidhi.get(1)
tirmidhi.getByChapter(1)
tirmidhi.search('prayer')
tirmidhi.search('prayer', 5)
tirmidhi.getRandom()
tirmidhi[0]
tirmidhi.length
tirmidhi.metadata
tirmidhi.chapters
tirmidhi.find(h => h.id === 23)
tirmidhi.filter(h => h.chapterId === 1)
tirmidhi.slice(0, 10)
```

---

## ⚛️ React

```bash
cd my-react-app
tirmidhi --react    # generates src/hooks/useTirmidhi.js
```

```jsx
import { useTirmidhi } from '../hooks/useTirmidhi';

function HadithOfTheDay() {
  const tirmidhi = useTirmidhi();
  if (!tirmidhi) return <p>Loading...</p>;
  const h = tirmidhi.getRandom();
  return <div><strong>{h.english.narrator}</strong><p>{h.english.text}</p></div>;
}
```

---

## 🐍 Python

```python
from jami_al_tirmidhi import Tirmidhi

tirmidhi = Tirmidhi()

tirmidhi.get(1)
tirmidhi.getByChapter(1)
tirmidhi.search("prayer")
tirmidhi.search("prayer", limit=5)
tirmidhi.getRandom()
tirmidhi[0]
tirmidhi.length
tirmidhi.find(lambda h: h.id == 23)
tirmidhi.filter(lambda h: h.chapterId == 1)
tirmidhi.slice(0, 10)

# Custom path
tirmidhi = Tirmidhi(data_path="/path/to/tirmidhi.json")
```

---

## 🖥️ CLI

```bash
tirmidhi 1
tirmidhi 2345 -a           # Arabic only
tirmidhi 2345 -b           # Arabic + English
tirmidhi 23 34             # Hadith 34 within chapter 23
tirmidhi --search "prayer"
tirmidhi --search "fasting" --all
tirmidhi --chapter 1
tirmidhi --random
tirmidhi --react
tirmidhi --version
```

---

## 📂 Structure

```
jami-al-tirmidhi/
├── data/
│   ├── tirmidhi.json          ← source of truth (replace with your real data)
│   ├── tirmidhi.json.gz       ← generated (shipped in packages)
│   └── chapters/              ← generated (gitignored)
├── bin/index.js               ← CLI
├── src/                       ← JS source
├── types/index.d.ts
├── python/jami_al_tirmidhi/   ← Python package
├── scripts/build.mjs
├── examples/
├── docs/
└── tests/
```

---

## 🔧 Development

```bash
# Place your real tirmidhi.json in data/
node scripts/build.mjs    # compress, generate chapters/, copy to python/

# Test locally before publishing
python -m build --wheel
python -m zipfile -l dist\jami_al_tirmidhi-1.0.0-py3-none-any.whl | findstr "tirmidhi.json.gz"
pip install dist\jami_al_tirmidhi-1.0.0-py3-none-any.whl --force-reinstall
tirmidhi 23
```

Publishing is automatic via GitHub Actions on every GitHub Release.

---

## 📄 License

GNU Affero General Public License v3.0 (AGPL-3.0)

---

<div align="center">

**Made with ❤️ for the Muslim community · Seeking knowledge together**

[![Stars](https://img.shields.io/github/stars/SENODROOM/jami-al-tirmidhi?style=for-the-badge&logo=github&logoColor=white&color=f0c040&labelColor=1a1a1a)](https://github.com/SENODROOM/jami-al-tirmidhi/stargazers)

</div>
