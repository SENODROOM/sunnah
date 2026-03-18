<div align="center">

<h1>📿 Sunnah</h1>

![npm version](https://img.shields.io/npm/v/sunnah?style=for-the-badge&logo=npm)
![npm downloads](https://img.shields.io/npm/dt/sunnah?style=for-the-badge&logo=npm)
![npm downloads per month](https://img.shields.io/npm/dm/sunnah?style=for-the-badge&logo=npm)
![license](https://img.shields.io/github/license/SENODROOM/sunnah?style=for-the-badge&logo=gnu)
![node version](https://img.shields.io/node/v/sunnah?style=for-the-badge&logo=node.js)
![GitHub stars](https://img.shields.io/github/stars/SENODROOM/sunnah?style=for-the-badge&logo=github)

**📚 One command. Every major Hadith collection. Interactive CLI installer for the entire Sunnah ecosystem.**

[![NPM](https://nodei.co/npm/sunnah.png)](https://nodei.co/npm/sunnah/)

</div>

---

## 🌙 What is Sunnah?

`sunnah` is an interactive CLI package manager for the major hadith collections of Islam. Install, manage, and update every book in the Sunnah ecosystem from a single terminal UI — with real-time progress bars, keyboard navigation, and zero config.

```bash
npm install -g sunnah
sunnah
```

That's it. A beautiful full-screen terminal UI opens, showing every available hadith package — select what you want, press enter, watch it install.

---

## 📦 Available Packages

| Book                 | Package                                                          | Hadiths | Author           | CLI Command |
| -------------------- | ---------------------------------------------------------------- | ------- | ---------------- | ----------- |
| **Sahih al-Bukhari** | [`sahih-al-bukhari`](https://npmjs.com/package/sahih-al-bukhari) | 7,563   | Imam al-Bukhari  | `bukhari`   |
| **Sahih Muslim**     | [`sahih-muslim`](https://npmjs.com/package/sahih-muslim)         | 7,470   | Imam Muslim      | `muslim`    |
| **Sunan Abi Dawud**  | [`sunan-abi-dawud`](https://npmjs.com/package/sunan-abi-dawud)   | 5,274   | Imam Abu Dawud   | `dawud`     |
| **Jami al-Tirmidhi** | [`jami-al-tirmidhi`](https://npmjs.com/package/jami-al-tirmidhi) | 3,956   | Imam al-Tirmidhi | `tirmidhi`  |
| **Sunan Ibn Majah**  | [`sunan-ibn-majah`](https://npmjs.com/package/sunan-ibn-majah)   | 4,341   | Imam Ibn Majah   | `ibnmajah`  |

---

## 🚀 Installation

```bash
npm install -g sunnah
```

---

## 🖥️ Usage

### Interactive UI (default)

```bash
sunnah
```

Opens a full-screen interactive installer:

```
══════════════════════════════════════════════════════════════════════
  📚 Sunnah Package Manager  v1.1.2
  ↑↓ navigate  space select  a all  i info  u uninstall  enter install  q quit
══════════════════════════════════════════════════════════════════════

  ▶ [✓]  Sahih al-Bukhari  ● installed
         Imam Muhammad ibn Ismail al-Bukhari
         The most authentic collection of hadith...
         Hadiths: 7,563   CLI: bukhari --help

    [ ]  Sahih Muslim  ○ not installed
    [ ]  Sunan Abi Dawud  ○ not installed
    [ ]  Jami al-Tirmidhi  ○ not installed
    [ ]  Sunan Ibn Majah  ○ not installed

──────────────────────────────────────────────────────────────────────
  ● 1 selected: sahih-al-bukhari
──────────────────────────────────────────────────────────────────────
```

### Keyboard Controls

| Key     | Action                                |
| ------- | ------------------------------------- |
| `↑` `↓` | Navigate packages                     |
| `space` | Toggle select                         |
| `a`     | Select all / deselect all             |
| `i`     | Show package info + installed version |
| `u`     | Uninstall selected                    |
| `enter` | Install selected                      |
| `q`     | Quit                                  |

### Non-interactive commands

```bash
sunnah --list         # List all packages with install status
sunnah --update       # Check all installed packages for updates
sunnah --help         # Show help
sunnah --version      # Show version
```

---

## 🗂️ After Installing

Once you've installed individual packages via `sunnah`, each has its own powerful CLI:

```bash
# Read hadiths
bukhari 1                        # First hadith
muslim 2345 -b                   # Hadith #2345 in Arabic + English
tirmidhi 23 34                   # 34th hadith of chapter 23
dawud --random                   # Random hadith
ibnmajah 500 -b                  # Hadith #500 in Arabic + English

# Search
bukhari --search "prayer"        # Top 5 results with highlighted matches
tirmidhi --search "fasting" --all  # All results

# Browse chapters
muslim --chapter 5               # All hadiths in chapter 5

# React hook
bukhari --react                  # Generate useBukhari() hook in your project
```

---

## 🔗 Individual Package Links

Each book is also available as a standalone package with full Node.js, React, and Vue support:

| Package            | npm                                                                                                                            | GitHub                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `sahih-al-bukhari` | [![npm](https://img.shields.io/npm/v/sahih-al-bukhari?style=flat-square&logo=npm)](https://npmjs.com/package/sahih-al-bukhari) | [SENODROOM/sahih-al-bukhari](https://github.com/SENODROOM/sahih-al-bukhari) |
| `sahih-muslim`     | [![npm](https://img.shields.io/npm/v/sahih-muslim?style=flat-square&logo=npm)](https://npmjs.com/package/sahih-muslim)         | [SENODROOM/sahih-muslim](https://github.com/SENODROOM/sahih-muslim)         |
| `sunan-abi-dawud`  | [![npm](https://img.shields.io/npm/v/sunan-abi-dawud?style=flat-square&logo=npm)](https://npmjs.com/package/sunan-abi-dawud)   | [SENODROOM/sunan-abi-dawud](https://github.com/SENODROOM/sunan-abi-dawud)   |
| `jami-al-tirmidhi` | [![npm](https://img.shields.io/npm/v/jami-al-tirmidhi?style=flat-square&logo=npm)](https://npmjs.com/package/jami-al-tirmidhi) | [SENODROOM/jami-al-tirmidhi](https://github.com/SENODROOM/jami-al-tirmidhi) |
| `sunan-ibn-majah`  | [![npm](https://img.shields.io/npm/v/sunan-ibn-majah?style=flat-square&logo=npm)](https://npmjs.com/package/sunan-ibn-majah)   | [SENODROOM/sunan-ibn-majah](https://github.com/SENODROOM/sunan-ibn-majah)   |

---

## 🤝 Contributing

### Overview

This is a **monorepo** managed with **git subtree**. The root repo (`SENODROOM/sunnah`) contains the `sunnah` CLI package manager. Each hadith book lives in `books/<book-name>/` and is simultaneously maintained as its own standalone GitHub repo, linked here as a subtree.

```
sunnah/                        ← root repo: the CLI manager
├── bin/index.js               ← sunnah interactive UI
├── books/
│   ├── sahih-al-bukhari/      ← subtree: SENODROOM/sahih-al-bukhari
│   ├── sahih-muslim/          ← subtree: SENODROOM/sahih-muslim
│   ├── sunan-abi-dawud/       ← subtree: SENODROOM/sunan-abi-dawud
│   ├── jami-al-tirmidhi/      ← subtree: SENODROOM/jami-al-tirmidhi
│   └── sunan-ibn-majah/       ← subtree: SENODROOM/sunan-ibn-majah
└── package.json
```

---

### 📥 Cloning the Repo

```bash
git clone https://github.com/SENODROOM/sunnah.git
cd sunnah
npm install
```

---

### 🌿 Working with Git Subtrees

#### What is a subtree?

Unlike submodules, git subtrees embed the full history of a child repo directly inside the parent. You can push and pull changes between the root monorepo and each book's standalone repo without any special git setup for contributors — it's all plain git.

#### Adding a new book as a subtree

When a new hadith book package has been published as its own GitHub repo (e.g. `SENODROOM/sunan-ibn-majah`), add it to the monorepo like this:

```bash
# Step 1 — register the remote (one-time)
git remote add sunan-ibn-majah https://github.com/SENODROOM/sunan-ibn-majah.git

# Step 2 — add the subtree at books/sunan-ibn-majah/
git subtree add --prefix=books/sunan-ibn-majah sunan-ibn-majah main --squash

# Step 3 — commit message will be auto-generated; push to the monorepo
git push origin main
```

#### Pulling updates from a book repo into the monorepo

If changes have been made directly in the standalone book repo (e.g. a data fix in `SENODROOM/sahih-al-bukhari`), pull them in:

```bash
git subtree pull --prefix=books/sahih-al-bukhari sahih-al-bukhari main --squash
```

#### Pushing monorepo changes back to a book repo

If you edited a book's files inside the monorepo and want those changes reflected in the standalone repo:

```bash
git subtree push --prefix=books/sahih-al-bukhari sahih-al-bukhari main
```

#### Remotes reference table

| Book folder              | Remote name        | Repo URL                                          |
| ------------------------ | ------------------ | ------------------------------------------------- |
| `books/sahih-al-bukhari` | `sahih-al-bukhari` | https://github.com/SENODROOM/sahih-al-bukhari.git |
| `books/sahih-muslim`     | `sahih-muslim`     | https://github.com/SENODROOM/sahih-muslim.git     |
| `books/sunan-abi-dawud`  | `sunan-abi-dawud`  | https://github.com/SENODROOM/sunan-abi-dawud.git  |
| `books/jami-al-tirmidhi` | `jami-al-tirmidhi` | https://github.com/SENODROOM/jami-al-tirmidhi.git |
| `books/sunan-ibn-majah`  | `sunan-ibn-majah`  | https://github.com/SENODROOM/sunan-ibn-majah.git  |

---

### ✏️ Making Changes to the Root CLI (`bin/index.js` or `package.json`)

These files belong only to the root monorepo — changes here do **not** need to be pushed to any subtree remote.

```bash
# Edit bin/index.js or package.json as usual, then:
git add .
git commit -m "feat: add sunan-ibn-majah to PACKAGES list"
git push origin main
```

---

### ➕ Adding a New Book Package (Pull Request guide)

To contribute a new hadith book to the ecosystem, follow these steps:

**1. Create the book repo**

Create a new GitHub repo at `https://github.com/<your-username>/<book-slug>` following the existing book structure:

```
<book-slug>/
├── bin/
│   ├── index.js          ← CLI entry point
│   └── <slug>.json       ← full hadith data (Arabic + English)
├── chapters/
│   ├── meta.json         ← chapter list
│   ├── 1.json            ← hadiths per chapter
│   └── ...
├── build.mjs
├── index.js              ← ESM browser entry
├── index.cjs             ← CommonJS entry
├── index.node.js         ← Node.js entry
├── index.d.ts            ← TypeScript definitions
├── package.json
├── README.md
├── LICENSE               ← AGPL-3.0
├── .gitignore
└── .npmignore
```

The `package.json` must follow this shape exactly:

```json
{
  "name": "<book-slug>",
  "version": "1.0.0",
  "description": "Complete <Book Name> hadith collection. Tiny package (~3KB), data from CDN. CLI + Node.js + React/Vue/Vite.",
  "type": "module",
  "main": "./index.cjs",
  "module": "./index.browser.js",
  "types": "./index.d.ts",
  "exports": {
    ".": {
      "types": "./index.d.ts",
      "browser": "./index.browser.js",
      "require": "./index.cjs",
      "import": "./index.node.js"
    },
    "./chapters/*": "./chapters/*"
  },
  "bin": { "<cmd>": "./bin/index.js" },
  "scripts": {
    "build": "node build.mjs",
    "prepublishOnly": "node build.mjs"
  },
  "keywords": [
    "islam",
    "hadith",
    "<slug>",
    "sunnah",
    "json",
    "arabic",
    "english",
    "react",
    "hook"
  ],
  "author": "muhammadsaadamin",
  "license": "AGPL-3.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/SENODROOM/<book-slug>.git"
  },
  "files": [
    "index.js",
    "index.browser.js",
    "index.cjs",
    "index.node.js",
    "index.d.ts",
    "bin/index.js",
    "bin/<slug>.json",
    "chapters/"
  ],
  "engines": { "node": ">=14.0.0" }
}
```

**2. Publish the npm package**

```bash
cd <book-slug>
npm publish --access public
```

**3. Fork this monorepo and add the subtree**

```bash
git clone https://github.com/<your-username>/sunnah.git
cd sunnah
git remote add <book-slug> https://github.com/<your-username>/<book-slug>.git
git subtree add --prefix=books/<book-slug> <book-slug> main --squash
```

**4. Register the new package in `bin/index.js`**

Add an entry to the `PACKAGES` array in `bin/index.js`:

```js
{
  name: "<book-slug>",
  label: "<Book Name>",
  author: "Imam <Author Name>",
  desc:   "<One-sentence description of the collection.>",
  hadiths: "<count>",
  cmd:  "<cmd>",
  hook: "use<Hook>",
},
```

**5. Open a Pull Request**

Push your branch and open a PR to `SENODROOM/sunnah` with:

- Title: `feat: add <book-slug> package`
- Description: Include the npm package link, hadith count, and a short description of the book's authenticity/provenance

---

### 🐛 Reporting Issues

Use the [Issues tab](https://github.com/SENODROOM/sunnah/issues) to:

- Request a new hadith collection to be added
- Report data errors in any book
- Suggest CLI improvements

---

## 📄 License

Licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **📖 Sources** — The authentic hadith collections of Islam
- **👨‍🏫 Scholars** — Translators and Islamic scholars whose work makes this possible
- **💚 Community** — The Muslim developer community worldwide

---

<div align="center">

**Made with ❤️ for the Muslim community | Seeking knowledge together**

[![GitHub stars](https://img.shields.io/github/stars/SENODROOM/sunnah?style=for-the-badge&logo=github)](https://github.com/SENODROOM/sunnah)

[📦 npm](https://npmjs.com/package/sunnah) •
[🐛 Issues](https://github.com/SENODROOM/sunnah/issues) •
[🤝 Contribute](https://github.com/SENODROOM/sunnah/pulls)

</div>
