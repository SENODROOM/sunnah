#!/usr/bin/env node

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import os from "os";
import { execSync, spawnSync, spawn } from "child_process";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
);

// ── Windows compatibility ─────────────────────────────────────────────────────
const isWin = process.platform === "win32";

// ── Safe npm runner — zero warnings on all platforms ─────────────────────────
// DEP0190 fires when shell:true is combined with a separate args array because
// Node concatenates them unsafely.  EINVAL fires on Windows when you try to
// spawn npm.cmd without a shell.
//
// Solution: on Windows pass a single pre-joined command string to shell:true
// (no array = no concatenation = no DEP0190).  On Unix use an args array with
// no shell at all.  pkgName values come from our own PACKAGES constant so
// there is no injection risk.
function npmSync(args, opts = {}) {
  if (isWin) {
    // Single string → cmd.exe handles it; no args array → no DEP0190
    const result = spawnSync("npm " + args.join(" "), [], {
      encoding: "utf8",
      timeout: opts.timeout ?? 15000,
      stdio: opts.stdio ?? ["ignore", "pipe", "pipe"],
      shell: true,
    });
    if (result.error) throw result.error;
    return result.stdout ?? "";
  } else {
    const result = spawnSync("npm", args, {
      encoding: "utf8",
      timeout: opts.timeout ?? 15000,
      stdio: opts.stdio ?? ["ignore", "pipe", "pipe"],
    });
    if (result.error) throw result.error;
    return result.stdout ?? "";
  }
}

// ── Persistence: remember last selections ────────────────────────────────────
const STATE_FILE = path.join(os.homedir(), ".sunnah-state.json");

function loadPersistedState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function savePersistedState(data) {
  try {
    const existing = loadPersistedState();
    fs.writeFileSync(
      STATE_FILE,
      JSON.stringify({ ...existing, ...data }, null, 2),
    );
  } catch {}
}

// ── Colors ────────────────────────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
  white: "\x1b[97m",
};

const clr = (color, text) => `${color}${text}${c.reset}`;
const bold = (t) => clr(c.bold, t);
const green = (t) => clr(c.green, t);
const yellow = (t) => clr(c.yellow, t);
const cyan = (t) => clr(c.cyan, t);
const magenta = (t) => clr(c.magenta, t);
const gray = (t) => clr(c.gray, t);
const red = (t) => clr(c.red, t);
const dim = (t) => clr(c.dim, t);
const white = (t) => clr(c.white, t);
const blue = (t) => clr(c.blue, t);

// ── Available packages ────────────────────────────────────────────────────────
const PACKAGES = [
  {
    name: "sahih-al-bukhari",
    label: "Sahih al-Bukhari",
    author: "Imam Muhammad ibn Ismail al-Bukhari",
    desc: "The most authentic collection of hadith, widely regarded as the most sahih after the Quran.",
    hadiths: "7,563",
    cmd: "bukhari",
    hook: "useBukhari",
  },
  {
    name: "sahih-muslim",
    label: "Sahih Muslim",
    author: "Imam Muslim ibn al-Hajjaj",
    desc: "Second most authentic hadith collection, known for its strict methodology and chain verification.",
    hadiths: "7,470",
    cmd: "muslim",
    hook: "useMuslim",
  },
  {
    name: "sunan-abi-dawud",
    label: "Sunan Abi Dawud",
    author: "Imam Abu Dawud Sulayman ibn al-Ash'ath",
    desc: "One of the six canonical hadith collections, focused on legal rulings and jurisprudence.",
    hadiths: "5,274",
    cmd: "dawud",
    hook: "useDawud",
  },
  {
    name: "jami-al-tirmidhi",
    label: "Jami al-Tirmidhi",
    author: "Imam Abu Isa Muhammad al-Tirmidhi",
    desc: "Part of the six major hadith collections, unique for grading each hadith's authenticity.",
    hadiths: "3,956",
    cmd: "tirmidhi",
    hook: "useTirmidhi",
  },
];

// cmd → package lookup
const CMD_MAP = Object.fromEntries(PACKAGES.map((p) => [p.cmd, p]));

// ── Terminal: alternate screen buffer = no scroll ─────────────────────────────
const W = () => process.stdout.columns || 80;
const H = () => process.stdout.rows || 24;

function enterAltScreen() {
  process.stdout.write("\x1b[?1049h");
}
function leaveAltScreen() {
  process.stdout.write("\x1b[?1049l");
}
function clearScreen() {
  process.stdout.write("\x1b[2J\x1b[H");
}
function moveTo(r, col) {
  process.stdout.write(`\x1b[${r};${col}H`);
}
function hideCursor() {
  process.stdout.write("\x1b[?25l");
}
function showCursor() {
  process.stdout.write("\x1b[?25h");
}
function clearToEOL() {
  process.stdout.write("\x1b[K");
}

