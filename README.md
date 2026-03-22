<div align="center">

<h1>
  <img src="https://em-content.zobj.net/source/apple/391/prayer-beads_1f4ff.png" width="36" />
  &nbsp;sunnah
</h1>

<p align="center">
  <strong>One command. Every major Hadith collection.<br />
  Interactive package manager for the entire Sunnah ecosystem — npm + PyPI.</strong>
</p>

<br />

<p>
  <a href="https://www.npmjs.com/package/sunnah">
    <img src="https://img.shields.io/npm/v/sunnah?style=for-the-badge&logo=npm&logoColor=white&color=CB3837&labelColor=1a1a1a" />
  </a>
  &nbsp;
  <a href="https://pypi.org/project/sunnah/">
    <img src="https://img.shields.io/pypi/v/sunnah?style=for-the-badge&logo=pypi&logoColor=white&color=3775A9&labelColor=1a1a1a" />
  </a>
  &nbsp;
  <a href="https://github.com/SENODROOM/sunnah/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/SENODROOM/sunnah?style=for-the-badge&logo=gnu&logoColor=white&color=A42E2B&labelColor=1a1a1a" />
  </a>
</p>

<p>
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=for-the-badge&logo=node.js&logoColor=white&labelColor=1a1a1a" />
  &nbsp;
  <img src="https://img.shields.io/badge/Python-%3E%3D3.8-3776AB?style=for-the-badge&logo=python&logoColor=white&labelColor=1a1a1a" />
</p>

</div>

---

## 🌙 What is Sunnah?

`sunnah` is an interactive CLI package manager for the major hadith collections of Islam. Install, manage, and update every book in the Sunnah ecosystem from a single terminal command — for both **npm** (Node.js/React) and **pip** (Python).

```bash
npm install -g sunnah   # Node.js CLI
pip install sunnah      # Python CLI
sunnah                  # open interactive TUI
```

---

## 📦 Available Packages

| Book | npm | pip | Hadiths | CLI |
|------|-----|-----|---------|-----|
| **Sahih al-Bukhari** | `sahih-al-bukhari` | `sahih-al-bukhari` | 7,563 | `bukhari` |
| **Sahih Muslim** | `sahih-muslim` | `sahih-muslim` | 7,470 | `muslim` |
| **Sunan Abi Dawud** | `sunan-abi-dawud` | `sunan-abi-dawud` | 5,274 | `dawud` |
| **Jami al-Tirmidhi** | `jami-al-tirmidhi` | `jami-al-tirmidhi` | 3,956 | `tirmidhi` |
| **Sunan Ibn Majah** | `sunan-ibn-majah` | `sunan-ibn-majah` | 4,341 | `majah` |
| **Sunan al-Nasa'i** | `sunan-al-nasai` | `sunan-al-nasai` | 5,768 | `nasai` |

---

## 🚀 Installation

```bash
# JavaScript / Node.js
npm install -g sunnah

# Python
pip install sunnah
```

---

## 🖥️ Interactive TUI

```bash
sunnah
```

Opens a full-screen terminal UI. Navigate with `↑↓`, toggle with `space`, press `enter` to install.

```
════════════════════════════════════════════════════════════
  📿 Sunnah Package Manager  v1.5.0
  ↑↓ nav  space select  a all  i info  u uninstall  U update  enter install  q quit
════════════════════════════════════════════════════════════

  ▶ [✓]  Sahih al-Bukhari   ● npm  (up to date)
         Imam Muhammad ibn Ismail al-Bukhari
         Most authentic hadith collection, second only to the Quran.
         Hadiths: 7,563   CLI: bukhari --help   npm: sahih-al-bukhari   pip: sahih-al-bukhari

    [ ]  Sahih Muslim        ○ not installed
    [ ]  Sunan Abi Dawud     ○ not installed
    ...
```

### Keyboard Controls

