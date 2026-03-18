#!/usr/bin/env node
// CLI for jami-al-tirmidhi
// Usage:
//   tirmidhi <hadithId> [-a|-b]
//   tirmidhi <chapterId> <hadithId> [-a|-b]
//   tirmidhi --search "prayer"
//   tirmidhi --search "prayer" --all
//   tirmidhi --random
//   tirmidhi --chapter <id>
//   tirmidhi --react
//   tirmidhi -h | --help
//   tirmidhi -v | --version

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Tirmidhi } from '../index.js';

const __filename    = fileURLToPath(import.meta.url);
const __dirname     = path.dirname(__filename);
const pkg           = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const tirmidhiData  = JSON.parse(fs.readFileSync(path.join(__dirname, 'tirmidhi.json'), 'utf8'));

// ── Speed: build lookup maps at startup ───────────────────────────────────────
const _byId      = new Map();
const _byChapter = new Map();
tirmidhiData.hadiths.forEach(h => {
  _byId.set(h.id, h);
  if (!_byChapter.has(h.chapterId)) _byChapter.set(h.chapterId, []);
  _byChapter.get(h.chapterId).push(h);
});

const tirmidhi = new Tirmidhi(tirmidhiData);
export default tirmidhi;
export { Tirmidhi };

// ── Colors ────────────────────────────────────────────────────────────────────
const c = {
  reset:    '\x1b[0m',
  bold:     '\x1b[1m',
  dim:      '\x1b[2m',
  green:    '\x1b[32m',
  yellow:   '\x1b[33m',
  cyan:     '\x1b[36m',
  white:    '\x1b[37m',
  magenta:  '\x1b[35m',
  blue:     '\x1b[34m',
  red:      '\x1b[31m',
  bgGreen:  '\x1b[42m',
  bgBlue:   '\x1b[44m',
  gray:     '\x1b[90m',
};

const clr = (color, text) => `${color}${text}${c.reset}`;
const bold    = (t) => clr(c.bold,    t);
const green   = (t) => clr(c.green,   t);
const yellow  = (t) => clr(c.yellow,  t);
const cyan    = (t) => clr(c.cyan,    t);
const magenta = (t) => clr(c.magenta, t);
const gray    = (t) => clr(c.gray,    t);
const red     = (t) => clr(c.red,     t);
const blue    = (t) => clr(c.blue,    t);
const dim     = (t) => clr(c.dim,     t);

// ── Highlight search term inside text ─────────────────────────────────────────
function highlight(text, term) {
  if (!term) return text;
  const re  = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, `\x1b[1m\x1b[33m$1\x1b[0m`);
}

// ── Wrap long text to terminal width ──────────────────────────────────────────
function wrap(text, width = 72, indent = '') {
  const words = text.split(' ');
  const lines = [];
  let line    = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > width) {
      if (line) lines.push(indent + line.trim());
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) lines.push(indent + line.trim());
  return lines.join('\n');
}

// ── CLI ───────────────────────────────────────────────────────────────────────
function isRunDirectly() {
  if (!process.argv[1]) return false;
  const argv1 = path.resolve(process.argv[1]).toLowerCase().replace(/\\/g, '/');
  const self  = __filename.toLowerCase().replace(/\\/g, '/');
  const base  = path.basename(argv1).replace(/\.js$/, '');
  return argv1 === self || base === 'tirmidhi';
}

