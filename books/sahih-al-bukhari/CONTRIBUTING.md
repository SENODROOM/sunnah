# Contributing

Thank you for considering contributing to sahih-al-bukhari!

## Getting Started

```bash
git clone https://github.com/SENODROOM/sahih-al-bukhari.git
cd sahih-al-bukhari
npm install
```

## Project Structure

```
bin/bukhari.json    ← shared data (JS + Python)
chapters/           ← generated, do not edit manually
src/                ← JS source
python/             ← Python source
scripts/            ← build scripts
examples/           ← usage examples
docs/               ← documentation
tests/              ← test suites
```

## Making Changes

### JS changes
Edit files in `src/`. Run `node scripts/build.mjs` to regenerate `chapters/` and `src/index.browser.js`.

### Python changes
Edit files in `python/sahih_al_bukhari/`.

### Data changes
Edit `bin/bukhari.json` then run `node scripts/build.mjs` to regenerate `chapters/`.

## Running Tests

```bash
# JS tests (Node 18+)
node --test tests/js/bukhari.test.js

# Python tests
pip install pytest
python -m pytest tests/python/
```

## Submitting a PR

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run the tests
5. Commit: `git commit -m 'Add your feature'`
6. Push: `git push origin feature/your-feature`
7. Open a Pull Request

## Publishing (maintainers only)

Publishing is automatic via GitHub Actions on every new Release.
Just create a release on GitHub and both npm and PyPI update automatically.

For manual publishing:
```bash
# npm
npm publish

# PyPI
python -m build
python -m twine upload dist/*
```
