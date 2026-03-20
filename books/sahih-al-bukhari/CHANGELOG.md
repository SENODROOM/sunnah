# Changelog

All notable changes to this project will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [3.1.2] — 2026-03-21

### Fixed

- size problem in both packages

## [3.1.1] — 2026-03-20

### Added

- Python package published to PyPI (`pip install sahih-al-bukhari`)
- Python API identical to npm — same camelCase method names (`get`, `getByChapter`, `search`, `getRandom`)
- Monorepo structure — single `bin/bukhari.json` and `chapters/` shared by both packages
- `MANIFEST.in` and `.npmignore` to keep each package clean on publish
- `python/` directory for Python source
- `src/` directory for JS source files
- `types/` directory for TypeScript definitions
- `scripts/build.mjs` — build script moved out of root
- `examples/` — runnable examples for Node CJS, Node ESM, React, Express, Flask
- `docs/` — API reference, CLI reference, data format docs
- `tests/` — test suites for both JS and Python
- `.github/workflows/` — auto-publish to npm and PyPI on GitHub release
- `.github/ISSUE_TEMPLATE/` — bug report and feature request templates
- `CONTRIBUTING.md`
- `CHANGELOG.md`

### Changed

- `search()` now accepts optional `limit` parameter in both JS and Python
- `index.browser.js` moved to `src/index.browser.js`

---

## [3.1.0] — 2026-01-15

### Added

- `--react` CLI flag to generate `useBukhari` React hook
- `search(query, limit)` limit parameter in browser build

### Fixed

- CLI wrap width on narrow terminals

---

## [3.0.0] — 2025-11-01

### Added

- Full bilingual support — Arabic text for every hadith
- Chapter objects now include Arabic names
- `getByChapter()` method

### Changed

- Data structure updated — `english` is now an object `{ narrator, text }`

---

## [2.0.0] — 2025-06-01

### Added

- CLI (`bukhari` command)
- `-a` / `-b` language flags
- `--search`, `--chapter`, `--random` CLI commands

---

## [1.0.0] — 2025-01-01

### Added

- Initial release
- 7,277 hadiths with English translations
- `get()`, `search()`, `getRandom()`, `getByChapter()`