function writeLine(row, text) {
  moveTo(row, 1);
  clearToEOL();
  process.stdout.write(text);
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function drawBar(label, percent, barWidth = 40) {
  const filled = Math.round((percent / 100) * barWidth);
  const empty = barWidth - filled;
  const bar =
    c.green + "█".repeat(filled) + c.gray + "░".repeat(empty) + c.reset;
  const pct = cyan(String(Math.round(percent)).padStart(3) + "%");
  return `  ${bar} ${pct}  ${dim(label)}`;
}

// ── Animate install with real npm running behind ──────────────────────────────
function animateInstall(pkgName) {
  return new Promise((resolve) => {
    const stages = [
      { label: "Resolving packages…", end: 12, ms: 80 },
      { label: "Fetching metadata…", end: 30, ms: 60 },
      { label: "Downloading tarball…", end: 75, ms: 22 },
      { label: "Extracting files…", end: 90, ms: 50 },
      { label: "Linking binaries…", end: 98, ms: 80 },
    ];
    let percent = 0;
    let stageIdx = 0;
    let npmDone = false;

    process.stdout.write(drawBar(stages[0].label, 0));

    const tick = () => {
      const stage = stages[stageIdx];
      if (!stage) return;
      const prevEnd = stageIdx > 0 ? stages[stageIdx - 1].end : 0;
      const step = (stage.end - prevEnd) / 24;
      percent = Math.min(percent + step, stage.end);
      process.stdout.write("\r\x1b[K" + drawBar(stage.label, percent));
      if (percent >= stage.end) {
        stageIdx++;
        if (stageIdx >= stages.length) {
          const poll = setInterval(() => {
            if (npmDone) {
              clearInterval(poll);
              process.stdout.write(
                "\r\x1b[K" + drawBar("Complete!", 100) + "\n",
              );
              resolve();
            }
          }, 80);
          return;
        }
      }
      setTimeout(tick, stages[stageIdx]?.ms ?? 50);
    };

    setTimeout(tick, stages[0].ms);
    // Windows: shell:true required for npm.cmd, but passing an args array alongside
    //   shell:true triggers DEP0190. Fix: pass a single pre-joined string so Node
    //   hands it to cmd.exe as-is — no concatenation, no warning, no EINVAL.
    // Unix: spawn directly without shell — clean and safe.
    const proc = isWin
      ? spawn("npm install -g " + pkgName, [], {
          stdio: ["ignore", "pipe", "pipe"],
          shell: true,
        })
      : spawn("npm", ["install", "-g", pkgName], {
          stdio: ["ignore", "pipe", "pipe"],
        });
    proc.on("error", () => {
      npmDone = true;
    });
    proc.on("close", () => {
      npmDone = true;
    });
  });
}

// ── Installed cache — ONE npm call at startup, Map lookup during render ───────
function buildInstalledCache() {
  const cache = new Map();
  let out = "";
  try {
    out = npmSync(["list", "-g", "--depth=0"], { timeout: 10000 });
  } catch (e) {
    out = e.stdout || "";
  }
  for (const p of PACKAGES) {
    cache.set(p.name, out.includes(p.name));
  }
  return cache;
}

function getLatestVersion(name) {
  try {
    return npmSync(["show", name, "version"], { timeout: 8000 }).trim();
  } catch {
    return null;
  }
}

function getInstalledVersion(name) {
  try {
    const out = npmSync(["list", "-g", name, "--depth=0"], { timeout: 8000 });
    const match = out.match(new RegExp(name + "@([\\d.]+)"));
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

let installedCache = new Map();
const isInstalled = (name) => installedCache.get(name) ?? false;

// ── Update cache — fetched async so UI stays responsive ───────────────────────
// Map<pkgName, { current: string|null, latest: string|null, hasUpdate: boolean }>
let updateCache = new Map();
let updateCacheReady = false;

async function prefetchUpdateCache() {
  const installed = PACKAGES.filter((p) => isInstalled(p.name));
  await Promise.all(
    installed.map(async (p) => {
      const current = getInstalledVersion(p.name);
      const latest = getLatestVersion(p.name);
      updateCache.set(p.name, {
        current,
        latest,
        hasUpdate: !!(current && latest && current !== latest),
      });
    }),
  );
  updateCacheReady = true;
}

// ── Clipboard ─────────────────────────────────────────────────────────────────
function copyToClipboard(text) {
  try {
    if (isWin) {
      execSync("clip", { input: text, shell: true });
    } else if (process.platform === "darwin") {
      execSync("pbcopy", { input: text });
    } else {
      execSync("xclip -selection clipboard || xsel --clipboard --input", {
        input: text,
        shell: true,
      });
    }
    return true;
  } catch {
    return false;
  }
}

// ── React hook generator ──────────────────────────────────────────────────────
function generateUnifiedHook(books) {
  const cwd = process.cwd();
  const srcDir = path.join(cwd, "src");
  const hooksDir = path.join(srcDir, "hooks");

  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) {
    console.error(
      red("\n  ✗ No package.json found. Run inside your React project.\n"),
    );
    process.exit(1);
  }
  const projectPkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const deps = { ...projectPkg.dependencies, ...projectPkg.devDependencies };
  if (!deps["react"]) {
    console.error(red("\n  ✗ React not found in package.json.\n"));
    process.exit(1);
  }
  if (!fs.existsSync(srcDir)) {
    console.error(red("\n  ✗ No src/ directory found.\n"));
    process.exit(1);
  }
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
    console.log(green("  ✓ Created src/hooks/"));
  }

  // Build per-book loader blocks
  const loaderBlocks = books
    .map((p) => {
      const CDN = `https://cdn.jsdelivr.net/npm/${p.name}@latest/chapters`;
      return `
// ── ${p.label} ──
const _${p.cmd}CDN   = '${CDN}';
let   _${p.cmd}Cache = null;
let   _${p.cmd}Prom  = null;
const _${p.cmd}Subs  = new Set();

function _load${p.hook.replace("use", "")}() {
  if (_${p.cmd}Cache) return Promise.resolve(_${p.cmd}Cache);
  if (_${p.cmd}Prom)  return _${p.cmd}Prom;
  _${p.cmd}Prom = fetch(_${p.cmd}CDN + '/meta.json')
    .then(r => r.json())
    .then(meta => Promise.all(
      meta.chapters.map(c => fetch(_${p.cmd}CDN + '/' + c.id + '.json').then(r => r.json()))
    ).then(results => {
      const hadiths = results.flat();
      const _byId   = new Map();
      hadiths.forEach(h => _byId.set(h.id, h));
      _${p.cmd}Cache = Object.assign([], hadiths, {
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
      _${p.cmd}Subs.forEach(fn => fn(_${p.cmd}Cache));
      _${p.cmd}Subs.clear();
      return _${p.cmd}Cache;
    }));
  return _${p.cmd}Prom;
}
_load${p.hook.replace("use", "")}();

export function ${p.hook}() {
  const [data, setData] = useState(_${p.cmd}Cache);
  useEffect(() => {
    if (_${p.cmd}Cache) { setData(_${p.cmd}Cache); }
    else { _${p.cmd}Subs.add(setData); return () => _${p.cmd}Subs.delete(setData); }
  }, []);
  return data;
}`;
    })
    .join("\n");

  const hookNames = books.map((p) => p.hook).join(", ");

  const hookSrc = `// Auto-generated by: sunnah --react
// Re-run to regenerate after installing more sunnah packages.
//
// Included books: ${books.map((p) => p.label).join(", ")}
//
// Usage:
${books.map((p) => `//   import { ${p.hook} } from '../hooks/useSunnah';`).join("\n")}
//
//   const bukhari = useBukhari();
//   if (!bukhari) return <p>Loading...</p>;
//   bukhari.get(1)              // hadith by ID
//   bukhari.search('prayer', 5) // top 5 results
//   bukhari.getRandom()         // random hadith
//   bukhari.getByChapter(1)     // all hadiths in chapter

import { useState, useEffect } from 'react';
${loaderBlocks}

// Unified hook — loads all books in parallel
export function useSunnah() {
  const hooks = [${books.map((p) => `${p.hook}()`).join(", ")}];
  if (hooks.some(h => !h)) return null;
  return { ${books.map((p) => p.cmd + ": hooks[" + books.indexOf(p) + "]").join(", ")} };
}

export default useSunnah;
`;

  const hookFile = path.join(hooksDir, "useSunnah.js");
  fs.writeFileSync(hookFile, hookSrc, "utf8");

  const div = gray("─".repeat(60));
  console.log("\n" + div);
  console.log(bold(cyan("  ✓ Generated: src/hooks/useSunnah.js")));
  console.log(div);
  console.log("\n  " + gray("Included books:"));
  books.forEach((p) =>
    console.log(
      "  " + green("▸") + " " + bold(p.label) + gray("  " + p.hook + "()"),
    ),
  );
  console.log("\n  " + gray("Usage:"));
  console.log(
    "    " +
      cyan("import { useSunnah") +
      (books.length > 1
        ? ", " +
          books
            .slice(0, 2)
            .map((p) => p.hook)
            .join(", ")
        : "") +
      cyan(" } from '../hooks/useSunnah';"),
  );
  console.log("");
  console.log("    " + gray("// Unified — all books at once"));
  console.log("    " + gray("const sunnah = useSunnah();"));
  console.log("    " + gray("if (!sunnah) return <p>Loading...</p>;"));
  if (books[0])
    console.log("    " + gray(`sunnah.${books[0].cmd}.getRandom()`));
  console.log("");
  console.log("    " + gray("// Per-book hooks still work"));
  if (books[0]) {
    console.log("    " + gray(`const ${books[0].cmd} = ${books[0].hook}();`));
    console.log("    " + gray(`${books[0].cmd}.get(1).english.text`));
  }
  console.log("\n" + div + "\n");
}

// ── Personalized suggestions based on what's installed ───────────────────────
function getPersonalizedSuggestions() {
  const installed = PACKAGES.filter((p) => isInstalled(p.name));
  const missing = PACKAGES.filter((p) => !isInstalled(p.name));
  const tips = [];

  if (installed.length === 0) {
    tips.push(
      cyan("  ▸") +
        " Run " +
        bold("sunnah") +
        " to open the interactive installer",
    );
    tips.push(
      cyan("  ▸") + " Or install directly: " + bold("sunnah install bukhari"),
    );
  } else {
    installed.forEach((p) => {
      tips.push(
        cyan("  ▸") +
          " " +
          bold(p.cmd + " --random") +
          gray("  — read a random " + p.label + " hadith"),
      );
      tips.push(
        cyan("  ▸") +
          " " +
          bold(p.cmd + ' --search "prayer"') +
          gray("  — search " + p.label),
      );
    });
    if (installed.length > 1) {
      tips.push(
        cyan("  ▸") +
          " " +
          bold("sunnah --react") +
          gray("  — generate useSunnah() hook for all installed books"),
      );
    } else if (installed.length === 1) {
      tips.push(
        cyan("  ▸") +
          " " +
          bold("sunnah --react " + installed[0].cmd) +
          gray("  — generate React hook for " + installed[0].label),
      );
    }
    if (missing.length > 0) {
      tips.push(
        cyan("  ▸") +
          " " +
          bold("sunnah") +
          gray(
            "  — install more books (" +
              missing.map((p) => p.label).join(", ") +
              ")",
          ),
      );
    }
    tips.push(
      cyan("  ▸") +
        " " +
        bold("sunnah --update") +
        gray("  — check for updates"),
    );
  }

  return tips;
}

// ── Modes ─────────────────────────────────────────────────────────────────────
const MODE = {
  LIST: "list",
  CONFIRM_UNINSTALL: "confirm_uninstall",
  UPDATE: "update",
};

// ── Interactive render ────────────────────────────────────────────────────────
function render(state) {
  const { cursor, selected, mode, confirmTarget, statusMsg } = state;
  const divW = Math.min(W() - 2, 72);
  const div = gray("─".repeat(divW));
  const div2 = gray("═".repeat(divW));

  clearScreen();
  let row = 1;

  writeLine(row++, div2);
  writeLine(
    row++,
    bold(cyan("  📚 Sunnah Package Manager")) + gray("  v" + pkg.version),
  );
  writeLine(
    row++,
    gray("  ↑↓") +
      " nav  " +
      gray("space") +
      " select  " +
      gray("a") +
      " all  " +
      gray("i") +
      " info  " +
      gray("u") +
      " uninstall  " +
      gray("U") +
      " update  " +
      gray("enter") +
      " install  " +
      gray("q") +
      " quit",
  );
  writeLine(row++, div2);
  row++;

  PACKAGES.forEach((p, i) => {
    const isCursor = i === cursor;
    const isSel = selected.has(i);
    const inst = isInstalled(p.name);

    const checkbox = isSel ? green("[✓]") : gray("[ ]");
    const arrow = isCursor ? cyan("▶") : " ";
    const label = isCursor
      ? bold(white(p.label))
      : isSel
        ? green(p.label)
        : white(p.label);
    const badge = inst
      ? dim(green("  ● installed")) +
        (updateCache.get(p.name)?.hasUpdate
          ? " " + yellow("↑ update available")
          : updateCacheReady && inst
            ? " " + dim(gray("(up to date)"))
            : "")
      : dim(gray("  ○ not installed"));

    writeLine(row++, `  ${arrow} ${checkbox}  ${label}${badge}`);

    if (isCursor) {
      writeLine(row++, `         ${dim(p.author)}`);
      writeLine(row++, `         ${gray(p.desc)}`);
      const uc = updateCache.get(p.name);
      const verStr = inst
        ? uc
          ? uc.hasUpdate
            ? gray("  v") + yellow(uc.current) + gray(" → ") + green(uc.latest)
            : gray("  v") + cyan(uc.current || "?")
          : gray("  (checking…)")
        : "";
      writeLine(
        row++,
        `         ${gray("Hadiths: ")}${yellow(p.hadiths)}` +
          `   ${gray("CLI: ")}${cyan(p.cmd + " --help")}` +
          verStr +
          (inst ? `   ${gray("try: ")}${cyan(p.cmd + " --random")}` : ""),
      );
      row++;
    }
  });

  row++;
  writeLine(row++, div);

  if (statusMsg) {
    writeLine(row++, `  ${yellow("⚠")}  ${yellow(statusMsg)}`);
  } else if (selected.size > 0) {
    const names = [...selected].map((i) => cyan(PACKAGES[i].name)).join(", ");
    writeLine(
      row++,
      `  ${green("●")} ${bold(String(selected.size))} selected: ${names}`,
    );
    writeLine(row++, `  ${dim("enter = install   u = uninstall   i = info")}`);
  } else {
    writeLine(
      row++,
      `  ${gray("Nothing selected — press space to select, enter to install focused")}`,
    );
  }

  writeLine(row++, div);

  if (mode === MODE.CONFIRM_UNINSTALL && confirmTarget !== null) {
    const p = PACKAGES[confirmTarget];
    row++;
    writeLine(
      row++,
      `  ${red("⚠  Uninstall ")}${bold(white(p.label))}${red("?")}`,
    );
    writeLine(
      row++,
      `  ${green("y")} ${gray("confirm")}   ${red("n")} ${gray("cancel")}`,
    );
  }
}

// ── --list ────────────────────────────────────────────────────────────────────
function cmdList() {
  installedCache = buildInstalledCache();
  const div = gray("─".repeat(60));
  console.log("\n" + div);
  console.log(bold(cyan("  Available Sunnah Packages")));
  console.log(div);
  PACKAGES.forEach((p) => {
    const inst = isInstalled(p.name);
    const badge = inst ? green("  ✓ installed") : red("  ✗ not installed");
    let versionStr = "";
    if (inst) {
      const current = getInstalledVersion(p.name);
      const latest = getLatestVersion(p.name);
      if (current && latest) {
        versionStr =
          current === latest
            ? dim(gray("  v" + current + " (up to date)"))
            : yellow("  v" + current) +
              gray(" → ") +
              green("v" + latest) +
              yellow(" ↑ update available");
      } else if (current) {
        versionStr = dim(gray("  v" + current));
      }
    }
    console.log(`\n  ${bold(white(p.label))}${badge}${versionStr}`);
    console.log(`  ${cyan("npm install -g " + p.name)}`);
    console.log(`  ${dim(p.desc)}`);
    console.log(
      `  ${gray("Hadiths: ")}${yellow(p.hadiths)}   ${gray("Author: ")}${magenta(p.author)}`,
    );
    if (inst) {
      console.log(
        `  ${gray("CLI: ")}${cyan(p.cmd + " --help")}   ${gray("React: ")}${cyan("sunnah --react " + p.cmd)}`,
      );
    }
  });
  console.log("\n" + div + "\n");
}

// ── --update ──────────────────────────────────────────────────────────────────
async function cmdUpdate(autoInstall = false) {
  installedCache = buildInstalledCache();
  const installed = PACKAGES.filter((p) => isInstalled(p.name));
  if (!installed.length) {
    console.log(
      "\n  " +
        yellow("No sunnah packages installed. Run ") +
        bold("sunnah") +
        yellow(" to install.\n"),
    );
    return;
  }
  const div = gray("─".repeat(60));
  const div2 = gray("═".repeat(60));
  console.log("\n" + div2);
  console.log(bold(cyan("  Checking for updates…")));
  console.log(div2 + "\n");

  const updates = [];
  for (const p of installed) {
    process.stdout.write(
      "  " + gray("Checking ") + white(p.label) + gray("…\r"),
    );
    const current = getInstalledVersion(p.name);
    const latest = getLatestVersion(p.name);
    process.stdout.write("\x1b[K");
    if (!current || !latest) {
      console.log(
        `  ${yellow("?")} ${bold(p.label)}  ${gray("(could not check)")}`,
      );
      continue;
    }
    if (current === latest) {
      console.log(
        `  ${green("✓")} ${bold(p.label)}  ${gray("v" + current + " — up to date")}`,
      );
    } else {
      updates.push({ p, current, latest });
      console.log(
        `  ${yellow("↑")} ${bold(p.label)}  ${gray("v" + current)} ${gray("→")} ${green("v" + latest)}  ${yellow("(update available)")}`,
      );
    }
  }

  console.log("\n" + div);

  if (!updates.length) {
    console.log("  " + green("✓ All packages are up to date."));
    console.log(div + "\n");
    return;
  }

  console.log(
    "  " +
      yellow(String(updates.length)) +
      " update" +
      (updates.length > 1 ? "s" : "") +
      " available.",
  );

  if (autoInstall) {
    console.log(bold(cyan("\n  Installing updates…")));
    console.log(div + "\n");
    for (let i = 0; i < updates.length; i++) {
      const { p, current, latest } = updates[i];
      console.log(
        "  " +
          cyan("[" + (i + 1) + "/" + updates.length + "]") +
          "  " +
          bold(white(p.label)) +
          gray("  v" + current + " → v" + latest) +
          "\n",
      );
      await animateInstall(p.name);
      console.log(
        "  " +
          green("✓") +
          " " +
          bold(green(p.label)) +
          gray(" updated to v" + latest),
      );
    }
    console.log("\n" + div2);
    console.log("  " + green("✓ All updates installed."));
    console.log(div2 + "\n");
  } else {
    console.log(
      "  Run " +
        bold(cyan("sunnah --update --install")) +
        gray(" to install all updates automatically."),
    );
    console.log("  Or update individually:");
    updates.forEach(({ p }) =>
      console.log("    " + dim("sunnah install " + p.cmd)),
    );
    console.log(div + "\n");
  }
}

// ── sunnah install <cmd> ──────────────────────────────────────────────────────
async function cmdInstall(targets) {
  if (!targets.length) {
    console.error(
      red(
        "\n  ✗ Usage: sunnah install <name>  (e.g. sunnah install bukhari)\n",
      ),
    );
    console.log(
      "  Available: " + PACKAGES.map((p) => cyan(p.cmd)).join(", ") + "\n",
    );
    process.exit(1);
  }

  // Resolve names — accept cmd alias or full npm name
  const toInstall = [];
  for (const t of targets) {
    const byCmd = CMD_MAP[t.toLowerCase()];
    const byName = PACKAGES.find((p) => p.name === t);
    const found = byCmd || byName;
    if (!found) {
      console.log(yellow(`\n  ⚠  Unknown package: "${t}"`));
      console.log(
        "  Available: " +
          PACKAGES.map((p) => cyan(p.cmd) + gray(" (" + p.name + ")")).join(
            ", ",
          ),
      );
      process.exit(1);
    }
    toInstall.push(found);
  }

  const divW = Math.min(W() - 2, 72);
  const div2 = gray("═".repeat(divW));

  console.log("\n" + div2);
  console.log(
    bold(cyan("  Installing ")) +
      bold(yellow(String(toInstall.length))) +
      bold(cyan(" package" + (toInstall.length > 1 ? "s" : "") + "…")),
  );
  console.log(div2);

  for (let i = 0; i < toInstall.length; i++) {
    const p = toInstall[i];
    console.log(
      "\n  " +
        cyan("[" + (i + 1) + "/" + toInstall.length + "]") +
        "  " +
        bold(white(p.label)),
    );
    console.log("  " + dim("npm install -g " + p.name) + "\n");
    await animateInstall(p.name);
    installedCache.set(p.name, true);
    console.log("  " + green("✓") + " " + bold(green(p.label)) + " installed");
    console.log("  " + gray("Usage: ") + cyan(p.cmd + " --help"));
  }

  console.log("\n" + div2);
  console.log(
    "  " +
      green("✓ Done! ") +
      toInstall.map((p) => bold(cyan(p.cmd))).join(", ") +
      gray(" ready."),
  );
  console.log(div2 + "\n");
}

// ── sunnah uninstall <cmd> ────────────────────────────────────────────────────
function cmdUninstall(targets) {
  if (!targets.length) {
    console.error(
      red(
        "\n  ✗ Usage: sunnah uninstall <name>  (e.g. sunnah uninstall bukhari)\n",
      ),
    );
    process.exit(1);
  }

  installedCache = buildInstalledCache();
  const divW = Math.min(W() - 2, 72);
  const div2 = gray("═".repeat(divW));

  console.log("\n" + div2);

  for (const t of targets) {
    const p =
      CMD_MAP[t.toLowerCase()] || PACKAGES.find((pkg) => pkg.name === t);
    if (!p) {
      console.log(yellow(`  ⚠  Unknown: "${t}"`) + "\n");
      continue;
    }
    if (!isInstalled(p.name)) {
      console.log(gray(`  ○  ${p.label} is not installed, skipping.`));
      continue;
    }
    console.log(yellow("  Uninstalling ") + bold(white(p.label)) + yellow("…"));
    try {
      npmSync(["uninstall", "-g", p.name], { stdio: "inherit" });
      installedCache.set(p.name, false);
      console.log(
        green("  ✓ ") + bold(green(p.label)) + green(" uninstalled.\n"),
      );
    } catch {
      console.log(red("  ✗ Failed to uninstall " + p.label + "\n"));
    }
  }

  console.log(div2 + "\n");
}

// ── --version (personalized) ──────────────────────────────────────────────────
function cmdVersion() {
  installedCache = buildInstalledCache();
  const installed = PACKAGES.filter((p) => isInstalled(p.name));
  const div = gray("─".repeat(60));

  console.log("\n" + div);
  console.log(bold(cyan("  📿 sunnah")) + gray("  v" + pkg.version));
  console.log(div);
  console.log(
    "  " + gray("Available packages : ") + yellow(String(PACKAGES.length)),
  );
  console.log(
    "  " +
      gray("Installed          : ") +
      green(String(installed.length)) +
      gray(" / " + PACKAGES.length),
  );

  if (installed.length > 0) {
    console.log(
      "  " +
        gray("Your collection    : ") +
        installed.map((p) => cyan(p.label)).join(gray(", ")),
    );
    const totalHadiths = installed.reduce(
      (acc, p) => acc + parseInt(p.hadiths.replace(/,/g, "")),
      0,
    );
    console.log(
      "  " +
        gray("Total hadiths      : ") +
        bold(yellow(totalHadiths.toLocaleString())),
    );
  }

  console.log("\n" + div + "\n");
}

// ── --help (personalized) ─────────────────────────────────────────────────────
function cmdHelp() {
  installedCache = buildInstalledCache();
  const div = gray("─".repeat(60));

  console.log("\n" + div);
  console.log(
    bold(cyan("  📿 Sunnah Package Manager")) + gray("  v" + pkg.version),
  );
  console.log(div);

  console.log("\n  " + bold("Commands:"));
  console.log(
    "    " +
      cyan("sunnah") +
      gray("                     Open interactive installer UI"),
  );
  console.log(
    "    " +
      cyan("sunnah install") +
      yellow(" <name>") +
      gray("     Install a package directly"),
  );
  console.log(
    "    " +
      cyan("sunnah uninstall") +
      yellow(" <name>") +
      gray("   Uninstall a package"),
  );
  console.log(
    "    " +
      cyan("sunnah --react") +
      gray("              Generate unified useSunnah() React hook"),
  );
  console.log(
    "    " +
      cyan("sunnah --react") +
      yellow(" <books>") +
      gray("   Generate hook for specific books"),
  );
  console.log(
    "    " +
      cyan("sunnah --list") +
      gray("               List all packages with install status"),
  );
  console.log(
    "    " +
      cyan("sunnah --update") +
      gray("             Check installed packages for updates"),
  );
  console.log(
    "    " +
      cyan("sunnah --update --install") +
      gray("    Auto-install all available updates"),
  );
  console.log(
    "    " +
      cyan("sunnah -v") +
      gray("                   Version + your collection stats"),
  );
  console.log(
    "    " +
      cyan("sunnah -h") +
      gray("                   This help + personalized tips"),
  );

  console.log("\n  " + bold("Package names (use any form):"));
  PACKAGES.forEach((p) => {
    console.log(
      "    " +
        cyan(p.cmd.padEnd(12)) +
        gray(p.name.padEnd(24)) +
        yellow(p.hadiths + " hadiths"),
    );
  });

  console.log("\n  " + bold("Examples:"));
  console.log("    " + dim("sunnah install bukhari"));
  console.log("    " + dim("sunnah install bukhari muslim tirmidhi"));
  console.log("    " + dim("sunnah uninstall dawud"));
  console.log("    " + dim("sunnah --react"));
  console.log("    " + dim("sunnah --react bukhari muslim"));
  console.log("    " + dim("sunnah --update"));

  console.log("\n  " + bold("Interactive UI controls:"));
  console.log("    " + green("↑ ↓") + gray("      Navigate packages"));
  console.log("    " + green("space") + gray("    Toggle select"));
  console.log("    " + green("a") + gray("        Select all / deselect all"));
  console.log(
    "    " + green("i") + gray("        Show info + installed version"),
  );
  console.log("    " + green("u") + gray("        Uninstall selected"));
  console.log(
    "    " +
      green("U") +
      gray("        Update selected (if newer version available)"),
  );
  console.log(
    "    " +
      green("enter") +
      gray("    Install selected (or focused if none selected)"),
  );
  console.log("    " + green("q") + gray("        Quit"));

  // Personalized tips
  const tips = getPersonalizedSuggestions();
  if (tips.length) {
    console.log("\n" + div);
    console.log(bold("  💡 Suggested for you:"));
    tips.forEach((t) => console.log(t));
  }

  console.log("\n" + div + "\n");
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const rawArgs = process.argv.slice(2);
  const flags = rawArgs.filter((a) => a.startsWith("-"));
  const positional = rawArgs.filter((a) => !a.startsWith("-"));

  // sunnah -v / --version
  if (flags.some((f) => f === "-v" || f === "--version")) {
    cmdVersion();
    process.exit(0);
  }

  // sunnah -h / --help
  if (flags.some((f) => f === "-h" || f === "--help")) {
    cmdHelp();
    process.exit(0);
  }

  // sunnah --list / -l
  if (flags.some((f) => f === "--list" || f === "-l")) {
    cmdList();
    process.exit(0);
  }

  // sunnah --update [--install]
  if (flags.some((f) => f === "--update")) {
    const autoInstall = flags.some((f) => f === "--install");
    await cmdUpdate(autoInstall);
    process.exit(0);
  }

  // sunnah install <names...>
  if (positional[0] === "install") {
    await cmdInstall(positional.slice(1));
    process.exit(0);
  }

  // sunnah uninstall <names...>
  if (positional[0] === "uninstall") {
    cmdUninstall(positional.slice(1));
    process.exit(0);
  }

  // sunnah --react [book1 book2 ...]
  if (flags.some((f) => f === "--react")) {
    installedCache = buildInstalledCache();
    // If specific books given after --react, use those; else use all installed
    const requestedCmds = positional; // e.g. ["bukhari", "muslim"]
    let books;
    if (requestedCmds.length > 0) {
      books = requestedCmds
        .map((cmd) => CMD_MAP[cmd.toLowerCase()])
        .filter(Boolean);
      const unknown = requestedCmds.filter(
        (cmd) => !CMD_MAP[cmd.toLowerCase()],
      );
      if (unknown.length) {
        console.log(yellow("\n  ⚠  Unknown books: " + unknown.join(", ")));
        console.log("  Available: " + Object.keys(CMD_MAP).join(", ") + "\n");
      }
    } else {
      books = PACKAGES.filter((p) => isInstalled(p.name));
      if (!books.length) {
        console.log(yellow("\n  ⚠  No sunnah packages installed yet."));
        console.log(
          "  Run " +
            bold("sunnah") +
            " to install some first, or specify books explicitly:",
        );
        console.log("  " + dim("sunnah --react bukhari muslim") + "\n");
        process.exit(1);
      }
    }
    if (!books.length) {
      console.log(red("\n  ✗ No valid books specified.\n"));
      process.exit(1);
    }
    generateUnifiedHook(books);
    process.exit(0);
  }

  // ── Interactive mode ────────────────────────────────────────────────────────
  if (!process.stdin.isTTY) {
    console.error(red("\n  ✗ Interactive mode requires a TTY terminal.\n"));
    process.exit(1);
  }

  // Build cache
  process.stdout.write("\n  " + gray("Checking installed packages…"));
  installedCache = buildInstalledCache();
  process.stdout.write("\r\x1b[K");

  // Load persisted selection
  const persisted = loadPersistedState();
  const lastSelected = new Set(
    (persisted.lastSelected || []).filter((i) => i < PACKAGES.length),
  );

  enterAltScreen();
  hideCursor();

  const state = {
    cursor: 0,
    selected: lastSelected, // pre-check last session's selections
    mode: MODE.LIST,
    confirmTarget: null,
    statusMsg: "",
  };

  let statusTimer = null;

  function setStatus(msg, ms = 2500) {
    state.statusMsg = msg;
    render(state);
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      state.statusMsg = "";
      render(state);
    }, ms);
  }

  render(state);

  // Prefetch update info in background — re-render when ready so badges appear
  prefetchUpdateCache().then(() => render(state));

  const cleanup = () => {
    // Persist current selection before exiting
    savePersistedState({ lastSelected: [...state.selected] });
    showCursor();
    leaveAltScreen();
    try {
      process.stdin.setRawMode(false);
    } catch {}
    process.stdin.pause();
  };

  process.on("SIGINT", () => {
    cleanup();
    process.exit(0);
  });

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  process.stdin.on("keypress", async (str, key) => {
    if (!key) return;

    // ── Confirm uninstall mode ────────────────────────────────────────────────
    if (state.mode === MODE.CONFIRM_UNINSTALL) {
      if (str === "y" || str === "Y") {
        const p = PACKAGES[state.confirmTarget];
        state.mode = MODE.LIST;
        state.confirmTarget = null;
        cleanup();
        console.log(
          "\n  " +
            yellow("Uninstalling ") +
            bold(white(p.label)) +
            yellow("…\n"),
        );
        try {
          npmSync(["uninstall", "-g", p.name], { stdio: "inherit" });
          installedCache.set(p.name, false);
          state.selected.delete(PACKAGES.indexOf(p));
          console.log(
            "\n  " +
              green("✓ ") +
              bold(green(p.label)) +
              green(" uninstalled.\n"),
          );
        } catch {
          console.log("\n  " + red("✗ Failed to uninstall " + p.label) + "\n");
        }
        await sleep(1200);
        enterAltScreen();
        hideCursor();
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
        render(state);
      } else {
        state.mode = MODE.LIST;
        state.confirmTarget = null;
        render(state);
      }
      return;
    }

    // ── Normal mode ───────────────────────────────────────────────────────────

    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      cleanup();
      console.log("\n  " + gray("Goodbye.\n"));
      process.exit(0);
    }

    if (key.name === "up") {
      state.cursor = (state.cursor - 1 + PACKAGES.length) % PACKAGES.length;
      render(state);
      return;
    }
    if (key.name === "down") {
      state.cursor = (state.cursor + 1) % PACKAGES.length;
      render(state);
      return;
    }

    if (str === " ") {
      if (state.selected.has(state.cursor)) state.selected.delete(state.cursor);
      else state.selected.add(state.cursor);
      render(state);
      return;
    }

    if (str === "a" || str === "A") {
      if (state.selected.size === PACKAGES.length) state.selected.clear();
      else PACKAGES.forEach((_, i) => state.selected.add(i));
      render(state);
      return;
    }

    // i = info
    if (str === "i" || str === "I") {
      const p = PACKAGES[state.cursor];
      const inst = isInstalled(p.name);
      const ver = inst ? getInstalledVersion(p.name) : null;
      setStatus(
        `${p.label}  |  ${p.hadiths} hadiths  |  ${p.author}  |  ${inst ? "v" + ver + " installed  CLI: " + p.cmd + " --help" : "not installed"}`,
        4000,
      );
      return;
    }

    // u = uninstall
    if (str === "u" || str === "U") {
      const targets =
        state.selected.size > 0 ? [...state.selected] : [state.cursor];
      const toRemove = targets.filter((i) => isInstalled(PACKAGES[i].name));
      if (!toRemove.length) {
        setStatus("No installed packages selected.");
        return;
      }
      state.mode = MODE.CONFIRM_UNINSTALL;
      state.confirmTarget = toRemove[0];
      render(state);
      return;
    }

    // U = update (only packages with updates available)
    if (str === "U") {
      const targets =
        state.selected.size > 0 ? [...state.selected] : [state.cursor];
      const toUpdate = targets.filter((i) => {
        const p = PACKAGES[i];
        return isInstalled(p.name) && updateCache.get(p.name)?.hasUpdate;
      });
      if (!toUpdate.length) {
        setStatus(
          updateCacheReady
            ? "All selected packages are up to date."
            : "Update info still loading — try again shortly.",
        );
        return;
      }
      cleanup();
      const divW = Math.min(W() - 2, 72);
      const div2 = gray("═".repeat(divW));
      console.log("\n" + div2);
      console.log(
        bold(cyan("  Updating ")) +
          bold(yellow(String(toUpdate.length))) +
          bold(cyan(" package" + (toUpdate.length > 1 ? "s" : "") + "…")),
      );
      console.log(div2);
      for (let i = 0; i < toUpdate.length; i++) {
        const p = PACKAGES[toUpdate[i]];
        const uc = updateCache.get(p.name);
        console.log(
          "\n  " +
            cyan("[" + (i + 1) + "/" + toUpdate.length + "]") +
            "  " +
            bold(white(p.label)),
        );
        console.log(
          "  " + dim(gray("v" + uc.current + " → v" + uc.latest)) + "\n",
        );
        await animateInstall(p.name);
        updateCache.set(p.name, {
          current: uc.latest,
          latest: uc.latest,
          hasUpdate: false,
        });
        console.log(
          "  " +
            green("✓") +
            " " +
            bold(green(p.label)) +
            gray(" updated to v" + uc.latest),
        );
      }
      console.log("\n" + div2 + "\n");
      showCursor();
      process.exit(0);
    }

    // enter = install
    if (key.name === "return") {
      const targets =
        state.selected.size > 0
          ? [...state.selected].map((i) => PACKAGES[i])
          : [PACKAGES[state.cursor]];
      const toInstall = targets.filter((p) => !isInstalled(p.name));

      if (!toInstall.length) {
        setStatus("All selected packages are already installed.");
        return;
      }

      cleanup();
      const divW = Math.min(W() - 2, 72);
      const div = gray("─".repeat(divW));
      const div2 = gray("═".repeat(divW));

      console.log("\n" + div2);
      console.log(
        bold(cyan("  Installing ")) +
          bold(yellow(String(toInstall.length))) +
          bold(cyan(" package" + (toInstall.length > 1 ? "s" : "") + "…")),
      );
      console.log(div2);

      for (let i = 0; i < toInstall.length; i++) {
        const p = toInstall[i];
        console.log(
          "\n  " +
            cyan("[" + (i + 1) + "/" + toInstall.length + "]") +
            "  " +
            bold(white(p.label)),
        );
        console.log("  " + dim("npm install -g " + p.name) + "\n");
        await animateInstall(p.name);
        installedCache.set(p.name, true);
        console.log(
          "  " + green("✓") + " " + bold(green(p.label)) + " installed",
        );
        console.log("  " + gray("Usage: ") + cyan(p.cmd + " --help"));
      }

      console.log("\n" + div2);
      console.log(
        "  " +
          green("✓ All done! ") +
          bold(yellow(String(toInstall.length))) +
          " package" +
          (toInstall.length > 1 ? "s" : "") +
          " installed globally.",
      );
      console.log("");
      toInstall.forEach((p) =>
        console.log(
          "  " +
            cyan("▸") +
            " " +
            bold(p.cmd) +
            gray(" --help") +
            "  " +
            dim(p.label),
        ),
      );

      // Personalized next steps
      const installed = PACKAGES.filter((p) => isInstalled(p.name));
      if (installed.length > 1) {
        console.log(
          "\n  " +
            dim("Tip: run ") +
            bold("sunnah --react") +
            dim(" to generate a unified React hook for all your books"),
        );
      }

      console.log(div2 + "\n");
      showCursor();
      process.exit(0);
    }
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((err) => {
  showCursor();
  leaveAltScreen();
  console.error(red("\n  ✗ " + err.message + "\n"));
  process.exit(1);
});
