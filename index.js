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

// ── Terminal helpers ──────────────────────────────────────────────────────────
const W = () => process.stdout.columns || 80;

function clearLine() {
  process.stdout.write("\r\x1b[K");
}

function moveUp(n) {
  if (n > 0) process.stdout.write(`\x1b[${n}A`);
}

function hideCursor() {
  process.stdout.write("\x1b[?25l");
}
function showCursor() {
  process.stdout.write("\x1b[?25h");
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function drawBar(label, percent, barWidth = 38) {
  const filled = Math.round((percent / 100) * barWidth);
  const empty = barWidth - filled;
  const bar =
    c.green + "█".repeat(filled) + c.gray + "░".repeat(empty) + c.reset;
  const pct = cyan(String(Math.round(percent)).padStart(3) + "%");
  return `  ${bar} ${pct}  ${dim(label)}`;
}

// ── Install a package with animated progress bar ──────────────────────────────
function animateInstall(pkgName) {
  return new Promise((resolve) => {
    const stages = [
      { label: "Resolving packages…", end: 12, ms: 90 },
      { label: "Fetching metadata…", end: 28, ms: 70 },
      { label: "Downloading tarball…", end: 72, ms: 25 },
      { label: "Extracting files…", end: 88, ms: 55 },
      { label: "Linking binaries…", end: 98, ms: 90 },
    ];

    let percent = 0;
    let stageIdx = 0;
    let npmDone = false;

    // Print initial bar on its own line
    process.stdout.write(drawBar(stages[0].label, 0) + "\n");

    const tick = () => {
      const stage = stages[stageIdx];
      if (!stage) return;

      const prevEnd = stageIdx > 0 ? stages[stageIdx - 1].end : 0;
      const step = (stage.end - prevEnd) / 22;
      percent = Math.min(percent + step, stage.end);

      // Overwrite the bar line
      process.stdout.write("\r\x1b[K");
      process.stdout.write(drawBar(stage.label, percent));

      if (percent >= stage.end) {
        stageIdx++;
        if (stageIdx >= stages.length) {
          // All visual stages done — wait for npm
          const poll = setInterval(() => {
            if (npmDone) {
              clearInterval(poll);
              process.stdout.write("\r\x1b[K");
              process.stdout.write(drawBar("Complete!", 100));
              process.stdout.write("\n");
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
    const proc = spawn("npm", ["install", "-g", pkgName], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    proc.on("close", () => {
      npmDone = true;
    });
  });
}

// ── Check if a package is already installed globally ─────────────────────────
function isInstalled(name) {
  try {
    execSync(`npm list -g ${name} --depth=0 2>/dev/null`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// ── Render the interactive list ───────────────────────────────────────────────
const DIV_W = () => Math.min(W() - 2, 70);

function renderList(selected, cursor) {
  const div = gray("─".repeat(DIV_W()));
  const div2 = gray("═".repeat(DIV_W()));
  const lines = [];

  lines.push("");
  lines.push(div2);
  lines.push(
    bold(cyan("  📚 Sunnah Package Manager")) + gray("  v" + pkg.version),
  );
  lines.push(
    gray("  ↑↓ navigate  ") +
      gray("space select  ") +
      gray("a all  ") +
      gray("enter install  ") +
      gray("q quit"),
  );
  lines.push(div2);
  lines.push("");

  PACKAGES.forEach((p, i) => {
    const isCursor = i === cursor;
    const isSelected = selected.has(i);
    const installed = isInstalled(p.name);

    const checkbox = isSelected ? green("[✓]") : gray("[ ]");
    const arrow = isCursor ? cyan("▶") : " ";
    const label = isCursor
      ? bold(white(p.label))
      : isSelected
        ? green(p.label)
        : white(p.label);
    const badge = installed ? dim(gray("  (installed)")) : "";

    lines.push(`  ${arrow} ${checkbox}  ${label}${badge}`);

    if (isCursor) {
      lines.push(`         ${dim(p.author)}`);
      lines.push(`         ${gray(p.desc)}`);
      lines.push(
        `         ${gray("Hadiths: ")}${yellow(p.hadiths)}   ${gray("CLI: ")}${cyan(p.cmd + " --help")}`,
      );
      lines.push("");
    }
  });

  lines.push("");
  lines.push(div);

  const count = selected.size;
  if (count > 0) {
    const names = [...selected].map((i) => cyan(PACKAGES[i].name)).join(", ");
    lines.push(`  ${green("●")} ${bold(String(count))} selected: ${names}`);
  } else {
    lines.push(
      `  ${gray("Nothing selected — press space to select a package")}`,
    );
  }
  lines.push(div);
  lines.push("");

  return lines;
}

function printLines(lines) {
  process.stdout.write(lines.join("\n") + "\n");
}

function eraseLines(n) {
  for (let i = 0; i < n; i++) {
    clearLine();
    if (i < n - 1) moveUp(1);
  }
  clearLine();
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const rawArgs = process.argv.slice(2);
  const flags = rawArgs.filter((a) => a.startsWith("-"));

  // --version
  if (flags.some((f) => f === "-v" || f === "--version")) {
    console.log("");
    console.log("  " + bold(cyan("sunnah")) + gray(" v" + pkg.version));
    console.log(
      "  " + gray("Available packages: ") + yellow(String(PACKAGES.length)),
    );
    console.log("");
    process.exit(0);
  }

  // --help
  if (flags.some((f) => f === "-h" || f === "--help")) {
    const div = gray("─".repeat(60));
    console.log("");
    console.log(div);
    console.log(
      bold(cyan("  Sunnah Package Manager")) + gray("  v" + pkg.version),
    );
    console.log(div);
    console.log("");
    console.log("  " + bold("Usage:"));
    console.log(
      "    " +
        cyan("sunnah") +
        gray("               Open interactive installer"),
    );
    console.log(
      "    " +
        cyan("sunnah") +
        green(" --list") +
        gray("       List all available packages"),
    );
    console.log(
      "    " + cyan("sunnah") + green(" -v") + gray("           Show version"),
    );
    console.log(
      "    " +
        cyan("sunnah") +
        green(" -h") +
        gray("           Show this help"),
    );
    console.log("");
    console.log("  " + bold("Controls (interactive mode):"));
    console.log("    " + green("↑ ↓") + gray("     Navigate packages"));
    console.log("    " + green("space") + gray("   Toggle selection"));
    console.log("    " + green("a") + gray("       Toggle all / deselect all"));
    console.log("    " + green("enter") + gray("   Install selected packages"));
    console.log("    " + green("q") + gray("       Quit"));
    console.log("");
    console.log(div);
    console.log("");
    process.exit(0);
  }

  // --list
  if (flags.some((f) => f === "--list" || f === "-l")) {
    const div = gray("─".repeat(60));
    console.log("");
    console.log(div);
    console.log(bold(cyan("  Available Sunnah Packages")));
    console.log(div);
    PACKAGES.forEach((p) => {
      const inst = isInstalled(p.name) ? green("  ✓ installed") : "";
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
    process.exit(0);
  }

  // ── Interactive mode ────────────────────────────────────────────────────────
  if (!process.stdin.isTTY) {
    console.error(red("\n  ✗ Interactive mode requires a TTY terminal.\n"));
    process.exit(1);
  }

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  hideCursor();

  let cursor = 0;
  let selected = new Set();
  let prevCount = 0;

  const draw = () => {
    const lines = renderList(selected, cursor);
    if (prevCount > 0) eraseLines(prevCount);
    printLines(lines);
    prevCount = lines.length;
  };

  draw();

  const cleanup = () => {
    showCursor();
    try {
      process.stdin.setRawMode(false);
    } catch {}
    process.stdin.pause();
  };

  process.on("SIGINT", () => {
    cleanup();
    console.log("");
    process.exit(0);
  });

  process.stdin.on("keypress", async (str, key) => {
    if (!key) return;

    // Quit
    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      cleanup();
      if (prevCount > 0) eraseLines(prevCount);
      console.log("\n  " + gray("Goodbye.\n"));
      process.exit(0);
    }

    // Navigate
    if (key.name === "up") {
      cursor = (cursor - 1 + PACKAGES.length) % PACKAGES.length;
      draw();
      return;
    }
    if (key.name === "down") {
      cursor = (cursor + 1) % PACKAGES.length;
      draw();
      return;
    }

    // Toggle selection
    if (str === " ") {
      if (selected.has(cursor)) selected.delete(cursor);
      else selected.add(cursor);
      draw();
      return;
    }

    // Toggle all
    if (str === "a" || str === "A") {
      if (selected.size === PACKAGES.length) selected.clear();
      else PACKAGES.forEach((_, i) => selected.add(i));
      draw();
      return;
    }

    // Install
    if (key.name === "return") {
      if (selected.size === 0) return;

      cleanup();
      if (prevCount > 0) eraseLines(prevCount);

      const toInstall = [...selected].map((i) => PACKAGES[i]);
      const total = toInstall.length;
      const div = gray("─".repeat(DIV_W()));
      const div2 = gray("═".repeat(DIV_W()));

      console.log("");
      console.log(div2);
      console.log(
        bold(cyan("  Installing ")) +
          bold(yellow(String(total))) +
          bold(cyan(" package" + (total > 1 ? "s" : "") + "…")),
      );
      console.log(div2);

      for (let i = 0; i < toInstall.length; i++) {
        const p = toInstall[i];
        console.log("");
        console.log(
          `  ${cyan("[" + (i + 1) + "/" + total + "]")}  ${bold(white(p.label))}`,
        );
        console.log(`  ${dim("npm install -g " + p.name)}`);
        console.log("");

        await animateInstall(p.name);

        console.log(
          `  ${green("✓")} ${bold(green(p.label))} installed successfully`,
        );
        console.log(`  ${gray("Usage: ")}${cyan(p.cmd + " --help")}`);
      }

      console.log("");
      console.log(div2);
      console.log(
        `  ${green("✓")} All done! ` +
          bold(yellow(String(total))) +
          ` package${total > 1 ? "s" : ""} installed globally.`,
      );
      console.log("");
      toInstall.forEach((p) => {
        console.log(
          `  ${cyan("▸")} ${bold(p.cmd)} ${gray("--help")}  ${dim("·")}  ${dim(p.label)}`,
        );
      });
      console.log(div2);
      console.log("");

      showCursor();
      process.exit(0);
    }
  });
}

main().catch((err) => {
  showCursor();
  console.error(red("\n  ✗ " + err.message + "\n"));
  process.exit(1);
});