if (isRunDirectly()) {

const rawArgs = process.argv.slice(2);
const flags   = rawArgs.filter(a => a.startsWith('-'));
const numArgs = rawArgs.filter(a => !a.startsWith('-'));

const wantsHelp    = flags.some(f => f === '-h' || f === '--help');
const wantsVersion = flags.some(f => f === '-v' || f === '--version');
const wantsReact   = flags.some(f => f === '--react');
const wantsRandom  = flags.some(f => f === '--random' || f === '-r');
const wantsAll     = flags.some(f => f === '--all');
const showArabic   = flags.some(f => f === '-a' || f === '--arabic');
const showBoth     = flags.some(f => f === '-b' || f === '--both');
const printArabic  = showArabic || showBoth;
const printEnglish = !showArabic || showBoth;

// Get --search value
const searchIdx = rawArgs.findIndex(a => a === '--search' || a === '-s');
const searchQuery = searchIdx !== -1 && rawArgs[searchIdx + 1] && !rawArgs[searchIdx + 1].startsWith('-')
  ? rawArgs[searchIdx + 1] : null;

// Get --chapter value
const chapterIdx = rawArgs.findIndex(a => a === '--chapter' || a === '-c');
const chapterArg = chapterIdx !== -1 && rawArgs[chapterIdx + 1] && !rawArgs[chapterIdx + 1].startsWith('-')
  ? parseInt(rawArgs[chapterIdx + 1]) : null;

const DIV  = gray('─'.repeat(60));
const DIV2 = gray('═'.repeat(60));

// ── --version ─────────────────────────────────────────────────────────────────
if (wantsVersion) {
  console.log('');
  console.log('  ' + bold(cyan('jami-al-tirmidhi')) + gray(' v' + pkg.version));
  console.log('  ' + gray('Total hadiths : ') + yellow(tirmidhiData.hadiths.length.toLocaleString()));
  console.log('  ' + gray('Total chapters: ') + yellow(tirmidhiData.chapters.length.toLocaleString()));
  console.log('  ' + gray('Author        : ') + cyan('Imam Abu Isa Muhammad al-Tirmidhi'));
  console.log('');
  process.exit(0);
}

// ── --random ──────────────────────────────────────────────────────────────────
if (wantsRandom) {
  const hadith = tirmidhiData.hadiths[Math.floor(Math.random() * tirmidhiData.hadiths.length)];
  printHadith(hadith);
  process.exit(0);
}

// ── --chapter ─────────────────────────────────────────────────────────────────
if (chapterArg !== null) {
  const hadiths = _byChapter.get(chapterArg) || [];
  const chapter = tirmidhiData.chapters.find(c => c.id === chapterArg);
  if (!hadiths.length) {
    console.log('\n' + red('  No chapter found with id ' + chapterArg) + '\n');
    process.exit(1);
  }
  console.log('');
  console.log(DIV2);
  console.log(bold(cyan('  Chapter ' + chapterArg)) + (chapter ? gray(' — ') + yellow(chapter.english) : ''));
  if (chapter?.arabic) console.log('  ' + magenta(chapter.arabic));
  console.log(gray('  ' + hadiths.length + ' hadiths'));
  console.log(DIV2);
  hadiths.forEach(h => printHadith(h));
  process.exit(0);
}

// ── --search ──────────────────────────────────────────────────────────────────
if (searchQuery !== null) {
  const start   = Date.now();
  const ql      = searchQuery.toLowerCase();
  const results = tirmidhiData.hadiths.filter(h =>
    h.english?.text?.toLowerCase().includes(ql) ||
    h.english?.narrator?.toLowerCase().includes(ql)
  );
  const elapsed = Date.now() - start;

  console.log('');
  console.log(DIV2);
  console.log(
    bold(cyan('  Search: ')) + yellow('"' + searchQuery + '"') +
    gray('  —  ') + green(results.length + ' results') +
    gray('  (' + elapsed + 'ms)')
  );
  console.log(DIV2);

  if (!results.length) {
    console.log('\n  ' + red('No hadiths found for: ') + yellow('"' + searchQuery + '"') + '\n');
    process.exit(0);
  }

  const limit   = wantsAll ? results.length : Math.min(5, results.length);
  const toShow  = results.slice(0, limit);

  toShow.forEach((hadith, i) => {
    const chapter = tirmidhiData.chapters.find(c => c.id === hadith.chapterId);
    console.log('');
    console.log(
      bold(green('  #' + (i + 1))) +
      gray('  Hadith ' + hadith.id) +
      gray('  |  Chapter: ') + cyan(hadith.chapterId) +
      (chapter ? gray(' — ') + dim(chapter.english) : '')
    );
    if (hadith.english?.narrator) {
      console.log('  ' + bold(yellow('Narrator: ')) + magenta(hadith.english.narrator));
    }
    if (hadith.english?.text) {
      const wrapped = wrap(highlight(hadith.english.text, searchQuery), 68, '  ');
      console.log('  ' + wrapped.trimStart());
    }
    console.log(DIV);
  });

  if (!wantsAll && results.length > 5) {
    console.log('');
    console.log(
      '  ' + gray('Showing ') + cyan('5') + gray(' of ') + yellow(results.length) +
      gray(' results.  ') + bold(blue('Run with --all to see all results'))
    );
    console.log('  ' + dim('tirmidhi --search "' + searchQuery + '" --all'));
    console.log('');
  } else if (wantsAll && results.length > 5) {
    console.log('');
    console.log('  ' + gray('Showing all ') + yellow(results.length) + gray(' results.'));
    console.log('');
  }

  process.exit(0);
}

// ── --react ───────────────────────────────────────────────────────────────────
if (wantsReact) {
  const cwd      = process.cwd();
  const srcDir   = path.join(cwd, 'src');
  const hooksDir = path.join(srcDir, 'hooks');

  const pkgPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.error(red('  ✗ No package.json found. Run inside your React project directory.'));
    process.exit(1);
  }
  const projectPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = { ...projectPkg.dependencies, ...projectPkg.devDependencies };
  if (!deps['react']) {
    console.error(red('  ✗ React not found in package.json. Run inside a React project.'));
    process.exit(1);
  }
  if (!fs.existsSync(srcDir)) {
    console.error(red('  ✗ No src/ directory found. Are you in the right folder?'));
    process.exit(1);
  }

  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
    console.log(green('  ✓ Created src/hooks/'));
  }

  const hookFile = path.join(hooksDir, 'useTirmidhi.js');
  const CDN      = 'https://cdn.jsdelivr.net/npm/jami-al-tirmidhi@' + pkg.version + '/chapters';

  const hookSrc = `// Auto-generated by: tirmidhi --react
// Do not edit — re-run \`tirmidhi --react\` to regenerate.
//
// Usage:
//   import { useTirmidhi } from '../hooks/useTirmidhi';
//   const tirmidhi = useTirmidhi();
//   if (!tirmidhi) return <p>Loading...</p>;
//   tirmidhi.get(23)              // hadith by ID
//   tirmidhi.search('prayer')     // search (all results)
//   tirmidhi.search('prayer', 5)  // search (limit 5)
//   tirmidhi.getRandom()          // random hadith
//   tirmidhi.getByChapter(1)      // chapter hadiths
//   tirmidhi[22]                  // index access

import { useState, useEffect } from 'react';

const CDN = '${CDN}';

let _cache   = null;
let _promise = null;
const _subs  = new Set();

function _load() {
  if (_cache)   return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = fetch(CDN + '/meta.json')
    .then(r => r.json())
    .then(meta => Promise.all(
      meta.chapters.map(c => fetch(CDN + '/' + c.id + '.json').then(r => r.json()))
    ).then(results => {
      const hadiths = results.flat();

      // Speed: build id lookup map
      const _byId = new Map();
      hadiths.forEach(h => _byId.set(h.id, h));

      _cache = Object.assign([], hadiths, {
        metadata:     meta.metadata,
        chapters:     meta.chapters,
        get:          (id) => _byId.get(id),
        getByChapter: (id) => hadiths.filter(h => h.chapterId === id),
        search:       (q, limit = 0) => {
          const ql = q.toLowerCase();
          const r  = hadiths.filter(h =>
            h.english?.text?.toLowerCase().includes(ql) ||
            h.english?.narrator?.toLowerCase().includes(ql)
          );
          return limit > 0 ? r.slice(0, limit) : r;
        },
        getRandom: () => hadiths[Math.floor(Math.random() * hadiths.length)],
      });
      _subs.forEach(fn => fn(_cache));
      _subs.clear();
      return _cache;
    }));
  return _promise;
}

_load();

export function useTirmidhi() {
  const [tirmidhi, setTirmidhi] = useState(_cache);
  useEffect(() => {
    if (_cache) { setTirmidhi(_cache); }
    else {
      _subs.add(setTirmidhi);
      return () => _subs.delete(setTirmidhi);
    }
  }, []);
  return tirmidhi;
}

export default useTirmidhi;
`;

  fs.writeFileSync(hookFile, hookSrc, 'utf8');
  console.log('');
  console.log('  ' + green('✓') + bold(' Generated: ') + cyan('src/hooks/useTirmidhi.js'));
  console.log('');
  console.log('  ' + gray('Use in any component:'));
  console.log('');
  console.log("    " + cyan("import { useTirmidhi } from '../hooks/useTirmidhi';"));
  console.log('');
  console.log('    ' + gray('function MyComponent() {'));
  console.log('      ' + gray('const tirmidhi = useTirmidhi();'));
  console.log('      ' + gray('if (!tirmidhi) return <p>Loading...</p>;'));
  console.log('      ' + gray('return <p>{tirmidhi.get(1).english.text}</p>;'));
  console.log('    ' + gray('}'));
  console.log('');
  process.exit(0);
}

