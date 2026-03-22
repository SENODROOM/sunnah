<div align="center">

<h1>
  <img src="https://em-content.zobj.net/source/apple/391/mosque_1f54c.png" width="36" />
  &nbsp;sunan-al-nasai
</h1>

<p align="center">
  <strong>The complete Sunan al-Nasa'i — 5,768 hadiths, full Arabic & English.</strong><br />
  Offline-first · zero dependencies · published on both <strong>npm</strong> and <strong>PyPI</strong>.
</p>

<br />

<p>
  <a href="https://www.npmjs.com/package/sunan-al-nasai">
    <img src="https://img.shields.io/npm/v/sunan-al-nasai?style=for-the-badge&logo=npm&logoColor=white&color=CB3837&labelColor=1a1a1a" />
  </a>
  &nbsp;
  <a href="https://pypi.org/project/sunan-al-nasai/">
    <img src="https://img.shields.io/pypi/v/sunan-al-nasai?style=for-the-badge&logo=pypi&logoColor=white&color=3775A9&labelColor=1a1a1a" />
  </a>
  &nbsp;
  <a href="https://github.com/SENODROOM/sunan-al-nasai/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/SENODROOM/sunan-al-nasai?style=for-the-badge&logo=gnu&logoColor=white&color=A42E2B&labelColor=1a1a1a" />
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
| 📚 | **Complete Collection** | All 5,768 authentic hadiths from Sunan al-Nasa'i |
| 🌐 | **Bilingual** | Full Arabic text + English translation |
| ⚡ | **Offline-first** | Data bundled — no CDN needed |
| 🔧 | **Zero Dependencies** | Nothing extra to install |
| 🔍 | **Full-text Search** | Search English text and narrator names |
| 🖥️ | **CLI** | Terminal access with Arabic/English/both flags |
| ⚛️ | **React Hook** | One command generates `useNasai()` |
| 🐍 | **Python** | Identical API — same camelCase method names |
| 📘 | **TypeScript** | Full type definitions included |

---

## 🚀 Installation

```bash
npm install sunan-al-nasai       # JS local
npm install -g sunan-al-nasai    # JS global CLI
pip install sunan-al-nasai       # Python
```

---

## 🟨 JavaScript / Node.js

```javascript
const nasai = require('sunan-al-nasai');  // CJS
import nasai from 'sunan-al-nasai';       // ESM

nasai.get(1)
nasai.getByChapter(1)
nasai.search('prayer')
nasai.search('prayer', 5)
nasai.getRandom()
nasai[0]
nasai.length
nasai.metadata
nasai.chapters
nasai.find(h => h.id === 23)
nasai.filter(h => h.chapterId === 1)
nasai.slice(0, 10)
```

---

## ⚛️ React

```bash
cd my-react-app
nasai --react    # generates src/hooks/useNasai.js
```

```jsx
import { useNasai } from '../hooks/useNasai';

function HadithOfTheDay() {
  const nasai = useNasai();
  if (!nasai) return <p>Loading...</p>;
  const h = nasai.getRandom();
  return <div><strong>{h.english.narrator}</strong><p>{h.english.text}</p></div>;
}
```

---

## 🐍 Python

```python
from sunan_al_nasai import Nasai

nasai = Nasai()

nasai.get(1)
nasai.getByChapter(1)
nasai.search("prayer")
nasai.search("prayer", limit=5)
nasai.getRandom()
nasai[0]
nasai.length
nasai.find(lambda h: h.id == 23)
nasai.filter(lambda h: h.chapterId == 1)
nasai.slice(0, 10)

# Custom path
nasai = Nasai(data_path="/path/to/nasai.json")
```

---

## 🖥️ CLI

```bash
nasai 1
nasai 2345 -a           # Arabic only
nasai 2345 -b           # Arabic + English
nasai 23 34             # Hadith 34 within chapter 23
nasai --search "prayer"
nasai --search "fasting" --all
nasai --chapter 1
nasai --random
nasai --react
nasai --version
```

---

## 📂 Structure

```
sunan-al-nasai/
├── data/
│   ├── nasai.json           ← source of truth (replace with real data)
│   ├── nasai.json.gz        ← generated (shipped in packages)
│   └── chapters/            ← generated (gitignored)
├── bin/index.js             ← CLI
├── src/                     ← JS source
├── types/index.d.ts
├── python/sunan_al_nasai/   ← Python package
├── scripts/build.mjs
├── examples/
├── docs/
└── tests/
```

---

## 🔧 Development

```bash
# 1. Place your real nasai.json in data/
node scripts/build.mjs

# 2. Test locally (no internet needed)
python -m build --no-isolation --wheel
python -m zipfile -l dist\sunan_al_nasai-1.0.0-py3-none-any.whl | findstr "nasai.json.gz"
pip install dist\sunan_al_nasai-1.0.0-py3-none-any.whl --force-reinstall
nasai 23

# 3. Release (triggers GitHub Actions → auto-publishes to npm + PyPI)
git add .
git commit -m "v1.0.0 — initial release"
git push origin main
gh release create v1.0.0 --title "v1.0.0" --notes "initial release"
```

---

## 📄 License

GNU Affero General Public License v3.0 (AGPL-3.0)

---

<div align="center">

**Made with ❤️ for the Muslim community · Seeking knowledge together**

[![Stars](https://img.shields.io/github/stars/SENODROOM/sunan-al-nasai?style=for-the-badge&logo=github&logoColor=white&color=f0c040&labelColor=1a1a1a)](https://github.com/SENODROOM/sunan-al-nasai/stargazers)

</div>
