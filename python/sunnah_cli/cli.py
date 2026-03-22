"""
sunnah CLI — Python implementation with full interactive TUI.

Mirrors the npm sunnah CLI exactly — arrow keys, space, enter, all of it.
Uses curses for cross-platform terminal UI (Windows needs windows-curses).

Default (no args):  interactive TUI — arrow keys, space, enter to install
sunnah list         list all packages with status
sunnah install      install npm + pip packages
sunnah pip install  install only pip packages
sunnah search       search across installed books
sunnah random       random hadith
sunnah info         detailed book info
sunnah update       check for updates
"""
from __future__ import annotations

import argparse
import os
import sys
import subprocess
import textwrap
import time
import threading
import json
from typing import Optional

from .packages import PACKAGES, CMD_MAP, NAME_MAP, PIP_MAP
from .npm_utils import (get_npm_installed, get_npm_version, get_npm_latest,
                        npm_install, npm_uninstall)
from .pip_utils  import (get_pip_installed, get_pip_version, get_pip_latest,
                         pip_install, pip_uninstall)

VERSION = "1.5.0"

# ── Tool availability ─────────────────────────────────────────────────────────
import subprocess as _sp

def _cmd_exists(cmd: str) -> bool:
    import platform
    try:
        if platform.system() == "Windows":
            r = _sp.run(cmd + " --version", capture_output=True, timeout=4, shell=True)
        else:
            r = _sp.run([cmd, "--version"], capture_output=True, timeout=4)
        return r.returncode == 0
    except Exception:
        return False

def pip_available() -> bool:
    global _pip_avail
    if _pip_avail is None:
        # try pip3 first, then pip
        _pip_avail = _cmd_exists("pip3") or _cmd_exists("pip")
    return _pip_avail

_npm_avail: Optional[bool] = None
_pip_avail: Optional[bool] = None

def npm_available() -> bool:
    global _npm_avail
    if _npm_avail is None: _npm_avail = _cmd_exists("npm")
    return _npm_avail

def _warn_no_npm():
    print(f"\n{DIV}")
    print(yellow("  ⚠  npm is not installed or not found in PATH."))
    print(gray("  npm packages require Node.js — install it from:"))
    print(cyan("  https://nodejs.org"))
    print(f"{DIV}\n")

def _warn_no_pip():
    print(f"\n{DIV}")
    print(yellow("  ⚠  pip is not installed or not found in PATH."))
    print(gray("  Python packages require Python — install it from:"))
    print(cyan("  https://python.org"))
    print(gray("  Then run: ") + cyan("pip install sunnah"))
    print(f"{DIV}\n")

# ── Try to import curses (windows-curses on Windows) ──────────────────────────
try:
    import curses
    HAS_CURSES = True
except ImportError:
    HAS_CURSES = False

# ── ANSI colors (used in non-TUI commands) ────────────────────────────────────
R="\x1b[0m";BO="\x1b[1m";DIM="\x1b[2m";GR="\x1b[32m";YE="\x1b[33m"
CY="\x1b[36m";MA="\x1b[35m";RE="\x1b[31m";GY="\x1b[90m";WH="\x1b[97m"
def _c(col, t): return f"{col}{t}{R}"
bold    = lambda t: _c(BO,  t)
green   = lambda t: _c(GR,  t)
yellow  = lambda t: _c(YE,  t)
cyan    = lambda t: _c(CY,  t)
magenta = lambda t: _c(MA,  t)
gray    = lambda t: _c(GY,  t)
red     = lambda t: _c(RE,  t)
dim     = lambda t: _c(DIM, t)
white   = lambda t: _c(WH,  t)
DIV  = gray("─" * 60)
DIV2 = gray("═" * 60)

def _resolve(target: str) -> Optional[dict]:
    if not target: return None
    return CMD_MAP.get(target.lower()) or NAME_MAP.get(target) or PIP_MAP.get(target)

def _progress(label: str, steps: int = 30, delay: float = 0.04):
    for i in range(steps + 1):
        pct    = int(i / steps * 100)
        filled = i
        empty  = steps - i
        bar    = _c(GR, "█" * filled) + _c(GY, "░" * empty)
        sys.stdout.write(f"\r  {bar} {cyan(str(pct).rjust(3)+'%')}  {dim(label)}")
        sys.stdout.flush()
        time.sleep(delay)
    sys.stdout.write("\n")

# ═══════════════════════════════════════════════════════════════════════════════
# ── INTERACTIVE TUI (curses) ──────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════════════════

def run_tui():
    """Launch the full-screen interactive package manager."""
    if not HAS_CURSES:
        print(yellow("\n  curses not available. Install it with:"))
        print(dim("    pip install windows-curses") + "  (Windows only)\n")
        print("  Falling back to list view:\n")
        cmd_list()
        return

    try:
        curses.wrapper(_tui_main)
    except KeyboardInterrupt:
        pass