// ── --help ────────────────────────────────────────────────────────────────────
if (wantsHelp || (numArgs.length === 0 && !searchQuery && !chapterArg && !wantsRandom)) {
  console.log('');
  console.log('  ' + bold(cyan('Jami al-Tirmidhi CLI')) + gray('  v' + pkg.version));
  console.log('');
  console.log('  ' + bold('Usage:'));
  console.log('    ' + cyan('tirmidhi') + yellow(' <hadithId>')                        + gray('                   Show hadith by global ID'));
  console.log('    ' + cyan('tirmidhi') + yellow(' <chapterId> <hadithId>')            + gray('       Show hadith within a chapter'));
  console.log('    ' + cyan('tirmidhi') + green(' --search') + yellow(' "<query>"')   + gray('            Search hadiths (shows top 5)'));
  console.log('    ' + cyan('tirmidhi') + green(' --search') + yellow(' "<query>"') + green(' --all') + gray('    Show all search results'));
  console.log('    ' + cyan('tirmidhi') + green(' --chapter') + yellow(' <id>')        + gray('              List all hadiths in a chapter'));
  console.log('    ' + cyan('tirmidhi') + green(' --random')                           + gray('                   Show a random hadith'));
  console.log('');
  console.log('  ' + bold('Language flags:'));
  console.log('    ' + gray('(default)') + gray('                            English only'));
  console.log('    ' + green('-a') + gray(', ') + green('--arabic')          + gray('                         Arabic only'));
  console.log('    ' + green('-b') + gray(', ') + green('--both')            + gray('                           Arabic + English'));
  console.log('');
  console.log('  ' + bold('Other flags:'));
  console.log('    ' + green('--react')  + gray('                              Generate useTirmidhi hook'));
  console.log('    ' + green('-h') + gray(', ') + green('--help')            + gray('                           Show this help'));
  console.log('    ' + green('-v') + gray(', ') + green('--version')         + gray('                        Show version and stats'));
  console.log('');
  console.log('  ' + bold('Examples:'));
  console.log('    ' + dim('tirmidhi 1'));
  console.log('    ' + dim('tirmidhi 2345 -a'));
  console.log('    ' + dim('tirmidhi 2345 -b'));
  console.log('    ' + dim('tirmidhi 23 34'));
  console.log('    ' + dim('tirmidhi --search "prayer"'));
  console.log('    ' + dim('tirmidhi --search "fasting" --all'));
  console.log('    ' + dim('tirmidhi --chapter 5'));
  console.log('    ' + dim('tirmidhi --random'));
  console.log('    ' + dim('tirmidhi --random -b'));
  console.log('    ' + dim('tirmidhi --react'));
  console.log('');
  process.exit(0);
}

