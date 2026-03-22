"""pip utilities — check/install/update pip hadith packages."""
import subprocess, sys, json, platform
from typing import Optional

_IS_WIN = platform.system() == "Windows"

def _pip_cmd():
    """Return the right pip command string."""
    return "pip" if _IS_WIN else "pip3"

def _pip(args: list, timeout: int = 10) -> str:
    try:
        cmd = _pip_cmd()
        if _IS_WIN:
            r = subprocess.run(f"{cmd} " + " ".join(args), capture_output=True,
                               text=True, timeout=timeout, shell=True)
        else:
            r = subprocess.run([cmd] + args, capture_output=True,
                               text=True, timeout=timeout)
        return r.stdout or ""
    except Exception:
        return ""

def get_pip_installed(package_names: list) -> dict:
    """Returns {name: bool} for each package."""
    result = {n: False for n in package_names}
    try:
        out = _pip(["list", "--format=json"], timeout=8)
        installed = {pkg["name"].lower() for pkg in json.loads(out)}
        for n in package_names:
            result[n] = n.lower() in installed
    except Exception:
        for n in package_names:
            out = _pip(["show", n], timeout=5)
            result[n] = "Name:" in out
    return result

def get_pip_version(name: str) -> Optional[str]:
    import re
    out = _pip(["show", name], timeout=5)
    m = re.search(r"^Version:\s+([\d.]+)", out, re.MULTILINE)
    return m.group(1) if m else None

def get_pip_latest(name: str) -> Optional[str]:
    import re
    out = _pip(["index", "versions", name], timeout=10)
    m = re.search(r"LATEST:\s+([\d.]+)", out)
    if m: return m.group(1)
    # fallback: install with impossible version triggers version list in error
    out2 = _pip(["install", name + "==nonexistent"], timeout=8)
    m2 = re.search(r"from versions:.*?([\d.]+)\)", out2)
    return m2.group(1) if m2 else None

def pip_install(name: str) -> bool:
    try:
        cmd = _pip_cmd()
        if _IS_WIN:
            r = subprocess.run(f"{cmd} install {name}", timeout=180, shell=True)
        else:
            r = subprocess.run([cmd, "install", name], timeout=180)
        return r.returncode == 0
    except Exception:
        return False

def pip_uninstall(name: str) -> bool:
    try:
        cmd = _pip_cmd()
        if _IS_WIN:
            r = subprocess.run(f"{cmd} uninstall -y {name}", timeout=60, shell=True)
        else:
            r = subprocess.run([cmd, "uninstall", "-y", name], timeout=60)
        return r.returncode == 0
    except Exception:
        return False
