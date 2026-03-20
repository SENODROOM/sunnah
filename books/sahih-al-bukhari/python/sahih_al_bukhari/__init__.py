"""
sahih-al-bukhari — Complete Sahih al-Bukhari for Python.

7,277 authentic hadiths with full Arabic text and English translations.
Shares bin/bukhari.json and chapters/ with the npm package in this repo.

Quick start:
    from sahih_al_bukhari import Bukhari

    bukhari = Bukhari()
    bukhari.get(1)
    bukhari.search("prayer")
    bukhari.getRandom()
    bukhari.getByChapter(1)
"""

from .bukhari import Bukhari, Hadith, Chapter, Metadata, clear_cache

__all__    = ["Bukhari", "Hadith", "Chapter", "Metadata", "clear_cache"]
__version__ = "3.1.2"