| Key | Action |
|-----|--------|
| `↑` `↓` | Navigate |
| `space` | Toggle select |
| `a` | Select all / deselect all |
| `i` | Show package info |
| `u` | Uninstall selected |
| `U` | Update selected |
| `enter` | Install selected |
| `q` | Quit |

---

## ⚡ Commands

### npm packages

```bash
sunnah list                          # all packages + npm/pip status
sunnah install bukhari               # npm install -g sahih-al-bukhari
sunnah install bukhari nasai majah   # install multiple at once
sunnah uninstall dawud               # uninstall
sunnah update                        # check for updates
sunnah update --install              # auto-install all updates
```

### Python (pip) packages

```bash
sunnah pip install bukhari           # pip install sahih-al-bukhari
sunnah pip install bukhari nasai     # install multiple
sunnah pip uninstall dawud           # uninstall
sunnah pip list                      # show Python package status
sunnah pip update                    # check for pip updates
sunnah pip update --install          # auto-install pip updates
```

### 🔍 NEW: Cross-book search

```bash
sunnah search "prayer"               # search all installed books (top 3 each)
sunnah search "fasting" --all        # show all results
```

### 🎲 NEW: Random hadith

```bash
sunnah random                        # random hadith from a random installed book
sunnah random bukhari                # random hadith specifically from Bukhari
```

### ℹ️ NEW: Book info

```bash
sunnah info nasai                    # detailed info: versions, CLI, Python import
sunnah info jami-al-tirmidhi         # works with full npm name too
```

### ⚛️ React hook generator

```bash
sunnah --react                       # generate useSunnah() for all installed books
sunnah --react bukhari muslim        # specific books only
```

---

## 🐍 Python API

After `pip install sunnah`, you also get the individual book packages:

```bash
sunnah pip install bukhari muslim nasai
```

```python
from sahih_al_bukhari import Bukhari
from sahih_muslim      import Muslim
from sunan_al_nasai    import Nasai

bukhari = Bukhari()
bukhari.get(1)
bukhari.search("prayer", limit=5)
bukhari.getRandom()
bukhari.getByChapter(1)
```

---

## 🟨 JavaScript / Node.js

```bash
sunnah install bukhari muslim
```

```javascript
import bukhari from 'sahih-al-bukhari';
import muslim  from 'sahih-muslim';

bukhari.get(1).english.text
muslim.search('prayer', 5)
```

---

## 📊 Version Stats

```bash
sunnah --version
```

```
────────────────────────────────────────────────────────────
  📿 sunnah  v1.5.0
────────────────────────────────────────────────────────────
  Available  : 6
  npm inst.  : 4 / 6
  pip inst.  : 3 / 6
  Collection : Sahih al-Bukhari, Sahih Muslim, Sunan al-Nasa'i, Jami al-Tirmidhi
  Hadiths    : 24,257
```

---

## 🗂️ Monorepo Structure

```
sunnah/
├── bin/index.js              ← npm CLI (interactive TUI + all commands)
├── python/sunnah_cli/        ← Python CLI (mirrors npm CLI exactly)
│   ├── __init__.py
│   ├── cli.py                ← main Python CLI entry
│   ├── packages.py           ← package registry (single source of truth)
│   ├── npm_utils.py          ← npm helpers
│   └── pip_utils.py          ← pip helpers
├── package.json
├── pyproject.toml
└── .github/workflows/        ← auto-publish to npm + PyPI on release
```

---

## 📄 License

GNU Affero General Public License v3.0 (AGPL-3.0)

---

<div align="center">

**Made with ❤️ for the Muslim community · Seeking knowledge together**

[![Stars](https://img.shields.io/github/stars/SENODROOM/sunnah?style=for-the-badge&logo=github&logoColor=white&color=f0c040&labelColor=1a1a1a)](https://github.com/SENODROOM/sunnah)

[📦 npm](https://npmjs.com/package/sunnah) • [🐍 PyPI](https://pypi.org/project/sunnah/) • [🐛 Issues](https://github.com/SENODROOM/sunnah/issues)

</div>