def _tui_main(stdscr):
    # ── curses setup ──────────────────────────────────────────────────────────
    curses.curs_set(0)
    curses.start_color()
    curses.use_default_colors()

    # color pairs
    curses.init_pair(1, curses.COLOR_CYAN,    -1)  # header / selected label
    curses.init_pair(2, curses.COLOR_GREEN,   -1)  # installed / checkbox
    curses.init_pair(3, curses.COLOR_YELLOW,  -1)  # hadiths / update notice
    curses.init_pair(4, curses.COLOR_RED,     -1)  # not installed / error
    curses.init_pair(5, curses.COLOR_MAGENTA, -1)  # author
    curses.init_pair(6, curses.COLOR_WHITE,   -1)  # normal text
    curses.init_pair(7, -1,                   -1)  # dim / gray (use A_DIM)

    CYAN    = curses.color_pair(1)
    GREEN   = curses.color_pair(2)
    YELLOW  = curses.color_pair(3)
    RED_    = curses.color_pair(4)
    MAG     = curses.color_pair(5)
    WHITE_  = curses.color_pair(6)
    NORMAL  = curses.color_pair(7)
    BOLD    = curses.A_BOLD
    DIM_    = curses.A_DIM

    stdscr.keypad(True)
    stdscr.timeout(100)  # non-blocking getch

    # ── state ─────────────────────────────────────────────────────────────────
    cursor    = 0
    selected  = set()
    status_msg = ""
    status_clear_time = 0
    mode      = "list"   # "list" | "confirm_uninstall"
    confirm_idx = 0
    installing  = False

    # ── installed cache (background) ─────────────────────────────────────────
    npm_status  = {p["name"]: False for p in PACKAGES}
    pip_status  = {p["pip"]:  False for p in PACKAGES}
    update_info = {}   # name -> {current, latest, has_update}
    cache_ready = threading.Event()
    update_ready = threading.Event()

    def _fetch_cache():
        if npm_available():
            npm_s = get_npm_installed([p["name"] for p in PACKAGES])
            npm_status.update(npm_s)
        if pip_available():
            pip_s = get_pip_installed([p["pip"]  for p in PACKAGES])
            pip_status.update(pip_s)
        cache_ready.set()
        # fetch version info — npm and pip share the same version number
        for p in PACKAGES:
            cur = lat = None
            if npm_available() and npm_status.get(p["name"]):
                cur = get_npm_version(p["name"])
                lat = get_npm_latest(p["name"])
            elif pip_available() and pip_status.get(p["pip"]):
                cur = get_pip_version(p["pip"])
                lat = get_pip_latest(p["pip"])
            if cur is not None:
                update_info[p["name"]] = {
                    "current": cur, "latest": lat,
                    "has_update": bool(cur and lat and cur != lat)
                }
        update_ready.set()

    t = threading.Thread(target=_fetch_cache, daemon=True)
    t.start()

    def is_inst(name): return npm_status.get(name, False)
    def is_pip(name):  return pip_status.get(name,  False)

    def set_status(msg, duration=3):
        nonlocal status_msg, status_clear_time
        status_msg = msg
        status_clear_time = time.time() + duration

    def _draw():
        stdscr.erase()
        h, w = stdscr.getmaxyx()
        divW = min(w - 2, 72)

        row = 0

        # ── header ────────────────────────────────────────────────────────────
        header = "═" * divW
        try: stdscr.addstr(row, 0, header, DIM_)
        except: pass
        row += 1

        title = f"  📚 Sunnah Package Manager  v{VERSION}"
        try:
            stdscr.addstr(row, 0, "  ")
            stdscr.addstr("📚 Sunnah Package Manager", BOLD | CYAN)
            stdscr.addstr(f"  v{VERSION}", DIM_)
        except: pass
        row += 1

        hint = "  ↑↓ nav  space select  a all  enter pip  n npm  u uninstall  U update  i info  q quit"
        try: stdscr.addstr(row, 0, hint[:w-1], DIM_)
        except: pass
        row += 1

        try: stdscr.addstr(row, 0, "═" * divW, DIM_)
        except: pass
        row += 1
        if not npm_available():
            try: stdscr.addstr(row, 0, "  ⚠ npm not found — npm packages unavailable  (nodejs.org)", YELLOW | DIM_)
            except: pass
            row += 1
        if not pip_available():
            try: stdscr.addstr(row, 0, "  ⚠ pip not found — pip packages unavailable  (python.org)", YELLOW | DIM_)
            except: pass
            row += 1
        row += 1  # blank

        # ── package list ──────────────────────────────────────────────────────
        for i, p in enumerate(PACKAGES):
            if row >= h - 4: break
            is_cursor = (i == cursor)
            is_sel    = (i in selected)
            inst      = is_inst(p["name"])

            # checkbox
            if is_sel:
                cb = "[✓]"
                cb_attr = BOLD | GREEN
            else:
                cb = "[ ]"
                cb_attr = DIM_

            # arrow
            arrow      = "▶" if is_cursor else " "
            arrow_attr = BOLD | CYAN if is_cursor else NORMAL

            # label
            if is_cursor:
                lbl_attr = BOLD | WHITE_
            elif is_sel:
                lbl_attr = BOLD | GREEN
            else:
                lbl_attr = WHITE_

            # badge — only show installed ones, shared version/update
            uc      = update_info.get(p["name"], {})
            npm_i   = is_inst(p["name"])
            pip_i   = is_pip(p["pip"])
            any_i   = npm_i or pip_i
            # build compact badge: installed labels + update notice
            labels  = []
            if npm_i: labels.append("npm")
            if pip_i: labels.append("pip")
            inst_str = ("(" + " + ".join(labels) + ")") if labels else ""
            upd_str  = "  ↑ update available" if uc.get("has_update") else ""
            if any_i:
                badge      = "  ● " + inst_str + upd_str
                badge_attr = YELLOW if uc.get("has_update") else GREEN | DIM_
            else:
                badge      = "  ○ not installed"
                badge_attr = DIM_

            try:
                stdscr.addstr(row, 0, f"  {arrow} ", arrow_attr)
                stdscr.addstr(cb, cb_attr)
                stdscr.addstr("  ")
                stdscr.addstr(p["label"], lbl_attr)
                stdscr.addstr(badge[:w - len(p["label"]) - 10], badge_attr)
            except: pass
            row += 1

            # expanded detail for cursor row
            if is_cursor:
                try: stdscr.addstr(row, 0, f"         {p['author'][:w-10]}", DIM_)
                except: pass
                row += 1
                try: stdscr.addstr(row, 0, f"         {p['desc'][:w-10]}", DIM_)
                except: pass
                row += 1

                vc = uc.get("current", "")
                vl = uc.get("latest",  "")
                try:
                    stdscr.addstr(row, 0, "         Hadiths: ", DIM_)
                    stdscr.addstr(p["hadiths"], YELLOW)
                    stdscr.addstr("   CLI: ", DIM_)
                    stdscr.addstr(p["cmd"] + " --help", CYAN)
                    # version — npm and pip share the same version
                    if vc:
                        if uc.get("has_update"):
                            stdscr.addstr(f"   v{vc} → v{vl}", YELLOW)
                        else:
                            stdscr.addstr(f"   v{vc}", CYAN)
                    if npm_i: stdscr.addstr("   npm: " + p["name"], DIM_)
                    if pip_i: stdscr.addstr("   pip: " + p["pip"],  DIM_)
                except: pass
                row += 1
                row += 1  # blank

        # ── divider ───────────────────────────────────────────────────────────
        if row < h - 2:
            try: stdscr.addstr(row, 0, "─" * divW, DIM_)
            except: pass
            row += 1

        # ── status bar ────────────────────────────────────────────────────────
        now = time.time()
        if status_msg and now < status_clear_time:
            try: stdscr.addstr(row, 0, f"  ⚠  {status_msg}"[:w-1], YELLOW)
            except: pass
        elif mode == "confirm_uninstall":
            p = PACKAGES[confirm_idx]
            try:
                stdscr.addstr(row, 0, f"  Uninstall ", RED_)
                stdscr.addstr(p["label"], BOLD | WHITE_)
                stdscr.addstr("?  ", RED_)
                stdscr.addstr("y", BOLD | GREEN)
                stdscr.addstr(" confirm   ", DIM_)
                stdscr.addstr("n", BOLD | RED_)
                stdscr.addstr(" cancel", DIM_)
            except: pass
        elif selected:
            names = ", ".join(PACKAGES[i]["name"] for i in selected)
            try:
                stdscr.addstr(row, 0, f"  ● {len(selected)} selected: ", BOLD | GREEN)
                stdscr.addstr(names[:w-20], CYAN)
            except: pass
            row += 1
            if row < h:
                try: stdscr.addstr(row, 0, "  enter=pip  n=npm  u=uninstall  U=update  i=info", DIM_)
                except: pass
        elif not cache_ready.is_set():
            try: stdscr.addstr(row, 0, "  Checking installed packages…", DIM_)
            except: pass
        else:
            try: stdscr.addstr(row, 0, "  Nothing selected — press space to select, enter to install focused", DIM_)
            except: pass

        stdscr.refresh()

    # ── install with progress ─────────────────────────────────────────────────
    def _do_install(packages_to_install):
        """Install outside curses, then re-enter TUI."""
        curses.endwin()
        divW = 60
        print("\n" + "═" * divW)
        print(f"  pip installing {len(packages_to_install)} package{'s' if len(packages_to_install)>1 else ''}…")
        print("═" * divW)
        for i, p in enumerate(packages_to_install):
            print(f"\n  [{i+1}/{len(packages_to_install)}]  {p['label']}")
            print(f"  pip install {p['pip']}\n")
            _progress("Installing…")
            if not pip_available():
                print(f"  ✗ pip not found — cannot install {p['pip']}")
                print(f"     Install Python from https://python.org")
                break
            ok = pip_install(p["pip"])
            if ok:
                pip_status[p["pip"]] = True
                print(f"  ✓ {p['label']} (pip) installed")
                print(f"  from {p['py_mod']} import {p['py_class']}")
                if npm_available(): print(f"  npm: npm install -g {p['name']}")
            else:
                print(f"  ✗ Failed to install {p['label']}")
        print("\n" + "═" * divW)
        print(f"  ✓ Done! " + ", ".join(p["cmd"] for p in packages_to_install) + " ready.")
        print("═" * divW + "\n")
        time.sleep(0.8)
        # re-init curses
        stdscr.refresh()
        curses.doupdate()

    def _do_uninstall(p):
        curses.endwin()
        print(f"\n  Uninstalling {p['label']}…\n")
        removed = False
        if npm_available() and npm_status.get(p["name"]):
            ok = npm_uninstall(p["name"])
            if ok: npm_status[p["name"]] = False; print(f"  ✓ {p['label']} (npm) uninstalled."); removed = True
            else:  print(f"  ✗ Failed to uninstall {p['label']} (npm)")
        if pip_available() and pip_status.get(p["pip"]):
            ok = pip_uninstall(p["pip"])
            if ok: pip_status[p["pip"]] = False; print(f"  ✓ {p['label']} (pip) uninstalled."); removed = True
            else:  print(f"  ✗ Failed to uninstall {p['label']} (pip)")
        if not removed:
            print(f"  ○ {p['label']} was not installed.")
        selected.discard(PACKAGES.index(p))
        print()
        time.sleep(0.8)
        stdscr.refresh()
        curses.doupdate()

    def _do_update(packages_to_update):
        curses.endwin()
        divW = 60
        print("\n" + "═" * divW)
        print(f"  Updating {len(packages_to_update)} package{'s' if len(packages_to_update)>1 else ''}…")
        print("═" * divW)
        for p, uc in packages_to_update:
            print(f"\n  {p['label']}  v{uc['current']} → v{uc['latest']}\n")
            _progress("Updating…")
            ok = npm_install(p["name"])
            if ok:
                npm_status[p["name"]] = True
                update_info[p["name"]] = {"current": uc["latest"], "latest": uc["latest"], "has_update": False}
                print(f"  ✓ {p['label']} updated to v{uc['latest']}")
            else:
                print(f"  ✗ Failed")
        print("\n" + "═" * divW + "\n")
        time.sleep(0.8)
        stdscr.refresh()
        curses.doupdate()

    # ── main event loop ───────────────────────────────────────────────────────
    while True:
        _draw()

        # clear status if expired
        if status_msg and time.time() >= status_clear_time:
            status_msg = ""

        try:
            key = stdscr.getch()
        except KeyboardInterrupt:
            break

        if key == -1:
            continue  # timeout — just redraw

        # ── quit ──────────────────────────────────────────────────────────────
        if key in (ord("q"), ord("Q"), 27):  # q, Q, ESC
            break

        # ── confirm uninstall mode ────────────────────────────────────────────
        if mode == "confirm_uninstall":
            if key in (ord("y"), ord("Y")):
                p = PACKAGES[confirm_idx]
                mode = "list"
                _do_uninstall(p)
            elif key in (ord("n"), ord("N"), 27):
                mode = "list"
            continue

        # ── navigation ────────────────────────────────────────────────────────
        if key == curses.KEY_UP:
            cursor = (cursor - 1) % len(PACKAGES)
            continue
        if key == curses.KEY_DOWN:
            cursor = (cursor + 1) % len(PACKAGES)
            continue

        # ── space: toggle select ──────────────────────────────────────────────
        if key == ord(" "):
            if cursor in selected:
                selected.discard(cursor)
            else:
                selected.add(cursor)
            continue

        # ── a: select all / deselect all ─────────────────────────────────────
        if key in (ord("a"), ord("A")):
            if len(selected) == len(PACKAGES):
                selected.clear()
            else:
                selected.update(range(len(PACKAGES)))
            continue

        # ── i: info ───────────────────────────────────────────────────────────
        if key in (ord("i"), ord("I")):
            p    = PACKAGES[cursor]
            inst = is_inst(p["name"])
            uc   = update_info.get(p["name"], {})
            ver  = uc.get("current", "")
            msg  = f"{p['label']}  |  {p['hadiths']} hadiths  |  " + (f"v{ver} installed" if inst else "not installed") + f"  |  pip: {p['pip']}"
            set_status(msg, 4)
            continue

        # ── n: npm install ────────────────────────────────────────────────────
        if key in (ord("n"), ord("N")):
            if not npm_available():
                set_status("npm not found — install Node.js from nodejs.org", 5)
            else:
                targets    = [PACKAGES[i] for i in selected] if selected else [PACKAGES[cursor]]
                to_install = [p for p in targets if not is_inst(p["name"])]
                if not to_install:
                    set_status("All selected already installed via npm.")
                else:
                    curses.endwin()
                    divW2 = 60
                    print(f"\n{'═'*divW2}")
                    print(f"  npm installing {len(to_install)} package{'s' if len(to_install)>1 else ''}…")
                    print("═"*divW2)
                    for i2, p2 in enumerate(to_install):
                        print(f"\n  [{i2+1}/{len(to_install)}]  {p2['label']}")
                        print(f"  npm install -g {p2['name']}\n")
                        _progress("Installing…")
                        ok = npm_install(p2["name"])
                        if ok:
                            npm_status[p2["name"]] = True
                            print(f"  ✓ {p2['label']} (npm) installed")
                            print(f"  Usage: {p2['cmd']} --help")
                        else:
                            print(f"  ✗ Failed to install {p2['label']}")
                    print(f"\n{'═'*divW2}\n")
                    time.sleep(0.6)
                    stdscr.refresh()
                    curses.doupdate()
            continue

        # ── u: uninstall ──────────────────────────────────────────────────────
        if key in (ord("u"),):
            targets   = list(selected) if selected else [cursor]
            to_remove = [i for i in targets if is_inst(PACKAGES[i]["name"]) or is_pip(PACKAGES[i]["pip"])]
            if not to_remove:
                set_status("No installed packages selected.")
            else:
                mode        = "confirm_uninstall"
                confirm_idx = to_remove[0]
            continue

        # ── U: update ─────────────────────────────────────────────────────────
        if key in (ord("U"),):
            targets   = list(selected) if selected else [cursor]
            to_update = [(PACKAGES[i], update_info[PACKAGES[i]["name"]])
                         for i in targets
                         if (is_inst(PACKAGES[i]["name"]) or is_pip(PACKAGES[i]["pip"])) and update_info.get(PACKAGES[i]["name"], {}).get("has_update")]
            if not to_update:
                msg = "All selected packages are up to date." if update_ready.is_set() else "Update info still loading — try again shortly."
                set_status(msg)
            else:
                _do_update(to_update)
            continue

        # ── enter: install ────────────────────────────────────────────────────
        if key in (curses.KEY_ENTER, 10, 13):
            targets    = [PACKAGES[i] for i in selected] if selected else [PACKAGES[cursor]]
            to_install = [p for p in targets if not is_pip(p["pip"])]
            if not to_install:
                set_status("All selected already installed via pip.")
            else:
                _do_install(to_install)
            continue

