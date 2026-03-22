#!/usr/bin/env node

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import os from "os";
import { execSync, spawnSync, spawn } from "child_process";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const pkg        = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));

// ── Windows compatibility ─────────────────────────────────────────────────────
const isWin = process.platform === "win32";

function npmSync(args, opts = {}) {
  if (isWin) {
    const r = spawnSync("npm " + args.join(" "), [], {
      encoding: "utf8", timeout: opts.timeout ?? 15000,
      stdio: opts.stdio ?? ["ignore", "pipe", "pipe"], shell: true,
    });
    if (r.error) throw r.error;
    return r.stdout ?? "";
  }
  const r = spawnSync("npm", args, {
    encoding: "utf8", timeout: opts.timeout ?? 15000,
    stdio: opts.stdio ?? ["ignore", "pipe", "pipe"],
  });
  if (r.error) throw r.error;
  return r.stdout ?? "";
}

function pipSync(args, opts = {}) {
  const cmd = isWin ? "pip" : "pip3";
  if (isWin) {
    const r = spawnSync(cmd + " " + args.join(" "), [], {
      encoding: "utf8", timeout: opts.timeout ?? 15000,
      stdio: opts.stdio ?? ["ignore", "pipe", "pipe"], shell: true,
    });
    if (r.error) return ""; return r.stdout ?? "";
  }
  const r = spawnSync(cmd, args, {
    encoding: "utf8", timeout: opts.timeout ?? 15000,
    stdio: opts.stdio ?? ["ignore", "pipe", "pipe"],
  });
  if (r.error) return ""; return r.stdout ?? "";
}

// ── Tool availability checks ─────────────────────────────────────────────────
function hasNpm() {
  try {
    const r = isWin
      ? spawnSync("npm --version", [], { encoding:"utf8", timeout:4000, stdio:["ignore","pipe","pipe"], shell:true })
      : spawnSync("npm", ["--version"], { encoding:"utf8", timeout:4000, stdio:["ignore","pipe","pipe"] });
    return !r.error && r.status === 0;
  } catch { return false; }
}
function hasPip() {
  try {
    const cmd = isWin ? "pip" : "pip3";
    const r = isWin
      ? spawnSync(cmd + " --version", [], { encoding:"utf8", timeout:4000, stdio:["ignore","pipe","pipe"], shell:true })
      : spawnSync(cmd, ["--version"], { encoding:"utf8", timeout:4000, stdio:["ignore","pipe","pipe"] });
    return !r.error && r.status === 0;
  } catch { return false; }
}
let _npmAvail = null, _pipAvail = null;
const npmAvailable = () => { if (_npmAvail === null) _npmAvail = hasNpm(); return _npmAvail; };
const pipAvailable = () => { if (_pipAvail === null) _pipAvail = hasPip(); return _pipAvail; };

function warnNoNpm() {
  const div = gray("─".repeat(60));
  console.log("\n" + div);
  console.log(yellow("  ⚠  npm is not installed or not found in PATH."));
  console.log(gray("  npm packages require Node.js — install it from:"));
  console.log(cyan("  https://nodejs.org"));
  console.log(div + "\n");
}
function warnNoPip() {
  const div = gray("─".repeat(60));
  console.log("\n" + div);
  console.log(yellow("  ⚠  pip / pip3 is not installed or not found in PATH."));
  console.log(gray("  Python packages require Python — install it from:"));
  console.log(cyan("  https://python.org"));
  console.log(gray("  Then run: ") + cyan("pip install sunnah"));
  console.log(div + "\n");
}

// ── Persistence ───────────────────────────────────────────────────────────────
const STATE_FILE = path.join(os.homedir(), ".sunnah-state.json");
function loadState()  { try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); } catch { return {}; } }
function saveState(d) { try { fs.writeFileSync(STATE_FILE, JSON.stringify({ ...loadState(), ...d }, null, 2)); } catch {} }

// ── Colors ────────────────────────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m",
  magenta: "\x1b[35m", blue: "\x1b[34m", red: "\x1b[31m",
  gray: "\x1b[90m", white: "\x1b[97m",
};
const clr     = (col, t) => `${col}${t}${c.reset}`;
const bold    = t => clr(c.bold,    t);
const green   = t => clr(c.green,   t);
const yellow  = t => clr(c.yellow,  t);
const cyan    = t => clr(c.cyan,    t);
const magenta = t => clr(c.magenta, t);
const gray    = t => clr(c.gray,    t);
const red     = t => clr(c.red,     t);
const dim     = t => clr(c.dim,     t);
const white   = t => clr(c.white,   t);

// ── Package registry ──────────────────────────────────────────────────────────
const PACKAGES = [
  { name: "sahih-al-bukhari",  pip: "sahih-al-bukhari",  label: "Sahih al-Bukhari",  author: "Imam Muhammad ibn Ismail al-Bukhari",    desc: "The most authentic collection of hadith, widely regarded as the most sahih after the Quran.", hadiths: "7,563", cmd: "bukhari",  hook: "useBukhari",  pyClass: "Bukhari",  pyMod: "sahih_al_bukhari" },
  { name: "sahih-muslim",      pip: "sahih-muslim",      label: "Sahih Muslim",       author: "Imam Muslim ibn al-Hajjaj",              desc: "Second most authentic hadith collection, known for its strict methodology and chain verification.", hadiths: "7,470", cmd: "muslim",   hook: "useMuslim",   pyClass: "Muslim",   pyMod: "sahih_muslim" },
  { name: "sunan-abi-dawud",   pip: "sunan-abi-dawud",   label: "Sunan Abi Dawud",    author: "Imam Abu Dawud Sulayman ibn al-Ash'ath", desc: "One of the six canonical hadith collections, focused on legal rulings and jurisprudence.",    hadiths: "5,274", cmd: "dawud",    hook: "useDawud",    pyClass: "Dawud",    pyMod: "sunan_abi_dawud" },
  { name: "jami-al-tirmidhi",  pip: "jami-al-tirmidhi",  label: "Jami al-Tirmidhi",   author: "Imam Abu Isa Muhammad al-Tirmidhi",     desc: "Part of the six major hadith collections, unique for grading each hadith's authenticity.",    hadiths: "3,956", cmd: "tirmidhi", hook: "useTirmidhi", pyClass: "Tirmidhi", pyMod: "jami_al_tirmidhi" },
  { name: "sunan-ibn-majah",   pip: "sunan-ibn-majah",   label: "Sunan Ibn Majah",    author: "Imam Muhammad ibn Yazid Ibn Majah",     desc: "Sixth of the six major canonical hadith collections.",                                       hadiths: "4,341", cmd: "majah",    hook: "useMajah",    pyClass: "Majah",    pyMod: "sunan_ibn_majah" },
  { name: "sunan-al-nasai",    pip: "sunan-al-nasai",    label: "Sunan al-Nasa'i",    author: "Imam Ahmad ibn Shu'ayb al-Nasa'i",     desc: "Known for its strict standards in accepting transmitters.",                                  hadiths: "5,768", cmd: "nasai",    hook: "useNasai",    pyClass: "Nasai",    pyMod: "sunan_al_nasai" },
];

const CMD_MAP  = Object.fromEntries(PACKAGES.map(p => [p.cmd,  p]));
const NAME_MAP = Object.fromEntries(PACKAGES.map(p => [p.name, p]));

