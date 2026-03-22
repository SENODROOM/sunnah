# Changelog

## [1.0.5] — 2026-03-20

### FIXED:

- dawud.json.gz was not found in the python bundled now fixed

## [1.0.4] — 2026-03-20

### FIXED:

- sahih_dawud is incorrect. So, changed it into sunan_abi_dawud

## [1.0.3] — 2026-03-20

### Added

- Python package published to PyPI (`pip install sunan-abi-dawud`)
- Python API identical to npm — same camelCase method names
- Monorepo structure — single `data/dawud.json.gz` shared by JS and Python
- `data/` folder for all data files
- `src/`, `types/`, `scripts/`, `python/`, `examples/`, `docs/`, `tests/`
- `.github/workflows/` — auto-publish to npm and PyPI on GitHub release

## [1.0.1] — 2026-01-15

### Fixed

- CDN path correction

## [1.0.0] — 2026-01-01

### Added

- Initial release with 5,274 hadiths