# ═══════════════════════════════════════════════════════════════════════════════
# ── Non-interactive commands ──────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════════════════

def cmd_list():
    npm_s = get_npm_installed([p["name"] for p in PACKAGES])
    pip_s = get_pip_installed([p["pip"]  for p in PACKAGES])
    print(f"\n{DIV2}\n  {bold(cyan('Available Sunnah Packages'))}\n{DIV2}")
    for p in PACKAGES:
        n  = npm_s[p["name"]]
        pi = pip_s[p["pip"]]
        nv = get_npm_version(p["name"]) if n  else None
        nl = get_npm_latest(p["name"])  if n  else None
        vStr = ""
        if n and nv and nl:
            vStr = dim(gray(f"  v{nv} (up to date)")) if nv == nl else yellow(f"  v{nv}") + gray(" → ") + green(f"v{nl}") + yellow(" ↑")
        elif n and nv:
            vStr = dim(gray(f"  v{nv}"))
        print(f"\n  {bold(white(p['label']))}{green('  ✓ npm') if n else red('  ✗ npm')}{green('  ✓ pip') if pi else gray('  ○ pip')}{vStr}")
        print(f"  {cyan('npm install -g '+p['name'])}   {dim('pip install '+p['pip'])}")
        print(f"  {dim(p['desc'])}")
        print(f"  {gray('Hadiths: ')}{yellow(p['hadiths'])}   {gray('Author: ')}{magenta(p['author'])}")
        if n:  print(f"  {gray('CLI: ')}{cyan(p['cmd']+' --help')}")
        if pi: print(f"  {gray('Python: ')}{dim('from '+p['py_mod']+' import '+p['py_class'])}")
    print(f"\n{DIV2}\n")