// ── Terminal helpers ──────────────────────────────────────────────────────────
const W = () => process.stdout.columns || 80;
const H = () => process.stdout.rows    || 24;
const enterAltScreen = () => process.stdout.write("\x1b[?1049h");
const leaveAltScreen = () => process.stdout.write("\x1b[?1049l");
const clearScreen    = () => process.stdout.write("\x1b[2J\x1b[H");
const moveTo    = (r, col) => process.stdout.write(`\x1b[${r};${col}H`);
const hideCursor = () => process.stdout.write("\x1b[?25l");
const showCursor = () => process.stdout.write("\x1b[?25h");
const clearToEOL = () => process.stdout.write("\x1b[K");
function writeLine(row, text) { moveTo(row, 1); clearToEOL(); process.stdout.write(text); }

// ── Progress bar ──────────────────────────────────────────────────────────────
function drawBar(label, percent, barWidth = 40) {
  const filled = Math.round((percent / 100) * barWidth);
  const empty  = barWidth - filled;
  const bar    = c.green + "█".repeat(filled) + c.gray + "░".repeat(empty) + c.reset;
  const pct    = cyan(String(Math.round(percent)).padStart(3) + "%");
  return `  ${bar} ${pct}  ${dim(label)}`;
}

function animateInstall(pkgName, isPip = false) {
  return new Promise(resolve => {
    const stages = [
      { label: "Resolving packages…",  end: 12, ms: 80  },
      { label: "Fetching metadata…",   end: 30, ms: 60  },
      { label: "Downloading tarball…", end: 75, ms: 22  },
      { label: "Extracting files…",    end: 90, ms: 50  },
      { label: "Linking binaries…",    end: 98, ms: 80  },
    ];
    let percent = 0, stageIdx = 0, npmDone = false;
    process.stdout.write(drawBar(stages[0].label, 0));
    const tick = () => {
      const stage = stages[stageIdx]; if (!stage) return;
      const prev = stageIdx > 0 ? stages[stageIdx - 1].end : 0;
      percent = Math.min(percent + (stage.end - prev) / 24, stage.end);
      process.stdout.write("\r\x1b[K" + drawBar(stage.label, percent));
      if (percent >= stage.end) {
        stageIdx++;
        if (stageIdx >= stages.length) {
          const poll = setInterval(() => {
            if (npmDone) { clearInterval(poll); process.stdout.write("\r\x1b[K" + drawBar("Complete!", 100) + "\n"); resolve(); }
          }, 80);
          return;
        }
      }
      setTimeout(tick, stages[stageIdx]?.ms ?? 50);
    };
    setTimeout(tick, stages[0].ms);
    let proc;
    if (isPip) {
      const pipCmd = isWin ? "pip" : "pip3";
      proc = isWin
        ? spawn(`${pipCmd} install ${pkgName}`, [], { stdio: ["ignore", "pipe", "pipe"], shell: true })
        : spawn(pipCmd, ["install", pkgName],    { stdio: ["ignore", "pipe", "pipe"] });
    } else {
      proc = isWin
        ? spawn("npm install -g " + pkgName, [], { stdio: ["ignore", "pipe", "pipe"], shell: true })
        : spawn("npm", ["install", "-g", pkgName], { stdio: ["ignore", "pipe", "pipe"] });
    }
    proc.on("error", () => { npmDone = true; });
    proc.on("close", () => { npmDone = true; });
  });
}

// ── Installed caches ──────────────────────────────────────────────────────────
function buildInstalledCache() {
  const cache = new Map();
  for (const p of PACKAGES) cache.set(p.name, false);
  if (!npmAvailable()) return cache;
  let out = "";
  try {
    out = npmSync(["list", "-g", "--depth=0", "--json"], { timeout: 6000 });
    const deps = JSON.parse(out)?.dependencies ?? {};
    for (const p of PACKAGES) cache.set(p.name, p.name in deps);
  } catch (e) {
    const text = (e && e.stdout) || out || "";
    for (const p of PACKAGES) cache.set(p.name, text.includes(p.name));
  }
  return cache;
}

function buildPipCache() {
  const cache = new Map();
  for (const p of PACKAGES) cache.set(p.pip, false);
  if (!pipAvailable()) return cache;
  try {
    const out = pipSync(["list", "--format=json"], { timeout: 8000 });
    const inst = JSON.parse(out).map(x => x.name.toLowerCase());
    for (const p of PACKAGES) cache.set(p.pip, inst.includes(p.pip.toLowerCase()));
  } catch {
    for (const p of PACKAGES) {
      try { const o = pipSync(["show", p.pip], { timeout: 4000 }); cache.set(p.pip, o.includes("Name:")); }
      catch { cache.set(p.pip, false); }
    }
  }
  return cache;
}

function getVersion(name, pip = false) {
  try {
    if (pip) {
      const o = pipSync(["show", name], { timeout: 4000 });
      const m = o.match(/^Version:\s+([\d.]+)/m);
      return m ? m[1] : null;
    }
    const o = npmSync(["list", "-g", name, "--depth=0", "--json"], { timeout: 6000 });
    return JSON.parse(o)?.dependencies?.[name]?.version ?? null;
  } catch { return null; }
}

function getLatest(name, pip = false) {
  try {
    if (pip) {
      const o = pipSync(["index", "versions", name], { timeout: 8000 });
      const m = o.match(/LATEST:\s+([\d.]+)/);
      return m ? m[1] : null;
    }
    const o = npmSync(["show", name, "version", "--json"], { timeout: 6000 });
    return JSON.parse(o.trim());
  } catch {
    try { return pip ? null : npmSync(["show", name, "version"], { timeout: 6000 }).trim(); }
    catch { return null; }
  }
}

let installedCache = new Map(), pipCache = new Map();
const isInstalled  = n => installedCache.get(n) ?? false;
const isPipInst    = n => pipCache.get(n)        ?? false;

// ── Update cache (background) ─────────────────────────────────────────────────
let updateCache = new Map(), updateReady = false;

async function prefetchUpdateCache() {
  // refresh pip cache in background too
  if (pipAvailable()) { const pc = buildPipCache(); for (const [k,v] of pc) pipCache.set(k,v); }
  const installed = PACKAGES.filter(p => isInstalled(p.name));
  if (!installed.length) { updateReady = true; return; }
  let out = "";
  await new Promise(resolve => {
    const proc = isWin
      ? spawn("npm list -g --depth=0 --json", [], { stdio: ["ignore", "pipe", "pipe"], shell: true })
      : spawn("npm", ["list", "-g", "--depth=0", "--json"], { stdio: ["ignore", "pipe", "pipe"] });
    proc.stdout?.on("data", d => { out += d; });
    proc.on("error", () => resolve()); proc.on("close", () => resolve());
    setTimeout(() => { try { proc.kill(); } catch {} resolve(); }, 6000);
  });
  const curVers = new Map();
  try { const deps = JSON.parse(out)?.dependencies ?? {}; for (const p of installed) curVers.set(p.name, deps[p.name]?.version ?? null); } catch {}
  // npm + pip share same version number — check all packages (npm or pip installed)
  await Promise.all(PACKAGES.map(p => new Promise(resolve => {
    const npmI = isInstalled(p.name), pipI = isPipInst(p.pip);
    if (!npmI && !pipI) { resolve(); return; }
    if (npmI) {
      // fetch latest from npm registry
      let v = "";
      const proc = isWin
        ? spawn("npm show " + p.name + " version", [], { stdio: ["ignore", "pipe", "pipe"], shell: true })
        : spawn("npm", ["show", p.name, "version"], { stdio: ["ignore", "pipe", "pipe"] });
      proc.stdout?.on("data", d => { v += d; });
      proc.on("error", () => resolve());
      proc.on("close", () => {
        const latest = v.trim() || null, current = curVers.get(p.name) ?? null;
        updateCache.set(p.name, { current, latest, hasUpdate: !!(current && latest && current !== latest) });
        resolve();
      });
      setTimeout(() => { try { proc.kill(); } catch {} resolve(); }, 6000);
    } else {
      // pip-only: get installed version, mark for checking
      const cur = getVersion(p.pip, true);
      updateCache.set(p.name, { current: cur, latest: null, hasUpdate: false });
      resolve();
    }
  })));
  updateReady = true;
}

