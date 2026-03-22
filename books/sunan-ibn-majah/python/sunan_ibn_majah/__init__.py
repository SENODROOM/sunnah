"""
sunan-ibn-majah — Complete Sunan Ibn Majah for Python.

from sunan_ibn_majah import Majah

majah = Majah()
majah.get(1)
majah.search("prayer")
majah.getRandom()
majah.getByChapter(1)
"""
from .majah import Majah, Hadith, Chapter, Metadata, clear_cache

__all__     = ["Majah", "Hadith", "Chapter", "Metadata", "clear_cache"]
__version__ = "1.1.0"