def cmd_info(target: str):
    p = _resolve(target)
    if not p:
        print(red(f"\n  Unknown book: \"{target}\"\n"))
        print("  Available: " + ", ".join(cyan(x["cmd"]) for x in PACKAGES) + "\n")
        sys.exit(1)
    n  = get_npm_installed([p["name"]])[p["name"]]
    pi = get_pip_installed([p["pip"]])[p["pip"]]
    nv = get_npm_version(p["name"])      if n  else None
    pv = get_pip_version(p["pip"])  if pi else None
    print(f"\n{DIV2}\n  {bold(cyan(p['label']))}\n{DIV2}")
    print(f"  {gray('Author:  ')}{magenta(p['author'])}")
    print(f"  {gray('Hadiths: ')}{yellow(p['hadiths'])}")
    print(f"  {gray('npm:     ')}{cyan(p['name'])}{green(f'  ✓ v{nv}') if n else red('  ✗ not installed')}")
    print(f"  {gray('pip:     ')}{cyan(p['pip'])}{green(f'  ✓ v{pv}') if pi else red('  ✗ not installed')}")
    print(f"  {gray('CLI:     ')}{cyan(p['cmd']+' --help')}")
    print(f"  {gray('Python:  ')}{dim('from '+p['py_mod']+' import '+p['py_class'])}")
    print(f"  {gray('Desc:    ')}{p['desc']}")
    print(DIV)
    if not n:  print(f"  {yellow('npm:')} sunnah install {p['cmd']}")
    if not pi: print(f"  {yellow('pip:')} sunnah pip install {p['cmd']}")
    print(f"{DIV2}\n")

