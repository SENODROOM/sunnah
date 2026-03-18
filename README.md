<div align="center">

<h1>📿 Sunnah</h1>

![npm version](https://img.shields.io/badge/npm-coming%20soon-orange?style=for-the-badge&logo=npm)
![license](https://img.shields.io/badge/license-AGPL--3.0-blue?style=for-the-badge&logo=gnu)
![status](https://img.shields.io/badge/status-in%20development-yellow?style=for-the-badge)
![GitHub stars](https://img.shields.io/github/stars/SENODROOM/sunnah?style=for-the-badge&logo=github)

**📚 One package. Every major Hadith collection. CLI, Node.js, React, Vue — all supported.**

_Coming soon to npm_

</div>

---

## 🌙 What is Sunnah?

`sunnah` is an upcoming npm package that gives developers programmatic access to the major hadith collections of Islam — in one unified, consistent API. Whether you're building a web app, a mobile app, a CLI tool, or a backend API, `sunnah` will be the single source for all authentic hadith literature.

---

## 📚 Planned Hadith Collections

| Book                  | Author          | Hadiths | Status                                                                            |
| --------------------- | --------------- | ------- | --------------------------------------------------------------------------------- |
| **Sahih al-Bukhari**  | Imam al-Bukhari | 7,277   | ✅ Available ([sahih-al-bukhari](https://www.npmjs.com/package/sahih-al-bukhari)) |
| **Sahih Muslim**      | Imam Muslim     | 7,563   | 🔜 Coming Soon                                                                    |
| **Sunan Abu Dawud**   | Abu Dawud       | 5,274   | 🔜 Coming Soon                                                                    |
| **Jami at-Tirmidhi**  | Imam Tirmidhi   | 3,956   | 🔜 Coming Soon                                                                    |
| **Sunan an-Nasa'i**   | Imam an-Nasa'i  | 5,758   | 🔜 Coming Soon                                                                    |
| **Sunan Ibn Majah**   | Ibn Majah       | 4,341   | 🔜 Coming Soon                                                                    |
| **Muwatta Malik**     | Imam Malik      | 1,832   | 🔜 Coming Soon                                                                    |
| **Musnad Ahmad**      | Imam Ahmad      | 27,000+ | 🔜 Coming Soon                                                                    |
| **Riyad as-Salihin**  | Imam an-Nawawi  | 1,896   | 🔜 Coming Soon                                                                    |
| **Al-Adab Al-Mufrad** | Imam al-Bukhari | 1,322   | 🔜 Coming Soon                                                                    |

---

## 🚀 Planned API

### Install a specific book

```bash
# Install the full package
npm install sunnah

# Or install globally for CLI access
npm install -g sunnah
```

### CLI — download and browse any book

```bash
# Download a hadith book
sunnah download bukhari
sunnah download muslim
sunnah download tirmidhi

# Browse hadiths
sunnah bukhari 1
sunnah muslim 2345 --arabic
sunnah tirmidhi 23 34 --both

# List all available books
sunnah list

# Show help
sunnah --help
```

### Node.js

```javascript
import { bukhari, muslim, tirmidhi } from "sunnah";

// Each book has the same consistent API
console.log(bukhari.get(1));
console.log(muslim.search("prayer"));
console.log(tirmidhi.getRandom());
console.log(tirmidhi.getByChapter(3));

// Or import all books at once
import sunnah from "sunnah";
sunnah.bukhari.get(1);
sunnah.muslim.get(1);
```

### React — one command setup

```bash
# Inside your React project
sunnah --react
```

Generates hooks for every book:

```jsx
import { useBukhari, useMuslim, useTirmidhi } from "../hooks/useSunnah";

function HadithComponent() {
  const bukhari = useBukhari();
  const muslim = useMuslim();

  if (!bukhari || !muslim) return <p>Loading...</p>;

  return (
    <div>
      <p>{bukhari.getRandom().english.text}</p>
      <p>{muslim.getRandom().english.text}</p>
    </div>
  );
}
```

---

## 🔧 Planned Features

- 📦 **One package** — all major hadith collections in a single install
- ⚡ **Tiny install** — data loads from CDN, not bundled into your app
- 🌐 **Bilingual** — Arabic text + English translation for every collection
- 🔍 **Unified search** — search across a single book or all books at once
- 🖥️ **CLI** — read any hadith from your terminal
- ⚛️ **React/Vue hooks** — auto-generated with one command
- 📘 **TypeScript** — full type definitions
- 🔧 **Zero dependencies** — no external packages required
- 🌍 **Universal** — Node.js CJS, Node.js ESM, React, Vue, Vite, webpack

---

## 🗺️ Roadmap

- [x] **v1.0** — Sahih al-Bukhari released as standalone package
- [ ] **v2.0** — Sahih Muslim added
- [ ] **v2.5** — Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah added (the Six Books)
- [ ] **v3.0** — Muwatta Malik, Musnad Ahmad, Riyad as-Salihin added
- [ ] **v4.0** — Cross-book search, shared narrator index, topic tagging
- [ ] **v5.0** — Full sunnah.com-style grading and chain of narration data

---

## 📦 Current Package

If you need Sahih al-Bukhari right now, it is already available as a standalone package:

```bash
npm install sahih-al-bukhari
npm install -g sahih-al-bukhari
```

[![sahih-al-bukhari on npm](https://img.shields.io/npm/v/sahih-al-bukhari?style=for-the-badge&logo=npm&label=sahih-al-bukhari)](https://www.npmjs.com/package/sahih-al-bukhari)

Full documentation → [sahih-al-bukhari README](https://github.com/SENODROOM/sahih-al-bukhari)

---

## 🔔 Stay Updated

Watch this repository to get notified when `sunnah` launches on npm.

[![GitHub stars](https://img.shields.io/github/stars/SENODROOM/sunnah?style=for-the-badge&logo=github)](https://github.com/SENODROOM/sunnah)
[![GitHub watchers](https://img.shields.io/github/watchers/SENODROOM/sunnah?style=for-the-badge&logo=github)](https://github.com/SENODROOM/sunnah)

---

## 🤝 Contributing

Want to help build this? Contributions are very welcome.

- 📖 **Data** — Help format and verify hadith collections
- 💻 **Code** — Build the package infrastructure
- 📚 **Docs** — Write documentation and examples
- 🐛 **Issues** — Report bugs or suggest features

1. Fork the repository
2. Create a branch: `git checkout -b feature/muslim-collection`
3. Commit: `git commit -m 'Add Sahih Muslim data'`
4. Push and open a Pull Request

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

[🚀 Current Package](https://www.npmjs.com/package/sahih-al-bukhari) •
[📋 Roadmap](#️-roadmap) •
[🤝 Contribute](#-contributing) •
[🔔 Watch for Updates](https://github.com/SENODROOM/sunnah)

</div>
