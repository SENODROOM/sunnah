"""
sunnah — Hadith Package Manager for Python.

Manages installation and updates of all Sunnah hadith packages
on both npm (for Node.js/JS projects) and pip (for Python projects).

CLI usage:
    sunnah                      # interactive TUI
    sunnah install bukhari      # install npm package
    sunnah pip install bukhari  # install pip package
    sunnah list                 # show all packages
    sunnah search "prayer"      # search across installed books
    sunnah random               # random hadith
    sunnah info nasai           # detailed info
    sunnah update               # check for updates
"""
from .cli import main
__version__ = "1.5.0"
__all__ = ["main"]
