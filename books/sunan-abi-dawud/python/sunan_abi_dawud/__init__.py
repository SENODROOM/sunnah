"""
sunan-abi-dawud — Complete Sunan Abi Dawud for Python.

from sunan_abi_dawud import Dawud

dawud = Dawud()
dawud.get(1)
dawud.search("prayer")
dawud.getRandom()
dawud.getByChapter(1)
"""

from .dawud import Dawud, Hadith, Chapter, Metadata, clear_cache

__all__ = ["Dawud", "Hadith", "Chapter", "Metadata", "clear_cache"]
__version__ = "1.0.2"