def cmd_random(book_cmd: Optional[str] = None):
    import random as _random
    pip_s = get_pip_installed([p["pip"] for p in PACKAGES])
    pip_i = [p for p in PACKAGES if pip_s[p["pip"]]]
    if not pip_i:
        print(yellow("\n  No pip packages installed. Run: sunnah pip install <book>\n"))
        sys.exit(0)
    target = CMD_MAP.get(book_cmd.lower()) if book_cmd else _random.choice(pip_i)
    if not target:
        print(red(f"\n  Unknown: {book_cmd}\n")); sys.exit(1)
    try:
        mod  = __import__(target["py_mod"], fromlist=[target["py_class"]])
        cls  = getattr(mod, target["py_class"])
        book = cls()
        h    = book.getRandom()
        print(f"\n{DIV2}")
        print(f"  {bold(cyan('Hadith #'+str(h.id)))}  {gray('|')}  {bold(target['label'])}")
        print(DIV2)
        if h.narrator: print(f"  {bold(yellow('Narrator: '))}{magenta(h.narrator)}")
        if h.text: print(f"\n  {h.text}")
        print(f"\n{DIV2}\n")
        print(f"  {gray('Try: ')}{cyan(target['cmd']+' '+str(h.id)+' -b')}{gray('  (Arabic + English)')}\n")
    except Exception as e:
        print(red(f"\n  Could not load {target['label']}: {e}\n"))

