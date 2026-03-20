<div align="center">

<h1>
  <img src="https://em-content.zobj.net/source/apple/391/mosque_1f54c.png" width="36" />
  &nbsp;sahih-al-bukhari
</h1>

<p align="center">
  <strong>The complete Sahih al-Bukhari — 7,277 hadiths, full Arabic & English.</strong><br />
  One repo · one dataset · published on both <strong>npm</strong> and <strong>PyPI</strong>.
</p>

<br />

<!-- Row 1: version badges -->
<p>
  <a href="https://www.npmjs.com/package/sahih-al-bukhari" text-decoration="none">
    <img src="https://img.shields.io/npm/v/sahih-al-bukhari?style=for-the-badge&logo=npm&logoColor=white&color=CB3837&labelColor=1a1a1a" alt="npm version" />
  </a><a href="https://pypi.org/project/sahih-al-bukhari/" text-decoration="none">
    <img src="https://img.shields.io/pypi/v/sahih-al-bukhari?style=for-the-badge&logo=pypi&logoColor=white&color=3775A9&labelColor=1a1a1a" alt="PyPI version" />
  </a><a href="https://github.com/SENODROOM/sahih-al-bukhari/blob/main/LICENSE" text-decoration="none">
    <img src="https://img.shields.io/github/license/SENODROOM/sahih-al-bukhari?style=for-the-badge&logo=gnu&logoColor=white&color=A42E2B&labelColor=1a1a1a" alt="License: AGPL-3.0" />
  </a>
</p>

<!-- Row 2: stats -->
<p>
  <a href="https://www.npmjs.com/package/sahih-al-bukhari" text-decoration="none">
    <img src="https://img.shields.io/npm/dt/sahih-al-bukhari?style=for-the-badge&logo=npm&logoColor=white&color=CB3837&labelColor=1a1a1a" alt="npm downloads" />
  </a><a href="https://pypi.org/project/sahih-al-bukhari/" text-decoration="none">
    <img src="https://img.shields.io/pypi/dm/sahih-al-bukhari?style=for-the-badge&logo=pypi&logoColor=white&color=3775A9&labelColor=1a1a1a" alt="PyPI monthly downloads" />
  </a>
</p>

<!-- Row 3: repo stats -->
<p>
  <a href="https://github.com/SENODROOM/sahih-al-bukhari/stargazers" text-decoration="none">
    <img src="https://img.shields.io/github/stars/SENODROOM/sahih-al-bukhari?style=for-the-badge&logo=github&logoColor=white&color=f0c040&labelColor=1a1a1a" alt="GitHub stars" />
  </a><a href="https://github.com/SENODROOM/sahih-al-bukhari/issues" text-decoration="none">
    <img src="https://img.shields.io/github/issues/SENODROOM/sahih-al-bukhari?style=for-the-badge&logo=github&logoColor=white&color=238636&labelColor=1a1a1a" alt="GitHub issues" />
  </a><a href="https://github.com/SENODROOM/sahih-al-bukhari/commits/main" text-decoration="none">
    <img src="https://img.shields.io/github/last-commit/SENODROOM/sahih-al-bukhari?style=for-the-badge&logo=github&logoColor=white&color=8957e5&labelColor=1a1a1a" alt="Last commit" />
  </a>
</p>

<!-- Row 4: tech -->
<p>
  <img src="https://img.shields.io/badge/Node.js-%3E%3D14-339933?style=for-the-badge&logo=node.js&logoColor=white&labelColor=1a1a1a" alt="Node.js" /><img src="https://img.shields.io/badge/Python-%3E%3D3.8-3776AB?style=for-the-badge&logo=python&logoColor=white&labelColor=1a1a1a" alt="Python" /><img src="https://img.shields.io/badge/TypeScript-Typed-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=1a1a1a" alt="TypeScript" /><img src="https://img.shields.io/badge/Zero-Dependencies-00C853?style=for-the-badge&logoColor=white&labelColor=1a1a1a" alt="Zero dependencies" />
</p>

<br />