// ── Clipboard ─────────────────────────────────────────────────────────────────
function copyToClipboard(text) {
  try {
    if (isWin)                        execSync("clip",   { input: text, shell: true });
    else if (process.platform === "darwin") execSync("pbcopy", { input: text });
    else execSync("xclip -selection clipboard || xsel --clipboard --input", { input: text, shell: true });
    return true;
  } catch { return false; }
}

// ── React hook generator ──────────────────────────────────────────────────────
function generateUnifiedHook(books) {
  const cwd = process.cwd(), srcDir = path.join(cwd, "src"), hooksDir = path.join(srcDir, "hooks");
  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) { console.error(red("\n  ✗ No package.json found. Run inside your React project.\n")); process.exit(1); }
  const deps = { ...JSON.parse(fs.readFileSync(pkgPath, "utf8")).dependencies, ...JSON.parse(fs.readFileSync(pkgPath, "utf8")).devDependencies };
  if (!deps["react"]) { console.error(red("\n  ✗ React not found in package.json.\n")); process.exit(1); }
  if (!fs.existsSync(srcDir)) { console.error(red("\n  ✗ No src/ directory found.\n")); process.exit(1); }
  if (!fs.existsSync(hooksDir)) { fs.mkdirSync(hooksDir, { recursive: true }); console.log(green("  ✓ Created src/hooks/")); }

  const loaderBlocks = books.map(p => {
    const CDN = `https://cdn.jsdelivr.net/npm/${p.name}@latest/chapters`;
    return `\n// ── ${p.label} ──\nconst _${p.cmd}CDN='${CDN}';let _${p.cmd}Cache=null,_${p.cmd}Prom=null;const _${p.cmd}Subs=new Set();\nfunction _load${p.hook.replace("use","")}(){if(_${p.cmd}Cache)return Promise.resolve(_${p.cmd}Cache);if(_${p.cmd}Prom)return _${p.cmd}Prom;_${p.cmd}Prom=fetch(_${p.cmd}CDN+'/meta.json').then(r=>r.json()).then(meta=>Promise.all(meta.chapters.map(c=>fetch(_${p.cmd}CDN+'/'+c.id+'.json').then(r=>r.json()))).then(results=>{const hadiths=results.flat();const _byId=new Map();hadiths.forEach(h=>_byId.set(h.id,h));_${p.cmd}Cache=Object.assign([],hadiths,{metadata:meta.metadata,chapters:meta.chapters,get:id=>_byId.get(id),getByChapter:id=>hadiths.filter(h=>h.chapterId===id),search:(q,limit=0)=>{const ql=q.toLowerCase();const r=hadiths.filter(h=>h.english?.text?.toLowerCase().includes(ql)||h.english?.narrator?.toLowerCase().includes(ql));return limit>0?r.slice(0,limit):r;},getRandom:()=>hadiths[Math.floor(Math.random()*hadiths.length)]});_${p.cmd}Subs.forEach(fn=>fn(_${p.cmd}Cache));_${p.cmd}Subs.clear();return _${p.cmd}Cache;}));return _${p.cmd}Prom;}_load${p.hook.replace("use","")}();\nexport function ${p.hook}(){const[data,setData]=useState(_${p.cmd}Cache);useEffect(()=>{if(_${p.cmd}Cache){setData(_${p.cmd}Cache);}else{_${p.cmd}Subs.add(setData);return()=>_${p.cmd}Subs.delete(setData);}},[]);return data;}`;
  }).join("\n");

  const hookSrc = `// Auto-generated by: sunnah --react\n// Books: ${books.map(p => p.label).join(", ")}\nimport { useState, useEffect } from 'react';\n${loaderBlocks}\nexport function useSunnah(){const hooks=[${books.map(p => `${p.hook}()`).join(",")}];if(hooks.some(h=>!h))return null;return{${books.map((p,i) => `${p.cmd}:hooks[${i}]`).join(",")}};}\nexport default useSunnah;\n`;

  const hookFile = path.join(hooksDir, "useSunnah.js");
  fs.writeFileSync(hookFile, hookSrc, "utf8");
  const div = gray("─".repeat(60));
  console.log("\n" + div);
  console.log(bold(cyan("  ✓ Generated: src/hooks/useSunnah.js")));
  console.log(div);
  console.log("\n  " + gray("Included books:"));
  books.forEach(p => console.log("  " + green("▸") + " " + bold(p.label) + gray("  " + p.hook + "()")));
  console.log("\n  " + gray("Usage:") + "\n    " + cyan("import { useSunnah } from '../hooks/useSunnah';"));
  console.log("    " + gray("const sunnah = useSunnah();"));
  if (books[0]) console.log("    " + gray(`sunnah.${books[0].cmd}.getRandom()`));
  console.log("\n" + div + "\n");
}

// ── Personalized suggestions ──────────────────────────────────────────────────
function getPersonalizedSuggestions() {
  const installed = PACKAGES.filter(p => isInstalled(p.name));
  const missing   = PACKAGES.filter(p => !isInstalled(p.name));
  const tips = [];
  if (installed.length === 0) {
    tips.push(cyan("  ▸") + " Run " + bold("sunnah") + " to open the interactive installer");
    tips.push(cyan("  ▸") + " Or install directly: " + bold("sunnah install bukhari"));
  } else {
    installed.slice(0, 2).forEach(p => {
      tips.push(cyan("  ▸") + " " + bold(p.cmd + " --random") + gray("  — random " + p.label + " hadith"));
      tips.push(cyan("  ▸") + " " + bold(`sunnah search "prayer"`) + gray("  — search all installed books"));
    });
    if (installed.length > 1) tips.push(cyan("  ▸") + " " + bold("sunnah --react") + gray("  — generate useSunnah() React hook"));
    if (missing.length > 0)   tips.push(cyan("  ▸") + " " + bold("sunnah") + gray("  — install more books (" + missing.map(p => p.label).join(", ") + ")"));
    tips.push(cyan("  ▸") + " " + bold("sunnah --update") + gray("  — check for updates"));
  }
  return tips;
}

// ── Interactive TUI mode ──────────────────────────────────────────────────────
const MODE = { LIST: "list", CONFIRM_UNINSTALL: "confirm_uninstall" };