// ── Print a single hadith ─────────────────────────────────────────────────────
function printHadith(hadith) {
  if (!hadith) {
    console.log('\n  ' + red('Hadith not found.') + '\n');
    process.exit(1);
  }
  const chapter = tirmidhiData.chapters.find(c => c.id === hadith.chapterId);

  console.log('');
  console.log(DIV2);

  // Header
  const headerEn = bold(cyan('Hadith #' + hadith.id)) +
    gray('  |  Chapter: ') + cyan(hadith.chapterId) +
    (chapter?.english ? gray(' — ') + yellow(chapter.english) : '');
  const headerAr = bold(magenta('حديث #' + hadith.id)) +
    gray('  |  باب: ') + magenta(hadith.chapterId) +
    (chapter?.arabic ? gray(' — ') + magenta(chapter.arabic) : '');

  if (printArabic && !printEnglish) {
    console.log('  ' + headerAr);
  } else {
    console.log('  ' + headerEn);
  }

  console.log(DIV2);

  // English block
  if (printEnglish) {
    if (hadith.english?.narrator) {
      console.log('  ' + bold(yellow('Narrator: ')) + magenta(hadith.english.narrator));
    }
    if (hadith.english?.text) {
      console.log('');
      console.log(wrap(hadith.english.text, 68, '  '));
    }
  }

  // Arabic block
  if (printArabic) {
    if (printEnglish) console.log('\n' + DIV);
    if (hadith.arabic) {
      console.log('');
      console.log('  ' + magenta(hadith.arabic));
    }
  }

  console.log('');
  console.log(DIV2);
  console.log('');
}

// ── Resolve hadith by ID or chapter/position ──────────────────────────────────
function resolveHadith() {
  if (numArgs.length === 1) {
    const id = parseInt(numArgs[0]);
    if (isNaN(id)) return null;
    return _byId.get(id) || null;          // O(1) map lookup
  }
  if (numArgs.length === 2) {
    const chapterId = parseInt(numArgs[0]);
    const hadithNum = parseInt(numArgs[1]);
    if (isNaN(chapterId) || isNaN(hadithNum)) return null;
    const inChapter = _byChapter.get(chapterId);
    if (!inChapter?.length) {
      console.log('\n  ' + red('No chapter found with id ' + chapterId + '.') + '\n');
      process.exit(1);
    }
    return inChapter.find(h => h.id === hadithNum) ?? inChapter[hadithNum - 1] ?? null;
  }
  return null;
}

if (numArgs.length > 0) {
  const hadith = resolveHadith();
  if (!hadith) {
    console.log('\n  ' + red('Invalid arguments.') + ' Run ' + cyan('tirmidhi --help') + ' for usage.\n');
    process.exit(1);
  }
  printHadith(hadith);
}

}
