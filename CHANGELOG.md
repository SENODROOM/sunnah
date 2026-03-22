# Changelog

## [1.5.0] — 2026-03-22

### Added
- All 6 books now in PACKAGES list: Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah, Nasa'i
- Python package published to PyPI (`pip install sunnah`)
- `sunnah pip install <book>` — install Python hadith packages
- `sunnah pip list` — show Python package status
- `sunnah pip update` — update Python packages
- `sunnah --pip` flag in interactive UI to toggle npm/pip install mode
- `sunnah search <query>` — search across ALL installed books at once
- `sunnah random` — show a random hadith from a random installed book
- `sunnah info <book>` — detailed book info without opening the TUI
- GitHub Actions: auto-publish to npm + PyPI on release

## [1.4.0] — earlier
- Interactive TUI with progress bars
- `sunnah install/uninstall/--update/--list/--react`