[![NPM](https://nodei.co/npm/sahih-al-bukhari.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/sahih-al-bukhari/)

</div>

---

## ✨ Features at a Glance

|     | Feature                 | Details                                                 |
| --- | ----------------------- | ------------------------------------------------------- |
| 📚  | **Complete Collection** | All 7,277 authentic hadiths from Sahih al-Bukhari       |
| 🌐  | **Bilingual**           | Full Arabic text + English translation for every hadith |
| 📝  | **Chapters**            | 4,000+ chapters with Arabic & English names             |
| ⚡  | **Tiny Install**        | ~3KB package — data loaded from CDN on demand           |
| 🔍  | **Full-text Search**    | Search English text and narrator names instantly        |
| 🖥️  | **CLI**                 | Terminal access with Arabic/English/both flags          |
| ⚛️  | **React Hook**          | One command generates `useBukhari()` in your project    |
| 🐍  | **Python**              | Identical API — same method names as the npm package    |
| 📘  | **TypeScript**          | Full type definitions, zero `@types` package needed     |
| 🔧  | **Zero Config**         | Works out of the box everywhere                         |
| 🗄️  | **One Dataset**         | `bin/bukhari.json` shared by both JS and Python         |

---

## 🚀 Installation

<table>
<tr>
<td><strong>JavaScript / Node.js</strong></td>
<td><strong>Python</strong></td>
</tr>
<tr>
<td>

```bash
# local (for projects)
npm install sahih-al-bukhari

# global (for CLI)
npm install -g sahih-al-bukhari
```

</td>
<td>

```bash
# local (for projects)
pip install sahih-al-bukhari

# global CLI is included automatically
```

</td>
</tr>
</table>

---

## 🟨 JavaScript / Node.js

### CommonJS & ESM

```javascript
// CommonJS — require()
const bukhari = require("sahih-al-bukhari");

// ESM — import
import bukhari from "sahih-al-bukhari";

// Get by ID
bukhari.get(1); // → Hadith

// Get by chapter
bukhari.getByChapter(1); // → Hadith[]

// Full-text search
bukhari.search("prayer"); // → Hadith[]

// Random
bukhari.getRandom(); // → Hadith

// Index access
bukhari[0]; // → Hadith (first)
bukhari.length; // → 7277

// Metadata
bukhari.metadata; // → { title, author, ... }
bukhari.chapters; // → Chapter[]
```

### Hadith object shape

```javascript
{
  id: 1,
  chapterId: 1,
  arabic: "حَدَّثَنَا الْحُمَيْدِيُّ...",
  english: {
    narrator: "Umar bin Al-Khattab",
    text: "I heard Allah's Messenger (ﷺ) saying..."
  }
}
```

### Native array methods — all work

```javascript
bukhari.find((h) => h.id === 23);
bukhari.filter((h) => h.chapterId === 1);
bukhari.map((h) => h.english.narrator);
bukhari.forEach((h) => console.log(h.id));
bukhari.slice(0, 10);
```

---

## ⚛️ React / Vue / Vite

Run this **once** inside your React project:

```bash
cd my-react-app
bukhari --react
```

This auto-generates `src/hooks/useBukhari.js`. Then use it anywhere:

```jsx
import { useBukhari } from "../hooks/useBukhari";

function HadithOfTheDay() {
  const bukhari = useBukhari();
  if (!bukhari) return <p>Loading...</p>;

  const h = bukhari.getRandom();
  return (
    <div>
      <p>
        <strong>{h.english.narrator}</strong>
      </p>
      <p>{h.english.text}</p>
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
    <>
      <input
        placeholder="Search hadiths..."
        onChange={(e) => setResults(bukhari.search(e.target.value, 10))}
      />
      {results.map((h) => (
        <p key={h.id}>{h.english.text}</p>
      ))}
    </>
  );
}
```

> Data is fetched from jsDelivr CDN once and cached globally. All components share the same request — no duplicates.

---

## 🐍 Python

The Python API is **identical** to the npm package — same camelCase method names, same behaviour.

```python
from sahih_al_bukhari import Bukhari

bukhari = Bukhari()   # reads bin/bukhari.json if in repo, else fetches from CDN

# Exact same API as JS
bukhari.get(1)                          # Hadith | None
bukhari.getByChapter(1)                 # list[Hadith]
bukhari.search("prayer")                # list[Hadith]
bukhari.search("prayer", limit=5)       # list[Hadith] — top 5
bukhari.getRandom()                     # Hadith

# Index access & iteration
bukhari[0]                              # first hadith
bukhari.length                          # 7277
len(bukhari)                            # 7277
for h in bukhari: print(h.id)

# Array-style methods (matches JS prototype)
bukhari.find(lambda h: h.id == 23)
bukhari.filter(lambda h: h.chapterId == 1)
bukhari.map(lambda h: h.narrator)
bukhari.slice(0, 10)

# Metadata
bukhari.metadata.english   # {"title": ..., "author": ...}
bukhari.chapters           # list[Chapter]
```

### Custom data path

```python
# Use your own bukhari.json at any path
bukhari = Bukhari(data_path="/absolute/path/to/bukhari.json")
bukhari = Bukhari(data_path=Path(__file__).parent / "bukhari.json")
```

### Flask API example

```python
from flask import Flask, jsonify, request
from sahih_al_bukhari import Bukhari

app = Flask(__name__)
bukhari = Bukhari()

@app.get("/api/hadith/random")
def random_hadith():
    return jsonify(bukhari.getRandom().to_dict())

@app.get("/api/hadith/<int:hadith_id>")
def get_hadith(hadith_id):
    h = bukhari.get(hadith_id)
    return jsonify(h.to_dict()) if h else ("Not found", 404)

@app.get("/api/search")
def search():
    return jsonify([h.to_dict() for h in bukhari.search(request.args.get("q", ""), limit=20)])
```

---

## 🖥️ CLI

The same `bukhari` command works whether installed via **npm** or **pip**.

```bash
# By ID
bukhari 1
bukhari 2345

# Within a chapter
bukhari 23 34

# Language flags
bukhari 2345              # English only (default)
bukhari 2345 -a           # Arabic only
bukhari 2345 --arabic     # Arabic only
bukhari 2345 -b           # Arabic + English
bukhari 2345 --both       # Arabic + English

# Search
bukhari --search "prayer"
bukhari --search "fasting" --all    # show all results (default: top 5)

# Chapter listing
bukhari --chapter 5

# Random
bukhari --random
bukhari --random -b

# React hook generator (JS only — run inside your React project)
bukhari --react

# Info
bukhari --version
bukhari --help
```

### Example output

```
════════════════════════════════════════════════════════════
Hadith #1  |  Chapter: 1 — Revelation
════════════════════════════════════════════════════════════
Narrator: Umar bin Al-Khattab

I heard Allah's Messenger (ﷺ) saying, "The reward of deeds
depends upon the intentions and every person will get the
reward according to what he has intended..."
════════════════════════════════════════════════════════════
```

---

## 🗄️ Monorepo Structure

```
sahih-al-bukhari/
│
├── bin/
│   ├── bukhari.json        ← 🔑 SHARED — single source of truth for JS + Python
│   └── index.js            ← JS CLI entry
│
├── chapters/               ← 🔑 SHARED — generated by `node build.mjs`
│   ├── meta.json               used by CDN loader (JS browser) + Python CDN fallback
│   ├── 1.json
│   └── ...
│
├── sahih_al_bukhari/       ← Python package
│   ├── __init__.py
│   ├── bukhari.py          ← auto-reads bin/bukhari.json
│   └── cli.py
│
├── index.js                ← JS ESM (browser-safe)
├── index.cjs               ← JS CommonJS
├── index.node.js           ← JS Node ESM
├── index.browser.js        ← JS browser / CDN (auto-generated)
├── index.d.ts              ← TypeScript definitions
├── build.mjs               ← generates chapters/ from bin/bukhari.json
│
├── package.json            ← npm config
├── pyproject.toml          ← Python / Poetry config
├── MANIFEST.in             ← Python sdist: include data, exclude JS
└── .npmignore              ← npm publish: exclude Python files
```

### Shared data — how it works

| File               | Used by                                                     |
| ------------------ | ----------------------------------------------------------- |
| `bin/bukhari.json` | JS Node (CJS + ESM) · Python (auto-detected from repo root) |
| `chapters/`        | JS browser CDN fetch · Python CDN fallback                  |

**You never duplicate data.** Both packages read the exact same file.

---

## 📊 API Reference

### Methods

| Method                  | JS  | Python | Returns                    |
| ----------------------- | --- | ------ | -------------------------- |
| `get(id)`               | ✅  | ✅     | `Hadith \| undefined/None` |
| `getByChapter(id)`      | ✅  | ✅     | `Hadith[]`                 |
| `search(query, limit?)` | ✅  | ✅     | `Hadith[]`                 |
| `getRandom()`           | ✅  | ✅     | `Hadith`                   |
| `find(predicate)`       | ✅  | ✅     | `Hadith \| undefined/None` |
| `filter(predicate)`     | ✅  | ✅     | `Hadith[]`                 |
| `map(fn)`               | ✅  | ✅     | `any[]`                    |
| `forEach(fn)`           | ✅  | ✅     | `void/None`                |
| `slice(start, end)`     | ✅  | ✅     | `Hadith[]`                 |

### Properties

| Property   | Type           | Description                 |
| ---------- | -------------- | --------------------------- |
| `length`   | `number / int` | Total hadiths — 7,277       |
| `metadata` | `Metadata`     | Title, author, introduction |
| `chapters` | `Chapter[]`    | All chapters                |

---

## 💡 Examples

<details>
<summary><strong>Seed a MongoDB database (Node.js)</strong></summary>

```javascript
import { MongoClient } from "mongodb";
import bukhari from "sahih-al-bukhari";

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
await client
  .db("islam")
  .collection("hadiths")
  .insertMany([...bukhari]);
await client.close();
console.log("Seeded", bukhari.length, "hadiths");
```

</details>

<details>
<summary><strong>Seed a database (Python)</strong></summary>

```python
from sahih_al_bukhari import Bukhari

bukhari = Bukhari()
records = [h.to_dict() for h in bukhari]
# Insert into any DB
print(f"Seeded {len(records)} hadiths")
```

</details>

<details>
<summary><strong>Thematic search</strong></summary>

```python
from sahih_al_bukhari import Bukhari

bukhari = Bukhari()
topics = ["prayer", "charity", "fasting", "knowledge", "patience"]
for topic in topics:
    count = len(bukhari.search(topic))
    print(f"{topic:12} → {count} hadiths")
```

</details>

<details>
<summary><strong>Express.js REST API</strong></summary>

```javascript
import express from "express";
import bukhari from "sahih-al-bukhari";

const app = express();

app.get("/api/hadith/random", (_, res) => res.json(bukhari.getRandom()));
app.get("/api/hadith/:id", (req, res) => {
  const h = bukhari.get(parseInt(req.params.id));
  h ? res.json(h) : res.status(404).json({ error: "Not found" });
});
app.get("/api/search", (req, res) =>
  res.json(bukhari.search(req.query.q || "")),
);
app.get("/api/chapter/:id", (req, res) =>
  res.json(bukhari.getByChapter(parseInt(req.params.id))),
);

app.listen(3000, () => console.log("Running on :3000"));
```

</details>

---

## 🔧 Development

```bash
git clone https://github.com/SENODROOM/sahih-al-bukhari.git
cd sahih-al-bukhari
npm install

# Regenerate chapters/ from bin/bukhari.json
node build.mjs

# Publish to npm
npm publish

# Publish to PyPI
pip install build twine
python -m build
python -m twine upload dist/*
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

- **📖 Source** — Sahih al-Bukhari, the most authentic hadith collection in Islam
- **👨‍🏫 Translations** — By reputable Islamic scholars
- **💚 Inspiration** — The global Muslim community seeking knowledge

---

<div align="center">

### 🌟 If this project helped you, please give it a star!

[![GitHub stars](https://img.shields.io/github/stars/SENODROOM/sahih-al-bukhari?style=for-the-badge&logo=github&logoColor=white&color=f0c040&labelColor=1a1a1a)](https://github.com/SENODROOM/sahih-al-bukhari/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/SENODROOM/sahih-al-bukhari?style=for-the-badge&logo=github&logoColor=white&color=8957e5&labelColor=1a1a1a)](https://github.com/SENODROOM/sahih-al-bukhari/fork)

<br />

**Made with ❤️ for the Muslim community · Seeking knowledge together**

[📖 Docs](https://github.com/SENODROOM/sahih-al-bukhari#readme) · [🐛 Issues](https://github.com/SENODROOM/sahih-al-bukhari/issues) · [💬 Discussions](https://github.com/SENODROOM/sahih-al-bukhari/discussions)

</div>