def cmd_search(query: str, show_all: bool = False):
    if not query:
        print(red('\n  Usage: sunnah search "<query>" [--all]\n')); sys.exit(1)
    pip_s = get_pip_installed([p["pip"] for p in PACKAGES])
    to_search = [p for p in PACKAGES if pip_s[p["pip"]]]
    if not to_search:
        print(yellow("\n  No pip packages installed. Run: sunnah pip install <book>\n")); sys.exit(0)
    print(f"\n{DIV2}")
    print(f"  {bold(cyan('Searching across '))+yellow(str(len(to_search)))+bold(cyan(' book'+('s' if len(to_search)>1 else '')+'…'))}")
    print(f"{DIV2}\n")
    import re
    total = 0
    for p in to_search:
        sys.stdout.write(f"  {gray('Loading ')}{white(p['label'])}{gray('…')}\r"); sys.stdout.flush()
        try:
            mod  = __import__(p["py_mod"], fromlist=[p["py_class"]])
            cls  = getattr(mod, p["py_class"])
            book = cls()
            results = book.search(query)
            sys.stdout.write("\x1b[K")
            if not results:
                print(f"  {dim(gray('○ '+p['label']+' — no results'))}"); continue
            total += len(results)
            limit = len(results) if show_all else min(3, len(results))
            print(f"  {green('▸')} {bold(p['label'])}{gray('  '+str(len(results))+' results')}")
            print(DIV)
            for i, h in enumerate(results[:limit]):
                print(f"\n  {bold(green('#'+str(i+1)))}{gray('  Hadith '+str(h.id))}")
                if h.narrator: print(f"  {bold(yellow('Narrator: '))}{magenta(h.narrator)}")
                if h.text:
                    txt = h.text[:200] + ("…" if len(h.text) > 200 else "")
                    hi  = re.sub(f"({re.escape(query)})", f"\x1b[1m\x1b[33m\\1{R}", txt, flags=re.IGNORECASE)
                    print(f"  {hi}")
                print(dim(gray(f"  {p['cmd']} {h.id} -b")))
            if not show_all and len(results) > 3:
                print(f"\n  {dim('Showing 3 of '+str(len(results))+'.')}{yellow(f'  sunnah search \"{query}\" --all')}")
            print(DIV)
        except Exception:
            sys.stdout.write("\x1b[K"); print(f"  {gray('○ '+p['label']+' — skipped')}")
    print(f"\n{DIV2}\n  {green('✓')} {bold(str(total))} {gray('total results.')}\n{DIV2}\n")

def cmd_install(targets: list):
    if not targets:
        print(red("\n  Usage: sunnah install <book>\n")); sys.exit(1)
    if not npm_available(): _warn_no_npm(); sys.exit(1)
    to = []
    for t in targets:
        p = _resolve(t)
        if not p: print(yellow(f"\n  Unknown: \"{t}\"")); sys.exit(1)
        to.append(p)
    print(f"\n{DIV2}\n  {bold(cyan('Installing '))+bold(yellow(str(len(to))))+bold(cyan(' package'+('s' if len(to)>1 else '')+'…'))}\n{DIV2}")
    for i, p in enumerate(to):
        print(f"\n  {cyan(f'[{i+1}/{len(to)}]')}  {bold(white(p['label']))}")
        print(f"  {dim('npm install -g '+p['name'])}\n")
        _progress("Installing…")
        ok = npm_install(p["name"])
        if ok:
            print(f"  {green('✓')} {bold(green(p['label']))} installed")
            print(f"  {gray('Usage: ')}{cyan(p['cmd']+' --help')}")
            print(f"  {gray('Python: ')}{dim('pip install '+p['pip'])}")
        else:
            print(f"  {red('✗')} Failed to install {p['label']}")
    print(f"\n{DIV2}\n  {green('✓ Done! ')}"+", ".join(bold(cyan(p["cmd"])) for p in to)+gray(" ready.")+f"\n{DIV2}\n")

def cmd_uninstall(targets: list):
    if not targets:
        print(red("\n  Usage: sunnah uninstall <book>\n")); sys.exit(1)
    if not npm_available(): _warn_no_npm(); sys.exit(1)
    npm_s = get_npm_installed([p["name"] for p in PACKAGES])
    print(f"\n{DIV2}")
    for t in targets:
        p = _resolve(t)
        if not p: print(yellow(f"  Unknown: \"{t}\"")); continue
        if not npm_s[p["name"]]: print(gray(f"  ○ {p['label']} not installed.")); continue
        print(yellow(f"  Uninstalling ") + bold(white(p["label"])) + yellow("…"))
        ok = npm_uninstall(p["name"])
        if ok: print(green(f"  ✓ {p['label']} uninstalled.\n"))
        else:  print(red(f"  ✗ Failed\n"))
    print(f"{DIV2}\n")

