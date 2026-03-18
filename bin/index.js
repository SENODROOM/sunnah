#!/usr/bin/env node

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { execSync, spawn } from "child_process";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
);

// ── Windows compatibility ─────────────────────────────────────────────────────
const isWin = process.platform === "win32";
const NPM = isWin ? "npm.cmd" : "npm";

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
  },
  {
    name: "sahih-muslim",
    label: "Sahih Muslim",
    author: "Imam Muslim ibn al-Hajjaj",
    desc: "Second most authentic hadith collection, known for its strict methodology and chain verification.",
    hadiths: "7,470",
    cmd: "muslim",
  },
  {
    name: "sunan-abi-dawud",
    label: "Sunan Abi Dawud",
    author: "Imam Abu Dawud Sulayman ibn al-Ash'ath",
    desc: "One of the six canonical hadith collections, focused on legal rulings and jurisprudence.",
    hadiths: "5,274",
    cmd: "dawud",
  },
  {
    name: "jami-al-tirmidhi",
    label: "Jami al-Tirmidhi",
    author: "Imam Abu Isa Muhammad al-Tirmidhi",
    desc: "Part of the six major hadith collections, unique for grading each hadith's authenticity.",
    hadiths: "3,956",
    cmd: "tirmidhi",
  },
];

// ── Terminal: use alternate screen buffer to avoid scroll issues ──────────────
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
function moveTo(row, col) {
  process.stdout.write(`\x1b[${row};${col}H`);
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

// ── Install a package with animated single progress bar ───────────────────────
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

    // Write bar ONCE — all updates overwrite this same line with \r
    process.stdout.write(drawBar(stages[0].label, 0));

    const tick = () => {
      const stage = stages[stageIdx];
      if (!stage) return;

      const prevEnd = stageIdx > 0 ? stages[stageIdx - 1].end : 0;
      const step = (stage.end - prevEnd) / 24;
      percent = Math.min(percent + step, stage.end);

      // Overwrite the SAME line — no \n, just \r
      process.stdout.write("\r\x1b[K" + drawBar(stage.label, percent));

      if (percent >= stage.end) {
        stageIdx++;
        if (stageIdx >= stages.length) {
          // Spin until npm actually finishes
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

    // Actually run npm install -g
    const proc = spawn(NPM, ["install", "-g", pkgName], {
      stdio: ["ignore", "pipe", "pipe"],
      shell: isWin,
    });
    proc.on("error", () => {
      npmDone = true;
    });
    proc.on("close", () => {
      npmDone = true;
    });
  });
}

// ── Installed cache — built ONCE, never during render ────────────────────────
function buildInstalledCache() {
  const cache = new Map();
  let out = "";
  try {
    out = execSync(`${NPM} list -g --depth=0`, {
      encoding: "utf8",
      shell: isWin,
      timeout: 10000,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch (e) {
    out = e.stdout || "";
  }
  for (const p of PACKAGES) {
    cache.set(p.name, out.includes(p.name));
  }
  return cache;
}

// Get latest version from npm registry (fast, single HTTP call)
function getLatestVersion(name) {
  try {
    return execSync(`${NPM} show ${name} version`, {
      encoding: "utf8",
      shell: isWin,
      timeout: 8000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

// Get currently installed version
function getInstalledVersion(name) {
  try {
    const out = execSync(`${NPM} list -g ${name} --depth=0`, {
      encoding: "utf8",
      shell: isWin,
      timeout: 8000,
      stdio: ["ignore", "pipe", "ignore"],
    });
    const match = out.match(new RegExp(name + "@([\\d.]+)"));
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

let installedCache = new Map();
const isInstalled = (name) => installedCache.get(name) ?? false;

// ── Modes ─────────────────────────────────────────────────────────────────────
const MODE = { LIST: "list", CONFIRM_UNINSTALL: "confirm_uninstall" };

// ── Render: full-screen, uses alt buffer so no scroll ever ───────────────────
function render(state) {
  const { cursor, selected, mode, confirmTarget, statusMsg } = state;
  const divW = Math.min(W() - 2, 72);
  const div = gray("─".repeat(divW));
  const div2 = gray("═".repeat(divW));

  clearScreen();

  let row = 1;

  // Header
  writeLine(row++, div2);
  writeLine(
    row++,
    bold(cyan("  📚 Sunnah Package Manager")) + gray("  v" + pkg.version),
  );
  writeLine(
    row++,
    gray("  ↑↓") +
      " navigate  " +
      gray("space") +
      " select  " +
      gray("a") +
      " all  " +
      gray("i") +
      " info  " +
      gray("u") +
      " uninstall  " +
      gray("enter") +
      " install  " +
      gray("q") +
      " quit",
  );
  writeLine(row++, div2);
  row++; // blank

  // Package list
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
      ? dim(green("  ● installed"))
      : dim(gray("  ○ not installed"));

    writeLine(row++, `  ${arrow} ${checkbox}  ${label}${badge}`);

    if (isCursor) {
      writeLine(row++, `         ${dim(p.author)}`);
      writeLine(row++, `         ${gray(p.desc)}`);
      writeLine(
        row++,
        `         ${gray("Hadiths: ")}${yellow(p.hadiths)}` +
          `   ${gray("CLI: ")}${cyan(p.cmd + " --help")}` +
          (inst ? `   ${gray("run: ")}${cyan(p.cmd + " 1")}` : ""),
      );
      row++; // blank after expanded
    }
  });

  row++; // blank
  writeLine(row++, div);

  // Status / selection footer
  if (statusMsg) {
    writeLine(row++, `  ${yellow("⚠")}  ${yellow(statusMsg)}`);
  } else if (selected.size > 0) {
    const names = [...selected].map((i) => cyan(PACKAGES[i].name)).join(", ");
    writeLine(
      row++,
      `  ${green("●")} ${bold(String(selected.size))} selected: ${names}`,
    );
    writeLine(
      row++,
      `  ${dim("Press enter to install, u to uninstall selected")}`,
    );
  } else {
    writeLine(
      row++,
      `  ${gray("Nothing selected — press space to select a package")}`,
    );
  }

  writeLine(row++, div);

  // Confirm uninstall overlay
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

// ── Non-interactive: --list ───────────────────────────────────────────────────
function cmdList() {
  installedCache = buildInstalledCache();
  const div = gray("─".repeat(60));
  console.log("");
  console.log(div);
  console.log(bold(cyan("  Available Sunnah Packages")));
  console.log(div);
  PACKAGES.forEach((p) => {
    const inst = isInstalled(p.name)
      ? green("  ✓ installed")
      : red("  ✗ not installed");
    console.log("");
    console.log(`  ${bold(white(p.label))}${inst}`);
    console.log(`  ${cyan("npm install -g " + p.name)}`);
    console.log(`  ${dim(p.desc)}`);
    console.log(
      `  ${gray("Hadiths: ")}${yellow(p.hadiths)}   ${gray("Author: ")}${magenta(p.author)}`,
    );
  });
  console.log("");
  console.log(div);
  console.log("");
}

// ── Non-interactive: --update ─────────────────────────────────────────────────
function cmdUpdate() {
  installedCache = buildInstalledCache();
  const installed = PACKAGES.filter((p) => isInstalled(p.name));
  if (!installed.length) {
    console.log("\n  " + yellow("No sunnah packages installed.\n"));
    return;
  }
  const div = gray("─".repeat(60));
  console.log("\n" + div);
  console.log(bold(cyan("  Checking for updates…")));
  console.log(div + "\n");

  for (const p of installed) {
    const current = getInstalledVersion(p.name);
    const latest = getLatestVersion(p.name);
    if (!current || !latest) {
      console.log(`  ${yellow("?")} ${p.label}  ${gray("(could not check)")}`);
      continue;
    }
    if (current === latest) {
      console.log(
        `  ${green("✓")} ${bold(p.label)}  ${gray(current + " — up to date")}`,
      );
    } else {
      console.log(
        `  ${yellow("↑")} ${bold(p.label)}  ${gray(current)} → ${green(latest)}  ${dim("(run: npm install -g " + p.name + ")")}`,
      );
    }
  }
  console.log("\n" + div + "\n");
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const rawArgs = process.argv.slice(2);
  const flags = rawArgs.filter((a) => a.startsWith("-"));

  // --version
  if (flags.some((f) => f === "-v" || f === "--version")) {
    console.log("\n  " + bold(cyan("sunnah")) + gray(" v" + pkg.version));
    console.log(
      "  " + gray("Packages: ") + yellow(String(PACKAGES.length)) + "\n",
    );
    process.exit(0);
  }

  // --help
  if (flags.some((f) => f === "-h" || f === "--help")) {
    const div = gray("─".repeat(60));
    console.log("\n" + div);
    console.log(
      bold(cyan("  Sunnah Package Manager")) + gray("  v" + pkg.version),
    );
    console.log(div + "\n");
    console.log("  " + bold("Usage:"));
    console.log(
      "    " + cyan("sunnah") + gray("                Open interactive UI"),
    );
    console.log(
      "    " +
        cyan("sunnah") +
        green(" --list") +
        gray("        List all packages + install status"),
    );
    console.log(
      "    " +
        cyan("sunnah") +
        green(" --update") +
        gray("      Check all installed packages for updates"),
    );
    console.log(
      "    " + cyan("sunnah") + green(" -v") + gray("            Show version"),
    );
    console.log(
      "    " +
        cyan("sunnah") +
        green(" -h") +
        gray("            Show this help"),
    );
    console.log("\n  " + bold("Interactive controls:"));
    console.log("    " + green("↑ ↓") + gray("      Navigate"));
    console.log("    " + green("space") + gray("    Toggle select"));
    console.log(
      "    " + green("a") + gray("        Select all / deselect all"),
    );
    console.log("    " + green("i") + gray("        Show package info"));
    console.log("    " + green("u") + gray("        Uninstall selected"));
    console.log("    " + green("enter") + gray("    Install selected"));
    console.log("    " + green("q") + gray("        Quit"));
    console.log("\n" + div + "\n");
    process.exit(0);
  }

  // --list
  if (flags.some((f) => f === "--list" || f === "-l")) {
    cmdList();
    process.exit(0);
  }

  // --update
  if (flags.some((f) => f === "--update")) {
    cmdUpdate();
    process.exit(0);
  }

  // ── Interactive mode ────────────────────────────────────────────────────────
  if (!process.stdin.isTTY) {
    console.error(red("\n  ✗ Interactive mode requires a TTY terminal.\n"));
    process.exit(1);
  }

  // Build cache before entering alt screen
  process.stdout.write("\n  " + gray("Checking installed packages…"));
  installedCache = buildInstalledCache();
  process.stdout.write("\r\x1b[K");

  // Enter alternate screen buffer — this completely prevents scroll issues
  enterAltScreen();
  hideCursor();

  const state = {
    cursor: 0,
    selected: new Set(),
    mode: MODE.LIST,
    confirmTarget: null,
    statusMsg: "",
  };

  let statusTimer = null;

  function setStatus(msg, ms = 2000) {
    state.statusMsg = msg;
    render(state);
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      state.statusMsg = "";
      render(state);
    }, ms);
  }

  render(state);

  const cleanup = () => {
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

    // ── Confirm uninstall mode ──────────────────────────────────────────────
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
          execSync(`${NPM} uninstall -g ${p.name}`, {
            stdio: "inherit",
            shell: isWin,
          });
          installedCache.set(p.name, false);
          state.selected.delete(PACKAGES.indexOf(p));
          console.log(
            "\n  " +
              green("✓ ") +
              bold(green(p.label)) +
              green(" uninstalled.\n"),
          );
        } catch {
          console.log("\n  " + red("✗ Failed to uninstall " + p.label + "\n"));
        }

        await sleep(1200);

        // Re-enter interactive UI
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

    // ── Normal list mode ────────────────────────────────────────────────────

    // Quit
    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      cleanup();
      console.log("\n  " + gray("Goodbye.\n"));
      process.exit(0);
    }

    // Navigate
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

    // Toggle select
    if (str === " ") {
      if (state.selected.has(state.cursor)) state.selected.delete(state.cursor);
      else state.selected.add(state.cursor);
      render(state);
      return;
    }

    // Select all / deselect all
    if (str === "a" || str === "A") {
      if (state.selected.size === PACKAGES.length) state.selected.clear();
      else PACKAGES.forEach((_, i) => state.selected.add(i));
      render(state);
      return;
    }

    // Info
    if (str === "i" || str === "I") {
      const p = PACKAGES[state.cursor];
      const inst = isInstalled(p.name);
      const version = inst ? getInstalledVersion(p.name) : null;
      const msg = `${p.label} | ${p.hadiths} hadiths | ${inst ? "v" + version + " installed" : "not installed"}`;
      setStatus(msg, 3000);
      return;
    }

    // Uninstall
    if (str === "u" || str === "U") {
      const targets =
        state.selected.size > 0 ? [...state.selected] : [state.cursor];

      // Only uninstall packages that are actually installed
      const toRemove = targets.filter((i) => isInstalled(PACKAGES[i].name));
      if (!toRemove.length) {
        setStatus("No installed packages selected to uninstall.");
        return;
      }

      // Confirm one by one
      state.mode = MODE.CONFIRM_UNINSTALL;
      state.confirmTarget = toRemove[0];
      render(state);
      return;
    }

    // Install
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

      const total = toInstall.length;
      const divW = Math.min(W() - 2, 72);
      const div = gray("─".repeat(divW));
      const div2 = gray("═".repeat(divW));

      console.log("\n" + div2);
      console.log(
        bold(cyan("  Installing ")) +
          bold(yellow(String(total))) +
          bold(cyan(" package" + (total > 1 ? "s" : "") + "…")),
      );
      console.log(div2);

      for (let i = 0; i < toInstall.length; i++) {
        const p = toInstall[i];
        console.log(
          "\n  " +
            cyan("[" + (i + 1) + "/" + total + "]") +
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
          bold(yellow(String(total))) +
          " package" +
          (total > 1 ? "s" : "") +
          " installed.",
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
