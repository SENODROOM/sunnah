"""npm utilities — check/install/update npm hadith packages."""
import subprocess, sys, json, platform
from typing import Optional

_IS_WIN = platform.system() == "Windows"

def _npm(args: list, timeout: int = 10) -> str:
    try:
        if _IS_WIN:
            # Use shell=True so Windows finds npm.cmd
            r = subprocess.run("npm " + " ".join(args), capture_output=True,
                               text=True, timeout=timeout, shell=True)
        else:
            r = subprocess.run(["npm"] + args, capture_output=True,
                               text=True, timeout=timeout)
        return r.stdout or ""
    except Exception:
        return ""

def get_npm_installed(package_names: list) -> dict:
    """Returns {name: bool} for each package."""
    result = {n: False for n in package_names}
    try:
        out = _npm(["list", "-g", "--depth=0", "--json"], timeout=8)
        deps = json.loads(out).get("dependencies", {})
        for n in package_names:
            result[n] = n in deps
    except Exception:
        out = _npm(["list", "-g", "--depth=0"], timeout=8)
        for n in package_names:
            result[n] = n in out
    return result

def get_npm_version(name: str) -> Optional[str]:
    try:
        out = _npm(["list", "-g", name, "--depth=0", "--json"], timeout=6)
        return json.loads(out).get("dependencies", {}).get(name, {}).get("version")
    except Exception:
        return None

def get_npm_latest(name: str) -> Optional[str]:
    try:
        out = _npm(["show", name, "version", "--json"], timeout=8)
        return json.loads(out.strip())
    except Exception:
        try:
            return _npm(["show", name, "version"], timeout=8).strip() or None
        except Exception:
            return None

def npm_install(name: str) -> bool:
    try:
        if _IS_WIN:
            r = subprocess.run(f"npm install -g {name}", timeout=180, shell=True)
        else:
            r = subprocess.run(["npm", "install", "-g", name], timeout=180)
        return r.returncode == 0
    except Exception:
        return False

def npm_uninstall(name: str) -> bool:
    try:
        if _IS_WIN:
            r = subprocess.run(f"npm uninstall -g {name}", timeout=60, shell=True)
        else:
            r = subprocess.run(["npm", "uninstall", "-g", name], timeout=60)
        return r.returncode == 0
    except Exception:
        return False