def cmd_update(auto_install: bool = False):
    if not npm_available(): _warn_no_npm(); return
    npm_s = get_npm_installed([p["name"] for p in PACKAGES])
    inst  = [p for p in PACKAGES if npm_s[p["name"]]]
    if not inst:
        print(yellow("\n  No npm packages installed.\n")); return
    print(f"\n{DIV2}\n  {bold(cyan('Checking for updates…'))}\n{DIV2}\n")
    ups = []
    for p in inst:
        sys.stdout.write(f"  {gray('Checking ')}{white(p['label'])}{gray('…')}\r"); sys.stdout.flush()
        cur = get_npm_version(p["name"]); lat = get_npm_latest(p["name"])
        sys.stdout.write("\x1b[K")
        if not cur or not lat: print(f"  {yellow('?')} {bold(p['label'])}  {gray('(could not check)')}"); continue
        if cur == lat: print(f"  {green('✓')} {bold(p['label'])}  {gray('v'+cur+' — up to date')}")
        else: ups.append((p,cur,lat)); print(f"  {yellow('↑')} {bold(p['label'])}  {gray('v'+cur)} → {green('v'+lat)}  {yellow('(update available)')}")
    print(f"\n{DIV}")
    if not ups: print(f"  {green('✓ All packages are up to date.')}"); print(f"{DIV}\n"); return
    print(f"  {yellow(str(len(ups)))} update{'s' if len(ups)>1 else ''} available.")
    if auto_install:
        for p,cur,lat in ups:
            print(f"\n  {p['label']}  v{cur} → v{lat}\n"); _progress("Updating…"); npm_install(p["name"])
            print(f"  {green('✓')} {bold(p['label'])} updated to v{lat}")
        print(f"\n{DIV2}\n  {green('✓ All updates installed.')}\n{DIV2}\n")
    else:
        print(f"  Run {bold(cyan('sunnah update --install'))} to install all.")
        for p,_,_ in ups: print(f"    {dim('sunnah install '+p['cmd'])}")
        print(f"{DIV}\n")

def cmd_pip_install(targets: list):
    if not targets:
        print(red("\n  Usage: sunnah pip install <book>\n")); sys.exit(1)
    if not pip_available(): _warn_no_pip(); sys.exit(1)
    to = []
    for t in targets:
        p = _resolve(t)
        if not p: print(yellow(f"\n  Unknown: \"{t}\"")); sys.exit(1)
        to.append(p)
    print(f"\n{DIV2}\n  {bold(cyan('Installing '))+bold(yellow(str(len(to))))+bold(cyan(' Python package'+('s' if len(to)>1 else '')+'…'))}\n{DIV2}")
    for i, p in enumerate(to):
        print(f"\n  {cyan(f'[{i+1}/{len(to)}]')}  {bold(white(p['label']))}")
        print(f"  {dim('pip install '+p['pip'])}\n")
        _progress("Installing…")
        ok = pip_install(p["pip"])
        if ok:
            print(f"  {green('✓')} {bold(green(p['label']))} (Python) installed")
            print(f"  {gray('Usage: ')}{dim('from '+p['py_mod']+' import '+p['py_class'])}")
        else:
            print(f"  {red('✗')} Failed")
    print(f"\n{DIV2}\n")

def cmd_pip_list():
    pip_s = get_pip_installed([p["pip"] for p in PACKAGES])
    print(f"\n{DIV}\n  {bold(cyan('Python (pip) Packages'))}\n{DIV}")
    for p in PACKAGES:
        i = pip_s[p["pip"]]; v = get_pip_version(p["pip"]) if i else None
        print(f"\n  {bold(white(p['label']))}{green(f'  ✓ v{v}') if i else red('  ✗ not installed')}")
        print(f"  {dim('pip install '+p['pip'])}")
        if i: print(f"  {gray('from ')}{cyan(p['py_mod'])}{gray(' import ')}{cyan(p['py_class'])}")
    print(f"\n{DIV}\n")

def cmd_pip_update(auto_install: bool = False):
    if not pip_available(): _warn_no_pip(); return
    pip_s = get_pip_installed([p["pip"] for p in PACKAGES])
    inst  = [p for p in PACKAGES if pip_s[p["pip"]]]
    if not inst:
        print(yellow("\n  No pip packages installed.\n")); return
    print(f"\n{DIV2}\n  {bold(cyan('Checking Python packages for updates…'))}\n{DIV2}\n")
    ups = []
    for p in inst:
        sys.stdout.write(f"  {gray('Checking ')}{white(p['label'])}{gray('…')}\r"); sys.stdout.flush()
        cur = get_pip_version(p["pip"]); lat = get_pip_latest(p["pip"])
        sys.stdout.write("\x1b[K")
        if not cur or not lat: print(f"  {yellow('?')} {bold(p['label'])}  {gray('(could not check)')}"); continue
        if cur == lat: print(f"  {green('✓')} {bold(p['label'])}  {gray('v'+cur+' — up to date')}")
        else: ups.append((p,cur,lat)); print(f"  {yellow('↑')} {bold(p['label'])}  {gray('v'+cur)} → {green('v'+lat)}  {yellow('(update available)')}")
    print(f"\n{DIV2}")
    if not ups: print(f"  {green('✓ All Python packages are up to date.')}"); print(f"{DIV2}\n"); return
    print(f"  {yellow(str(len(ups)))} update{'s' if len(ups)>1 else ''} available.")
    if auto_install:
        for p,cur,lat in ups:
            _progress(f"Updating {p['label']}…"); pip_install(p["pip"])
            print(f"  {green('✓')} {bold(p['label'])} updated to v{lat}")
    else:
        print(f"  Run {bold(cyan('sunnah pip update --install'))} to install all.")
    print(f"{DIV2}\n")

