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

## 📺 Install Flow

When you press `enter`, each package installs with a live animated progress bar:

```
══════════════════════════════════════════════════════════════════════
  Installing 2 packages…
══════════════════════════════════════════════════════════════════════

  [1/2]  Sahih al-Bukhari
  npm install -g sahih-al-bukhari

  ████████████████████░░░░░░░░░░░░░░░░░░░░  50%  Downloading tarball…

  ✓ Sahih al-Bukhari installed
  Usage: bukhari --help

  [2/2]  Jami al-Tirmidhi
  npm install -g jami-al-tirmidhi

  ████████████████████████████████████████ 100%  Complete!

  ✓ Jami al-Tirmidhi installed
  Usage: tirmidhi --help

══════════════════════════════════════════════════════════════════════
  ✓ All done! 2 packages installed globally.

  ▸ bukhari --help  ·  Sahih al-Bukhari
  ▸ tirmidhi --help  ·  Jami al-Tirmidhi
══════════════════════════════════════════════════════════════════════
```

---

## 🔍 --list

```bash
sunnah --list
```

```
────────────────────────────────────────────────────────────
  Available Sunnah Packages
────────────────────────────────────────────────────────────

  Sahih al-Bukhari  ✓ installed
  npm install -g sahih-al-bukhari
  The most authentic collection of hadith...
  Hadiths: 7,563   Author: Imam Muhammad ibn Ismail al-Bukhari

  Sahih Muslim  ✗ not installed
  npm install -g sahih-muslim
  ...
```

---

## 🔄 --update

```bash
sunnah --update
```

Checks every installed package against the latest version on npm:

```
────────────────────────────────────────────────────────────
  Checking for updates…
────────────────────────────────────────────────────────────

  ✓ Sahih al-Bukhari  1.2.0 — up to date
  ↑ Jami al-Tirmidhi  1.0.1 → 1.1.0  (run: npm install -g jami-al-tirmidhi)
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

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m 'Add my feature'`
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

[![GitHub stars](https://img.shields.io/github/stars/SENODROOM/sunnah?style=for-the-badge&logo=github)](https://github.com/SENODROOM/sunnah)

[📦 npm](https://npmjs.com/package/sunnah) •
[🐛 Issues](https://github.com/SENODROOM/sunnah/issues) •
[🤝 Contribute](https://github.com/SENODROOM/sunnah/pulls)

</div>
