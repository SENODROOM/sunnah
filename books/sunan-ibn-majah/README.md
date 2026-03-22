<div align="center">

<h1>
  <img src="https://em-content.zobj.net/source/apple/391/mosque_1f54c.png" width="36" />
  &nbsp;sunan-ibn-majah
</h1>

<p align="center">
  <strong>The complete Sunan Ibn Majah — 4,341 hadiths, full Arabic & English.</strong><br />
  Offline-first · zero dependencies · published on both <strong>npm</strong> and <strong>PyPI</strong>.
</p>

<br />

<p>
  <a href="https://www.npmjs.com/package/sunan-ibn-majah">
    <img src="https://img.shields.io/npm/v/sunan-ibn-majah?style=for-the-badge&logo=npm&logoColor=white&color=CB3837&labelColor=1a1a1a" />
  </a>
  &nbsp;
  <a href="https://pypi.org/project/sunan-ibn-majah/">
    <img src="https://img.shields.io/pypi/v/sunan-ibn-majah?style=for-the-badge&logo=pypi&logoColor=white&color=3775A9&labelColor=1a1a1a" />
  </a>
  &nbsp;
  <a href="https://github.com/SENODROOM/sunan-ibn-majah/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/SENODROOM/sunan-ibn-majah?style=for-the-badge&logo=gnu&logoColor=white&color=A42E2B&labelColor=1a1a1a" />
  </a>
</p>

<p>
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=for-the-badge&logo=node.js&logoColor=white&labelColor=1a1a1a" />
  &nbsp;
  <img src="https://img.shields.io/badge/Python-%3E%3D3.8-3776AB?style=for-the-badge&logo=python&logoColor=white&labelColor=1a1a1a" />
  &nbsp;
  <img src="https://img.shields.io/badge/Zero-Dependencies-00C853?style=for-the-badge&logoColor=white&labelColor=1a1a1a" />
</p>

</div>

---

## ✨ Features

| | Feature | Details |
|---|---|---|
| 📚 | **Complete Collection** | All 4,341 hadiths from Sunan Ibn Majah |
| 🌐 | **Bilingual** | Full Arabic text + English translation |
| ⚡ | **Offline-first** | Data bundled — no CDN needed |
| 🔧 | **Zero Dependencies** | Nothing extra to install |
| 🔍 | **Full-text Search** | Search English text and narrator names |
| 🖥️ | **CLI** | Terminal access with `-a`/`-b` Arabic flags + `--info`, `--chapters` |
| ⚛️ | **React Hook** | One command generates `useMajah()` |
| 🐍 | **Python** | Identical API — same camelCase method names |
| 📘 | **TypeScript** | Full type definitions included |

---

## 🚀 Installation

```bash
npm install sunan-ibn-majah       # JS local
npm install -g sunan-ibn-majah    # JS global CLI
pip install sunan-ibn-majah       # Python
```

---

## 🟨 JavaScript / Node.js

```javascript
const majah = require('sunan-ibn-majah');  // CJS
import majah from 'sunan-ibn-majah';       // ESM

majah.get(1)
majah.getByChapter(1)
majah.search('prayer')
majah.search('prayer', 5)
majah.getRandom()
majah[0]
majah.length
majah.metadata
majah.chapters
```

---

## ⚛️ React

```bash
cd my-react-app
majah --react    # generates src/hooks/useMajah.js
```

```jsx
import { useMajah } from '../hooks/useMajah';

function HadithOfTheDay() {
  const majah = useMajah();
  if (!majah) return <p>Loading...</p>;
  const h = majah.getRandom();
  return <div><strong>{h.english.narrator}</strong><p>{h.english.text}</p></div>;
}
```

---

## 🐍 Python

```python
from sunan_ibn_majah import Majah

majah = Majah()

majah.get(1)
majah.getByChapter(1)
majah.search("prayer")
majah.search("prayer", limit=5)
majah.getRandom()
majah[0]
majah.length
majah.find(lambda h: h.id == 23)
majah.filter(lambda h: h.chapterId == 1)
majah.slice(0, 10)

# Custom path
majah = Majah(data_path="/path/to/majah.json")
```

---

## 🖥️ CLI

```bash
majah 1                      # Hadith by ID
majah 2345 -a                # Arabic only
majah 2345 -b                # Arabic + English
majah 23 3                   # 3rd hadith of chapter 23
majah --search "prayer"
majah --search "fasting" --all
majah --chapter 1
majah --chapters             # List all chapters
majah --random
majah --info                 # Book metadata
majah --react
majah --version
```

---

## 📂 Structure

```
sunan-ibn-majah/
├── data/
│   ├── majah.json           ← source of truth
│   ├── majah.json.gz        ← generated (shipped in packages)
│   └── chapters/            ← generated (gitignored)
├── bin/index.js             ← CLI
├── src/                     ← JS source
├── types/index.d.ts
├── python/sunan_ibn_majah/  ← Python package
├── scripts/build.mjs
├── examples/
├── docs/
└── tests/
```

---

## 🔧 Development

```bash
# Place your real majah.json in data/
node scripts/build.mjs

# Test locally
python -m build --wheel
python -m zipfile -l dist\sunan_ibn_majah-1.1.0-py3-none-any.whl | findstr "majah.json.gz"
pip install dist\sunan_ibn_majah-1.1.0-py3-none-any.whl --force-reinstall
majah 23
```

Publishing is automatic via GitHub Actions on every GitHub Release.

---

## 📄 License

GNU Affero General Public License v3.0 (AGPL-3.0)

---

<div align="center">

**Made with ❤️ for the Muslim community · Seeking knowledge together**

[![Stars](https://img.shields.io/github/stars/SENODROOM/sunan-ibn-majah?style=for-the-badge&logo=github&logoColor=white&color=f0c040&labelColor=1a1a1a)](https://github.com/SENODROOM/sunan-ibn-majah/stargazers)

</div>