function render(state) {
  const { cursor, selected, mode, confirmTarget, statusMsg } = state;
  const divW = Math.min(W() - 2, 72);
  const div  = gray("─".repeat(divW));
  const div2 = gray("═".repeat(divW));

  clearScreen();
  let row = 1;

  writeLine(row++, div2);
  writeLine(row++, bold(cyan("  📚 Sunnah Package Manager")) + gray("  v" + pkg.version));
  writeLine(row++,
    gray("  ↑↓") + " nav  " + gray("space") + " select  " + gray("a") + " all  " +
    gray("enter") + " npm  " + gray("p") + " pip  " +
    gray("u") + " uninstall  " + gray("U") + " update  " +
    gray("i") + " info  " + gray("q") + " quit"
  );
  writeLine(row++, div2);
  if (!npmAvailable()) writeLine(row++, "  " + yellow("⚠ npm not found") + gray(" — npm packages unavailable  ") + dim("nodejs.org"));
  if (!pipAvailable()) writeLine(row++, "  " + yellow("⚠ pip not found") + gray(" — pip packages unavailable  ") + dim("python.org"));
  row++;

  PACKAGES.forEach((p, i) => {
    const isCursor = i === cursor;
    const isSel    = selected.has(i);
    const inst     = isInstalled(p.name);

    const checkbox = isSel ? green("[✓]") : gray("[ ]");
    const arrow    = isCursor ? cyan("▶") : " ";
    const label    = isCursor ? bold(white(p.label)) : isSel ? green(p.label) : white(p.label);
    const npmInst  = isInstalled(p.name);
    const pipInst  = isPipInst(p.pip);
    const anyInst  = npmInst || pipInst;
    // build compact badge: only show what IS installed
    const labels = [...(npmInst ? ["npm"] : []), ...(pipInst ? ["pip"] : [])];
    const instStr = labels.length ? "(" + labels.join(" + ") + ")" : "";
    const uc = updateCache.get(p.name);
    const updStr = uc?.hasUpdate ? "  " + yellow("↑ update available") : (updateReady && anyInst && uc ? "  " + dim(gray("(up to date)")) : "");
    const badge = anyInst
      ? dim(green("  ● ")) + dim(green(instStr)) + updStr
      : dim(gray("  ○ not installed"));

    writeLine(row++, `  ${arrow} ${checkbox}  ${label}${badge}`);

    if (isCursor) {
      writeLine(row++, `         ${dim(p.author)}`);
      writeLine(row++, `         ${gray(p.desc)}`);
      const uc = updateCache.get(p.name);
      // version — npm and pip share the same version number
      const verInfo = anyInst
        ? (uc ? (uc.hasUpdate
            ? gray("  v") + yellow(uc.current) + gray(" → ") + green(uc.latest)
            : gray("  v") + cyan(uc.current || "?"))
          : gray("  (checking…)"))
        : "";
      const pkgDetail = [npmInst ? dim(gray("npm: " + p.name)) : "", pipInst ? dim(gray("pip: " + p.pip)) : ""].filter(Boolean).join("  ");
      writeLine(row++,
        `         ${gray("Hadiths: ")}${yellow(p.hadiths)}` +
        `   ${gray("CLI: ")}${cyan(p.cmd + " --help")}` +
        verInfo +
        (pkgDetail ? `   ${pkgDetail}` : "") +
        (anyInst ? `   ${gray("try: ")}${cyan(p.cmd + " --random")}` : "")
      );
      row++;
    }
  });

  row++;
  writeLine(row++, div);

  if (statusMsg) {
    writeLine(row++, `  ${yellow("⚠")}  ${yellow(statusMsg)}`);
  } else if (selected.size > 0) {
    const names = [...selected].map(i => cyan(PACKAGES[i].name)).join(", ");
    writeLine(row++, `  ${green("●")} ${bold(String(selected.size))} selected: ${names}`);
    writeLine(row++, `  ${dim("enter = npm install   p = pip install   u = uninstall")}`);
  } else {
    writeLine(row++, `  ${gray("Nothing selected — press space to select, enter to install focused")}`);
  }

  writeLine(row++, div);

  if (mode === MODE.CONFIRM_UNINSTALL && confirmTarget !== null) {
    const p = PACKAGES[confirmTarget];
    row++;
    writeLine(row++, `  ${red("⚠  Uninstall ")}${bold(white(p.label))}${red("?")}`);
    writeLine(row++, `  ${green("y")} ${gray("confirm")}   ${red("n")} ${gray("cancel")}`);
  }
}

// ── Non-interactive commands ──────────────────────────────────────────────────

function cmdList() {
  installedCache = buildInstalledCache(); pipCache = buildPipCache();
  const div = gray("─".repeat(60));
  console.log("\n" + div);
  console.log(bold(cyan("  Available Sunnah Packages")));
  console.log(div);
  PACKAGES.forEach(p => {
    const n = isInstalled(p.name), pi = isPipInst(p.pip);
    const nv = n  ? getVersion(p.name) : null;
    const nl = n  ? getLatest(p.name)  : null;
    const vStr = n && nv && nl
      ? (nv === nl ? dim(gray("  v" + nv + " (up to date)")) : yellow("  v" + nv) + gray(" → ") + green("v" + nl) + yellow(" ↑"))
      : (n && nv ? dim(gray("  v" + nv)) : "");
    console.log(`\n  ${bold(white(p.label))}${n ? green("  ✓ npm") : red("  ✗ npm")}${pi ? green("  ✓ pip") : gray("  ○ pip")}${vStr}`);
    console.log(`  ${cyan("npm install -g " + p.name)}   ${dim("pip install " + p.pip)}`);
    console.log(`  ${dim(p.desc)}`);
    console.log(`  ${gray("Hadiths: ")}${yellow(p.hadiths)}   ${gray("Author: ")}${magenta(p.author)}`);
    if (n)  console.log(`  ${gray("CLI: ")}${cyan(p.cmd + " --help")}   ${gray("React: ")}${cyan("sunnah --react " + p.cmd)}`);
    if (pi) console.log(`  ${gray("Python: ")}${dim("from " + p.pyMod + " import " + p.pyClass)}`);
  });
  console.log("\n" + div + "\n");
}

function cmdInfo(target) {
  const p = CMD_MAP[target?.toLowerCase()] || NAME_MAP[target];
  if (!p) { console.log(red(`\n  Unknown book: "${target}"\n`)); console.log("  Available: " + PACKAGES.map(x => cyan(x.cmd)).join(", ") + "\n"); process.exit(1); }
  installedCache = buildInstalledCache(); pipCache = buildPipCache();
  const n = isInstalled(p.name), pi = isPipInst(p.pip);
  const nv = n  ? getVersion(p.name)      : null;
  const pv = pi ? getVersion(p.pip, true) : null;
  const div = gray("─".repeat(60)), div2 = gray("═".repeat(60));
  console.log("\n" + div2 + "\n  " + bold(cyan(p.label)) + "\n" + div2);
  console.log("  " + gray("Author:  ") + magenta(p.author));
  console.log("  " + gray("Hadiths: ") + yellow(p.hadiths));
  console.log("  " + gray("npm:     ") + cyan(p.name)  + (n  ? green("  ✓ v" + nv) : red("  ✗ not installed")));
  console.log("  " + gray("pip:     ") + cyan(p.pip)   + (pi ? green("  ✓ v" + pv) : red("  ✗ not installed")));
  console.log("  " + gray("CLI:     ") + cyan(p.cmd + " --help"));
  console.log("  " + gray("React:   ") + cyan("sunnah --react " + p.cmd));
  console.log("  " + gray("Python:  ") + dim("from " + p.pyMod + " import " + p.pyClass));
  console.log("  " + gray("Desc:    ") + p.desc);
  console.log(div);
  if (!n)  console.log("  " + yellow("npm:") + " sunnah install " + p.cmd);
  if (!pi) console.log("  " + yellow("pip:") + " sunnah pip install " + p.cmd);
  console.log(div2 + "\n");
}

