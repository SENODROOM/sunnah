"""
sunan-al-nasai — Complete Sunan al-Nasa'i for Python.

from sunan_al_nasai import Nasai

nasai = Nasai()
nasai.get(1)
nasai.search("prayer")
nasai.getRandom()
nasai.getByChapter(1)
"""
from .nasai import Nasai, Hadith, Chapter, Metadata, clear_cache

__all__     = ["Nasai", "Hadith", "Chapter", "Metadata", "clear_cache"]
__version__ = "1.0.0"