def cmd_version():
    npm_s = get_npm_installed([p["name"] for p in PACKAGES])
    pip_s = get_pip_installed([p["pip"]  for p in PACKAGES])
    n_i   = [p for p in PACKAGES if npm_s[p["name"]]]
    p_i   = [p for p in PACKAGES if pip_s[p["pip"]]]
    print(f"\n{DIV}\n  {bold(cyan('📿 sunnah'))}{gray('  v'+VERSION)}\n{DIV}")
    print(f"  {gray('Available  : ')}{yellow(str(len(PACKAGES)))}")
    print(f"  {gray('npm inst.  : ')}{green(str(len(n_i)))}{gray(' / '+str(len(PACKAGES)))}")
    print(f"  {gray('pip inst.  : ')}{(green(str(len(p_i))) if p_i else gray('0'))}{gray(' / '+str(len(PACKAGES)))}")
    if n_i:
        print(f"  {gray('Collection : ')}"+gray(', ').join(cyan(p['label']) for p in n_i))
        total = sum(int(p["hadiths"].replace(",","")) for p in n_i)
        print(f"  {gray('Hadiths    : ')}{bold(yellow(f'{total:,}'))}")
    print(f"\n{DIV}\n")

def cmd_help():
    npm_s = get_npm_installed([p["name"] for p in PACKAGES])
    print(f"\n{DIV}\n  {bold(cyan('📿 Sunnah Package Manager'))}{gray('  v'+VERSION)}\n{DIV}")
    print(f"\n  {bold('Commands:')}")
    cmds = [
        ("sunnah",                        "Open interactive TUI  ← arrow keys, space, enter"),
        ("sunnah list",                   "List all packages"),
        ("sunnah install <book>",         "Install npm package(s)"),
        ("sunnah uninstall <book>",       "Uninstall npm package(s)"),
        ("sunnah update",                 "Check npm packages for updates"),
        ("sunnah update --install",       "Auto-install all updates"),
        ("sunnah pip install <book>",     "Install Python package(s)"),
        ("sunnah pip uninstall <book>",   "Uninstall Python package(s)"),
        ("sunnah pip list",               "Python package status"),
        ("sunnah pip update",             "Check pip packages for updates"),
        ('sunnah search "<query>"',       "Search across all installed books"),
        ("sunnah random [book]",          "Random hadith"),
        ("sunnah info <book>",            "Detailed book info"),
        ("sunnah -v",                     "Version + stats"),
        ("sunnah -h",                     "This help"),
    ]
    for cmd, desc in cmds:
        print(f"    {cyan(cmd.ljust(32))}{gray(desc)}")
    print(f"\n  {bold('Books:')}")
    for p in PACKAGES:
        inst = npm_s[p["name"]]
        print(f"    {cyan(p['cmd'].ljust(12))}{gray(p['name'].ljust(26))}{yellow(p['hadiths']+' hadiths')}{green('  ✓') if inst else ''}")
    print(f"\n  {bold('Interactive UI:')}")
    for k, d in [("↑↓","Navigate"),("space","Toggle select"),("a","All/none"),
                 ("i","Info"),("u","Uninstall"),("U","Update"),("enter","Install"),("q","Quit")]:
        print(f"    {green(k.ljust(8))}{gray(d)}")
    print(f"\n{DIV}\n")


# ── Main entry point ──────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(prog="sunnah", add_help=False)
    parser.add_argument("args",      nargs="*")
    parser.add_argument("--version", "-v", action="store_true")
    parser.add_argument("--help",    "-h", action="store_true")
    parser.add_argument("--all",     action="store_true")
    parser.add_argument("--install", action="store_true")
    parser.add_argument("--list",    "-l", action="store_true")
    parsed = parser.parse_args()
    args   = parsed.args

    if parsed.version:        cmd_version(); return
    if parsed.help:           cmd_help();    return
    if parsed.list:           cmd_list();    return

    # no args → interactive TUI
    if not args:
        run_tui()
        return

    sub = args[0].lower()

    if sub == "list":                    cmd_list();                            return
    if sub == "install":                 cmd_install(args[1:]);                 return
    if sub == "uninstall":               cmd_uninstall(args[1:]);               return
    if sub == "update":                  cmd_update(parsed.install);            return
    if sub == "info":                    cmd_info(args[1] if len(args)>1 else ""); return
    if sub == "random":                  cmd_random(args[1] if len(args)>1 else None); return
    if sub == "search":
        cmd_search(" ".join(args[1:]), show_all=parsed.all); return
    if sub == "pip":
        if len(args) < 2:
            print(red("\n  Usage: sunnah pip <install|uninstall|list|update> [book]\n")); sys.exit(1)
        pip_sub = args[1].lower()
        if pip_sub == "install":   cmd_pip_install(args[2:]);             return
        if pip_sub == "uninstall":
            for t in args[2:]:
                p = _resolve(t)
                if p: pip_uninstall(p["pip"])
            return
        if pip_sub == "list":      cmd_pip_list();                        return
        if pip_sub == "update":    cmd_pip_update(parsed.install);        return
        print(red(f"\n  Unknown pip subcommand: {args[1]}\n")); sys.exit(1)

    # treat bare word as book info shorthand
    p = _resolve(sub)
    if p: cmd_info(sub); return

    print(red(f"\n  Unknown command: \"{sub}\". Run sunnah --help\n")); sys.exit(1)

if __name__ == "__main__":
    main()