async function cmdRandom(bookCmd = null) {
  installedCache = buildInstalledCache();
  const inst = PACKAGES.filter(p => isInstalled(p.name));
  if (!inst.length) { console.log(yellow("\n  No packages installed. Run sunnah to install some.\n")); process.exit(0); }
  const target = bookCmd ? CMD_MAP[bookCmd] : inst[Math.floor(Math.random() * inst.length)];
  if (!target) { console.log(red(`\n  Unknown book: ${bookCmd}\n`)); process.exit(1); }
  try {
    const mod = await import(target.name).catch(() => null);
    if (!mod) { console.log(red("\n  Could not load " + target.label + "\n")); process.exit(1); }
    const h = mod.default.getRandom(), div2 = gray("═".repeat(60));
    console.log("\n" + div2);
    console.log(`  ${bold(cyan("Hadith #" + h.id))}  ${gray("|")}  ${bold(target.label)}`);
    console.log(div2);
    if (h.english?.narrator) console.log("  " + bold(yellow("Narrator: ")) + magenta(h.english.narrator));
    if (h.english?.text) { console.log(""); console.log("  " + h.english.text); }
    console.log("\n" + div2 + "\n");
    console.log("  " + gray("Try: ") + cyan(target.cmd + " " + h.id + " -b") + gray("  (Arabic + English)\n"));
  } catch (_e) { console.log(red("\n  Could not load " + target.label + ".\n")); }
}

