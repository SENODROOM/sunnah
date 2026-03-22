"""
jami-al-tirmidhi — Complete Jami al-Tirmidhi for Python.

from jami_al_tirmidhi import Tirmidhi

tirmidhi = Tirmidhi()
tirmidhi.get(1)
tirmidhi.search("prayer")
tirmidhi.getRandom()
tirmidhi.getByChapter(1)
"""
from .tirmidhi import Tirmidhi, Hadith, Chapter, Metadata, clear_cache

__all__     = ["Tirmidhi", "Hadith", "Chapter", "Metadata", "clear_cache"]
__version__ = "1.0.0"