async function cmdSearch(query, all = false) {
  if (!query) { console.error(red('\n  Usage: sunnah search "<query>" [--all]\n')); process.exit(1); }
  installedCache = buildInstalledCache();
  const inst = PACKAGES.filter(p => isInstalled(p.name));
  if (!inst.length) { console.log(yellow("\n  No packages installed.\n")); process.exit(0); }
  const div = gray("─".repeat(60)), div2 = gray("═".repeat(60));
  console.log("\n" + div2);
  console.log(bold(cyan("  Searching across ")) + yellow(String(inst.length)) + bold(cyan(" book" + (inst.length > 1 ? "s" : "") + "…")));
  console.log(div2 + "\n");
  let total = 0;
  for (const p of inst) {
    process.stdout.write("  " + gray("Loading ") + white(p.label) + gray("…\r"));
    try {
      const mod = await import(p.name).catch(() => null);
      if (!mod) { process.stdout.write("\x1b[K"); console.log("  " + gray("○ " + p.label + " — could not load")); continue; }
      const results = mod.default.search ? mod.default.search(query, 0) : [];
      process.stdout.write("\x1b[K");
      if (!results.length) { console.log("  " + dim(gray("○ " + p.label + " — no results"))); continue; }
      total += results.length;
      const limit = all ? results.length : Math.min(3, results.length);
      console.log("  " + green("▸") + " " + bold(p.label) + gray("  " + results.length + " results"));
      console.log(div);
      results.slice(0, limit).forEach((h, i) => {
        console.log("\n  " + bold(green("#" + (i + 1))) + gray("  Hadith " + h.id));
        if (h.english?.narrator) console.log("  " + bold(yellow("Narrator: ")) + magenta(h.english.narrator));
        if (h.english?.text) {
          const txt = h.english.text.slice(0, 200) + (h.english.text.length > 200 ? "…" : "");
          const hi  = txt.replace(new RegExp("(" + query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"), "\x1b[1m\x1b[33m$1\x1b[0m");
          console.log("  " + hi);
        }
        console.log(dim(gray("  " + p.cmd + " " + h.id + " -b")));
      });
      if (!all && results.length > 3) console.log("\n  " + dim("Showing 3 of " + results.length + ".  ") + yellow(`sunnah search "${query}" --all`));
      console.log(div);
    } catch { process.stdout.write("\x1b[K"); console.log("  " + gray("○ " + p.label + " — skipped")); }
  }
  console.log("\n" + div2);
  console.log("  " + green("✓") + " " + bold(String(total)) + gray(" total results across ") + yellow(String(inst.length)) + gray(" book" + (inst.length > 1 ? "s" : "") + "."));
  console.log(div2 + "\n");
}

async function cmdPipInstall(targets) {
  if (!targets.length) { console.error(red("\n  Usage: sunnah pip install <book>\n")); process.exit(1); }
  if (!pipAvailable()) { warnNoPip(); process.exit(1); }
  const to = [];
  for (const t of targets) {
    const p = CMD_MAP[t.toLowerCase()] || NAME_MAP[t];
    if (!p) { console.log(yellow(`\n  Unknown: "${t}"`)); process.exit(1); }
    to.push(p);
  }
  const div2 = gray("═".repeat(60));
  console.log("\n" + div2);
  console.log(bold(cyan("  Installing ")) + bold(yellow(String(to.length))) + bold(cyan(" Python package" + (to.length > 1 ? "s" : "") + "…")));
  console.log(div2);
  for (let i = 0; i < to.length; i++) {
    const p = to[i];
    console.log(`\n  ${cyan("[" + (i + 1) + "/" + to.length + "]")}  ${bold(white(p.label))}`);
    console.log("  " + dim("pip install " + p.pip) + "\n");
    await animateInstall(p.pip, true);
    console.log("  " + green("✓") + " " + bold(green(p.label)) + " (Python) installed");
    console.log("  " + gray("Usage: ") + dim("from " + p.pyMod + " import " + p.pyClass));
  }
  console.log("\n" + div2 + "\n");
}

function cmdPipList() {
  if (!pipAvailable()) { warnNoPip(); return; }
  pipCache = buildPipCache(); const div = gray("─".repeat(60));
  console.log("\n" + div + "\n  " + bold(cyan("  Python (pip) Packages")) + "\n" + div);
  PACKAGES.forEach(p => {
    const i = isPipInst(p.pip), v = i ? getVersion(p.pip, true) : null;
    console.log(`\n  ${bold(white(p.label))}${i ? green("  ✓ v" + (v || "?")) : red("  ✗ not installed")}`);
    console.log(`  ${dim("pip install " + p.pip)}`);
    if (i) console.log(`  ${gray("from ")}${cyan(p.pyMod)}${gray(" import ")}${cyan(p.pyClass)}`);
  });
  console.log("\n" + div + "\n");
}

async function cmdPipUpdate() {
  if (!pipAvailable()) { warnNoPip(); return; }
  pipCache = buildPipCache();
  const inst = PACKAGES.filter(p => isPipInst(p.pip));
  if (!inst.length) { console.log(yellow("\n  No pip packages installed. Run: sunnah pip install <book>\n")); return; }
  const div2 = gray("═".repeat(60));
  console.log("\n" + div2 + "\n  " + bold(cyan("  Checking Python packages for updates…")) + "\n" + div2 + "\n");
  const ups = [];
  for (const p of inst) {
    process.stdout.write("  " + gray("Checking ") + white(p.label) + gray("…\r"));
    const cur = getVersion(p.pip, true), lat = getLatest(p.pip, true);
    process.stdout.write("\x1b[K");
    if (!cur || !lat) { console.log(`  ${yellow("?")} ${bold(p.label)}  ${gray("(could not check)")}`); continue; }
    if (cur === lat)  { console.log(`  ${green("✓")} ${bold(p.label)}  ${gray("v" + cur + " — up to date")}`); }
    else              { ups.push({ p, cur, lat }); console.log(`  ${yellow("↑")} ${bold(p.label)}  ${gray("v" + cur)} → ${green("v" + lat)}  ${yellow("(update available)")}`); }
  }
  console.log("\n" + div2);
  if (!ups.length) { console.log("  " + green("✓ All Python packages are up to date.")); console.log(div2 + "\n"); return; }
  console.log("  " + yellow(String(ups.length)) + " update" + (ups.length > 1 ? "s" : "") + " available.");
  console.log("  Run " + bold(cyan("sunnah pip update --install")) + gray(" to install all."));
  console.log(div2 + "\n");
}

async function cmdUpdate(autoInstall = false) {
  if (!npmAvailable()) { warnNoNpm(); return; }
  installedCache = buildInstalledCache();
  const inst = PACKAGES.filter(p => isInstalled(p.name));
  if (!inst.length) { console.log("\n  " + yellow("No sunnah packages installed. Run ") + bold("sunnah") + yellow(" to install.\n")); return; }
  const div = gray("─".repeat(60)), div2 = gray("═".repeat(60));
  console.log("\n" + div2 + "\n  " + bold(cyan("  Checking for updates…")) + "\n" + div2 + "\n");
  const ups = [];
  for (const p of inst) {
    process.stdout.write("  " + gray("Checking ") + white(p.label) + gray("…\r"));
    const cur = getVersion(p.name), lat = getLatest(p.name);
    process.stdout.write("\x1b[K");
    if (!cur || !lat) { console.log(`  ${yellow("?")} ${bold(p.label)}  ${gray("(could not check)")}`); continue; }
    if (cur === lat)  { console.log(`  ${green("✓")} ${bold(p.label)}  ${gray("v" + cur + " — up to date")}`); }
    else              { ups.push({ p, cur, lat }); console.log(`  ${yellow("↑")} ${bold(p.label)}  ${gray("v" + cur)} → ${green("v" + lat)}  ${yellow("(update available)")}`); }
  }
  console.log("\n" + div);
  if (!ups.length) { console.log("  " + green("✓ All packages are up to date.")); console.log(div + "\n"); return; }
  console.log("  " + yellow(String(ups.length)) + " update" + (ups.length > 1 ? "s" : "") + " available.");
  if (autoInstall) {
    console.log(bold(cyan("\n  Installing updates…"))); console.log(div + "\n");
    for (let i = 0; i < ups.length; i++) {
      const { p, cur, lat } = ups[i];
      console.log("  " + cyan("[" + (i + 1) + "/" + ups.length + "]") + "  " + bold(white(p.label)) + gray("  v" + cur + " → v" + lat) + "\n");
      await animateInstall(p.name);
      console.log("  " + green("✓") + " " + bold(green(p.label)) + gray(" updated to v" + lat));
    }
    console.log("\n" + div2 + "\n  " + green("✓ All updates installed.") + "\n" + div2 + "\n");
  } else {
    console.log("  Run " + bold(cyan("sunnah --update --install")) + gray(" to install all updates automatically."));
    ups.forEach(({ p }) => console.log("    " + dim("sunnah install " + p.cmd)));
    console.log(div + "\n");
  }
}

async function cmdInstall(targets) {
  if (!targets.length) {
    console.error(red("\n  ✗ Usage: sunnah install <book>  (e.g. sunnah install bukhari)\n"));
    console.log("  Available: " + PACKAGES.map(p => cyan(p.cmd)).join(", ") + "\n");
    process.exit(1);
  }
  if (!npmAvailable()) { warnNoNpm(); process.exit(1); }
  const to = [];
  for (const t of targets) {
    const p = CMD_MAP[t.toLowerCase()] || NAME_MAP[t];
    if (!p) { console.log(yellow(`\n  ⚠  Unknown package: "${t}"`)); process.exit(1); }
    to.push(p);
  }
  const div2 = gray("═".repeat(60));
  console.log("\n" + div2);
  console.log(bold(cyan("  Installing ")) + bold(yellow(String(to.length))) + bold(cyan(" package" + (to.length > 1 ? "s" : "") + "…")));
  console.log(div2);
  for (let i = 0; i < to.length; i++) {
    const p = to[i];
    console.log(`\n  ${cyan("[" + (i + 1) + "/" + to.length + "]")}  ${bold(white(p.label))}`);
    console.log("  " + dim("npm install -g " + p.name) + "\n");
    await animateInstall(p.name);
    installedCache.set(p.name, true);
    console.log("  " + green("✓") + " " + bold(green(p.label)) + " installed");
    console.log("  " + gray("Usage: ") + cyan(p.cmd + " --help"));
    console.log("  " + gray("Python: ") + dim("pip install " + p.pip));
  }
  console.log("\n" + div2);
  console.log("  " + green("✓ Done! ") + to.map(p => bold(cyan(p.cmd))).join(", ") + gray(" ready."));
  console.log(div2 + "\n");
}

function cmdUninstall(targets) {
  if (!targets.length) { console.error(red("\n  ✗ Usage: sunnah uninstall <book>\n")); process.exit(1); }
  if (!npmAvailable()) { warnNoNpm(); process.exit(1); }
  installedCache = buildInstalledCache();
  const div2 = gray("═".repeat(60));
  console.log("\n" + div2);
  for (const t of targets) {
    const p = CMD_MAP[t.toLowerCase()] || NAME_MAP[t];
    if (!p) { console.log(yellow(`  ⚠  Unknown: "${t}"\n`)); continue; }
    if (!isInstalled(p.name)) { console.log(gray(`  ○  ${p.label} is not installed, skipping.`)); continue; }
    console.log(yellow("  Uninstalling ") + bold(white(p.label)) + yellow("…"));
    try { npmSync(["uninstall", "-g", p.name], { stdio: "inherit" }); installedCache.set(p.name, false); console.log(green("  ✓ ") + bold(green(p.label)) + green(" uninstalled.\n")); }
    catch { console.log(red("  ✗ Failed to uninstall " + p.label + "\n")); }
  }
  console.log(div2 + "\n");
}

function cmdVersion() {
  installedCache = buildInstalledCache(); pipCache = buildPipCache();
  const n = PACKAGES.filter(p => isInstalled(p.name)), pi = PACKAGES.filter(p => isPipInst(p.pip));
  const div = gray("─".repeat(60));
  console.log("\n" + div + "\n  " + bold(cyan("  📿 sunnah")) + gray("  v" + pkg.version) + "\n" + div);
  console.log("  " + gray("Available  : ") + yellow(String(PACKAGES.length)));
  console.log("  " + gray("npm inst.  : ") + green(String(n.length)) + gray(" / " + PACKAGES.length));
  console.log("  " + gray("pip inst.  : ") + (pi.length ? green(String(pi.length)) : gray("0")) + gray(" / " + PACKAGES.length));
  if (n.length) {
    console.log("  " + gray("Collection : ") + n.map(p => cyan(p.label)).join(gray(", ")));
    const tot = n.reduce((a, p) => a + parseInt(p.hadiths.replace(/,/g, "")), 0);
    console.log("  " + gray("Hadiths    : ") + bold(yellow(tot.toLocaleString())));
  }
  console.log("\n" + div + "\n");
}

function cmdHelp() {
  installedCache = buildInstalledCache();
  const div = gray("─".repeat(60));
  console.log("\n" + div + "\n  " + bold(cyan("  📿 Sunnah Package Manager")) + gray("  v" + pkg.version) + "\n" + div);
  console.log("\n  " + bold("Commands:"));
  [
    ["sunnah",                        "Open interactive installer UI  ← arrow keys, space, enter"],
    ["sunnah install <book>",         "Install npm package(s)"],
    ["sunnah uninstall <book>",       "Uninstall npm package(s)"],
    ["sunnah pip install <book>",     "Install Python (pip) package(s)"],
    ["sunnah pip list",               "List Python package status"],
    ["sunnah pip update",             "Check Python packages for updates"],
    ['sunnah search "<query>"',       "Search across ALL installed books"],
    ["sunnah random [book]",          "Random hadith from installed books"],
    ["sunnah info <book>",            "Detailed info for a book"],
    ["sunnah --react [books]",        "Generate unified useSunnah() React hook"],
    ["sunnah --list",                 "List all packages with install status"],
    ["sunnah --update",               "Check npm packages for updates"],
    ["sunnah --update --install",     "Auto-install all available updates"],
    ["sunnah -v",                     "Version + collection stats"],
    ["sunnah -h",                     "This help"],
  ].forEach(([cmd, desc]) => console.log("    " + cyan(cmd.padEnd(34)) + gray(desc)));
  console.log("\n  " + bold("Book names (cmd alias or full npm name):"));
  PACKAGES.forEach(p => {
    const inst = isInstalled(p.name);
    console.log("    " + cyan(p.cmd.padEnd(12)) + gray(p.name.padEnd(26)) + yellow(p.hadiths + " hadiths") + (inst ? green("  ✓") : ""));
  });
  console.log("\n  " + bold("Interactive UI controls:"));
  [["↑ ↓", "Navigate"], ["space", "Toggle select"], ["a", "Select all / deselect all"],
   ["i",   "Show info + installed version"], ["u", "Uninstall selected"],
   ["U",   "Update selected"], ["enter", "Install selected"], ["q", "Quit"]
  ].forEach(([k, d]) => console.log("    " + green(k.padEnd(8)) + gray(d)));
  console.log("\n  " + bold("Examples:"));
  ["sunnah install bukhari", "sunnah install bukhari muslim nasai", "sunnah pip install bukhari",
   'sunnah search "prayer"', "sunnah random", "sunnah --react", "sunnah --update"
  ].forEach(e => console.log("    " + dim(e)));
  const tips = getPersonalizedSuggestions();
  if (tips.length) { console.log("\n" + div + "\n  " + bold("💡 Suggested for you:")); tips.forEach(t => console.log(t)); }
  console.log("\n" + div + "\n");
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const rawArgs    = process.argv.slice(2);
  const flags      = rawArgs.filter(a => a.startsWith("-"));
  const positional = rawArgs.filter(a => !a.startsWith("-"));

  if (flags.some(f => f === "-v" || f === "--version")) { cmdVersion(); process.exit(0); }
  if (flags.some(f => f === "-h" || f === "--help"))    { cmdHelp();    process.exit(0); }
  if (flags.some(f => f === "--list" || f === "-l"))    { cmdList();    process.exit(0); }
  if (flags.some(f => f === "--update")) { await cmdUpdate(flags.some(f => f === "--install")); process.exit(0); }

  if (positional[0] === "install")   { await cmdInstall(positional.slice(1));   process.exit(0); }
  if (positional[0] === "uninstall") { cmdUninstall(positional.slice(1));        process.exit(0); }
  if (positional[0] === "info")      { cmdInfo(positional[1]);                  process.exit(0); }
  if (positional[0] === "random")    { await cmdRandom(positional[1] || null);  process.exit(0); }
  if (positional[0] === "search")    { await cmdSearch(positional.slice(1).join(" "), flags.some(f => f === "--all")); process.exit(0); }

  if (positional[0] === "pip") {
    const sub = positional[1];
    if (sub === "install") { await cmdPipInstall(positional.slice(2)); process.exit(0); }
    if (sub === "list")    { cmdPipList();                              process.exit(0); }
    if (sub === "update")  { await cmdPipUpdate();                     process.exit(0); }
    console.error(red(`\n  ✗ Unknown pip command: "${sub}". Use: install, list, update\n`)); process.exit(1);
  }

  if (flags.some(f => f === "--react")) {
    installedCache = buildInstalledCache();
    const requestedCmds = positional;
    let books;
    if (requestedCmds.length > 0) {
      books = requestedCmds.map(cmd => CMD_MAP[cmd.toLowerCase()]).filter(Boolean);
      const unknown = requestedCmds.filter(cmd => !CMD_MAP[cmd.toLowerCase()]);
      if (unknown.length) { console.log(yellow("\n  ⚠  Unknown books: " + unknown.join(", "))); console.log("  Available: " + Object.keys(CMD_MAP).join(", ") + "\n"); }
    } else {
      books = PACKAGES.filter(p => isInstalled(p.name));
      if (!books.length) { console.log(yellow("\n  ⚠  No sunnah packages installed yet.\n  Run ") + bold("sunnah") + yellow(" to install some first, or specify books:\n  ") + dim("sunnah --react bukhari muslim") + "\n"); process.exit(1); }
    }
    if (!books.length) { console.log(red("\n  ✗ No valid books specified.\n")); process.exit(1); }
    generateUnifiedHook(books); process.exit(0);
  }

  // ── Interactive TUI (default — no args given) ─────────────────────────────
  process.stdout.write("\n  " + gray("Checking installed packages…"));
  installedCache = buildInstalledCache();
  process.stdout.write("\r\x1b[K");

  const persisted    = loadState();
  const lastSelected = new Set((persisted.lastSelected || []).filter(i => i < PACKAGES.length));

  enterAltScreen();
  hideCursor();

  const state = {
    cursor: 0,
    selected: lastSelected,
    mode: MODE.LIST,
    confirmTarget: null,
    statusMsg: "",
  };

  let statusTimer = null;

  function setStatus(msg, ms = 2500) {
    state.statusMsg = msg;
    render(state);
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { state.statusMsg = ""; render(state); }, ms);
  }

  render(state);
  prefetchUpdateCache().then(() => render(state));

  const cleanup = () => {
    saveState({ lastSelected: [...state.selected] });
    showCursor();
    leaveAltScreen();
    try { process.stdin.setRawMode(false); } catch {}
    process.stdin.pause();
  };

  process.on("SIGINT", () => { cleanup(); process.exit(0); });

  // ── stdin setup — handles Windows PowerShell + cmd + Unix ─────────────────
  process.stdin.resume();
  readline.emitKeypressEvents(process.stdin);
  try { process.stdin.setRawMode(true); } catch {}

  let busy = false;

  const keypressHandler = async (str, key) => {
    if (!key) return;
    if (str === "q" || str === "Q" || (key.ctrl && key.name === "c")) { cleanup(); process.exit(0); }
    if (busy) return;

    // ── Confirm uninstall mode ──────────────────────────────────────────────
    if (state.mode === MODE.CONFIRM_UNINSTALL) {
      if (str === "y" || str === "Y") {
        const p = PACKAGES[state.confirmTarget];
        state.mode = MODE.LIST; state.confirmTarget = null; busy = true;
        cleanup();
        console.log("\n  " + yellow("Uninstalling ") + bold(white(p.label)) + yellow("…\n"));
        try {
          if (npmAvailable() && isInstalled(p.name))    { npmSync(["uninstall", "-g", p.name], { stdio: "inherit" }); installedCache.set(p.name, false); console.log("  " + green("✓") + " " + bold(p.label) + gray(" (npm) uninstalled")); }
          if (pipAvailable() && isPipInst(p.pip))       { pipSync(["uninstall", "-y", p.pip], { stdio: "inherit" });  pipCache.set(p.pip, false);         console.log("  " + green("✓") + " " + bold(p.label) + gray(" (pip) uninstalled")); }
          state.selected.delete(PACKAGES.indexOf(p));
          console.log("");
        } catch { console.log("\n  " + red("✗ Failed to uninstall " + p.label) + "\n"); }
        busy = false;
        reEnterMenu(state, render, prefetchUpdateCache, keypressHandler);
      } else { state.mode = MODE.LIST; state.confirmTarget = null; render(state); }
      return;
    }

    // ── Normal navigation ───────────────────────────────────────────────────
    if (key.name === "up")   { state.cursor = (state.cursor - 1 + PACKAGES.length) % PACKAGES.length; render(state); return; }
    if (key.name === "down") { state.cursor = (state.cursor + 1) % PACKAGES.length;                   render(state); return; }

    if (str === " ") {
      state.selected.has(state.cursor) ? state.selected.delete(state.cursor) : state.selected.add(state.cursor);
      render(state); return;
    }

    if (str === "a" || str === "A") {
      state.selected.size === PACKAGES.length ? state.selected.clear() : PACKAGES.forEach((_, i) => state.selected.add(i));
      render(state); return;
    }

    if (str === "i" || str === "I") {
      const p = PACKAGES[state.cursor], inst = isInstalled(p.name), ver = inst ? getVersion(p.name) : null;
      setStatus(`${p.label}  |  ${p.hadiths} hadiths  |  ${p.author}  |  ${inst ? "v" + ver + " installed  CLI: " + p.cmd + " --help" : "not installed"}`, 4000);
      return;
    }

    // p = pip install
    if (str === "p" || str === "P") {
      if (!pipAvailable()) { setStatus("pip not found — install Python from https://python.org", 5000); return; }
      const targets    = state.selected.size > 0 ? [...state.selected].map(i => PACKAGES[i]) : [PACKAGES[state.cursor]];
      const toInstall  = targets.filter(p => !isPipInst(p.pip));
      if (!toInstall.length) { setStatus("All selected already installed via pip."); return; }
      busy = true; cleanup();
      const div2 = gray("═".repeat(Math.min(W() - 2, 72)));
      console.log("\n" + div2);
      console.log(bold(cyan("  pip installing ")) + bold(yellow(String(toInstall.length))) + bold(cyan(" package" + (toInstall.length > 1 ? "s" : "") + "…")));
      console.log(div2);
      for (let i = 0; i < toInstall.length; i++) {
        const p = toInstall[i];
        console.log("\n  " + cyan("[" + (i + 1) + "/" + toInstall.length + "]") + "  " + bold(white(p.label)));
        console.log("  " + dim("pip install " + p.pip) + "\n");
        await animateInstall(p.pip, true);
        pipCache.set(p.pip, true);
        console.log("  " + green("✓") + " " + bold(green(p.label)) + " (pip) installed");
        console.log("  " + gray("Python: ") + dim("from " + p.pyMod + " import " + p.pyClass));
      }
      console.log("\n" + div2 + "\n");
      await sleep(600);
      busy = false; reEnterMenu(state, render, prefetchUpdateCache, keypressHandler);
      return;
    }

    if (str === "u") {
      const targets  = state.selected.size > 0 ? [...state.selected] : [state.cursor];
      const toRemove = targets.filter(i => isInstalled(PACKAGES[i].name) || isPipInst(PACKAGES[i].pip));
      if (!toRemove.length) { setStatus("No installed packages selected."); return; }
      state.mode = MODE.CONFIRM_UNINSTALL; state.confirmTarget = toRemove[0]; render(state); return;
    }

    if (str === "U") {
      const targets  = state.selected.size > 0 ? [...state.selected] : [state.cursor];
      const toUpdate = targets.filter(i => (isInstalled(PACKAGES[i].name) || isPipInst(PACKAGES[i].pip)) && updateCache.get(PACKAGES[i].name)?.hasUpdate);
      if (!toUpdate.length) { setStatus(updateReady ? "All selected packages are up to date." : "Update info still loading — try again shortly."); return; }
      busy = true; cleanup();
      const divW = Math.min(W() - 2, 72), div2 = gray("═".repeat(divW));
      console.log("\n" + div2);
      console.log(bold(cyan("  Updating ")) + bold(yellow(String(toUpdate.length))) + bold(cyan(" package" + (toUpdate.length > 1 ? "s" : "") + "…")));
      console.log(div2);
      for (let i = 0; i < toUpdate.length; i++) {
        const p = PACKAGES[toUpdate[i]], uc = updateCache.get(p.name);
        console.log("\n  " + cyan("[" + (i + 1) + "/" + toUpdate.length + "]") + "  " + bold(white(p.label)));
        console.log("  " + dim(gray("v" + uc.current + " → v" + uc.latest)) + "\n");
        await animateInstall(p.name);
        updateCache.set(p.name, { current: uc.latest, latest: uc.latest, hasUpdate: false });
        console.log("  " + green("✓") + " " + bold(green(p.label)) + gray(" updated to v" + uc.latest));
      }
      console.log("\n" + div2 + "\n");
      busy = false; reEnterMenu(state, render, prefetchUpdateCache, keypressHandler);
      return;
    }

    if (key.name === "return") {
      if (!npmAvailable()) { setStatus("npm not found — install Node.js from https://nodejs.org", 5000); return; }
      const targets   = state.selected.size > 0 ? [...state.selected].map(i => PACKAGES[i]) : [PACKAGES[state.cursor]];
      const toInstall = targets.filter(p => !isInstalled(p.name));

      if (!toInstall.length) { setStatus("All selected already installed via npm. Press p to pip install."); return; }

      busy = true; cleanup();
      const divW = Math.min(W() - 2, 72);
      const div  = gray("─".repeat(divW)), div2 = gray("═".repeat(divW));

      console.log("\n" + div2);
      console.log(bold(cyan("  Installing ")) + bold(yellow(String(toInstall.length))) + bold(cyan(" package" + (toInstall.length > 1 ? "s" : "") + "…")));
      console.log(div2);

      for (let i = 0; i < toInstall.length; i++) {
        const p = toInstall[i];
        console.log("\n  " + cyan("[" + (i + 1) + "/" + toInstall.length + "]") + "  " + bold(white(p.label)));
        console.log("  " + dim("npm install -g " + p.name) + "\n");
        await animateInstall(p.name);
        installedCache.set(p.name, true);
        console.log("  " + green("✓") + " " + bold(green(p.label)) + " installed");
        const uc = updateCache.get(p.name);
        if (uc && uc.current) {
          console.log("  " + gray("Version: ") + cyan("v" + uc.current) + (uc.hasUpdate ? "  " + gray("Latest: ") + green("v" + uc.latest) + "  " + yellow("↑ update available") : uc.latest ? "  " + dim(gray("(up to date)")) : ""));
        }
        console.log("  " + gray("Usage: ") + cyan(p.cmd + " --help"));
        console.log("  " + gray("Python: ") + dim("pip install " + p.pip));
      }

      console.log("\n" + div2);
      console.log("  " + green("✓ All done! ") + bold(yellow(String(toInstall.length))) + " package" + (toInstall.length > 1 ? "s" : "") + " installed globally.");
      console.log("");
      toInstall.forEach(p => console.log("  " + cyan("▸") + " " + bold(p.cmd) + gray(" --help") + "  " + dim(p.label)));

      const allInstalled = PACKAGES.filter(p => isInstalled(p.name));
      if (allInstalled.length > 1) {
        console.log("\n  " + dim("Tip: run ") + bold("sunnah --react") + dim(" to generate a unified React hook for all your books"));
      }

      await sleep(800);
      busy = false;
      reEnterMenu(state, render, prefetchUpdateCache, keypressHandler);
    }
  };

  process.stdin.on("keypress", keypressHandler);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function reEnterMenu(state, render, prefetchUpdateCache, keypressHandler) {
  installedCache = buildInstalledCache();
  updateReady    = false;
  updateCache.clear();
  process.stdin.removeAllListeners("keypress");
  process.stdin.pause();
  enterAltScreen();
  hideCursor();
  render(state);
  prefetchUpdateCache().then(() => render(state));
  process.stdin.resume();
  readline.emitKeypressEvents(process.stdin);
  try { process.stdin.setRawMode(true); } catch {}
  process.stdin.on("keypress", keypressHandler);
}

main().catch(err => { showCursor(); leaveAltScreen(); console.error(red("\n  ✗ " + err.message + "\n")); process.exit(1); });
