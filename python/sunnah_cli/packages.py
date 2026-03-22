"""
Package registry — single source of truth for all Sunnah hadith packages.
Update this file whenever a new book is published.
"""

PACKAGES = [
    {
        "name":     "sahih-al-bukhari",
        "pip":      "sahih-al-bukhari",
        "label":    "Sahih al-Bukhari",
        "author":   "Imam Muhammad ibn Ismail al-Bukhari",
        "desc":     "Most authentic hadith collection, second only to the Quran.",
        "hadiths":  "7,563",
        "cmd":      "bukhari",
        "hook":     "useBukhari",
        "py_class": "Bukhari",
        "py_mod":   "sahih_al_bukhari",
    },
    {
        "name":     "sahih-muslim",
        "pip":      "sahih-muslim",
        "label":    "Sahih Muslim",
        "author":   "Imam Muslim ibn al-Hajjaj",
        "desc":     "Second most authentic, famed for strict chain verification.",
        "hadiths":  "7,470",
        "cmd":      "muslim",
        "hook":     "useMuslim",
        "py_class": "Muslim",
        "py_mod":   "sahih_muslim",
    },
    {
        "name":     "sunan-abi-dawud",
        "pip":      "sunan-abi-dawud",
        "label":    "Sunan Abi Dawud",
        "author":   "Imam Abu Dawud Sulayman ibn al-Ash'ath",
        "desc":     "One of the six canonical collections, focused on legal rulings.",
        "hadiths":  "5,274",
        "cmd":      "dawud",
        "hook":     "useDawud",
        "py_class": "Dawud",
        "py_mod":   "sunan_abi_dawud",
    },
    {
        "name":     "jami-al-tirmidhi",
        "pip":      "jami-al-tirmidhi",
        "label":    "Jami al-Tirmidhi",
        "author":   "Imam Abu Isa Muhammad al-Tirmidhi",
        "desc":     "Unique for grading each hadith's authenticity level.",
        "hadiths":  "3,956",
        "cmd":      "tirmidhi",
        "hook":     "useTirmidhi",
        "py_class": "Tirmidhi",
        "py_mod":   "jami_al_tirmidhi",
    },
    {
        "name":     "sunan-ibn-majah",
        "pip":      "sunan-ibn-majah",
        "label":    "Sunan Ibn Majah",
        "author":   "Imam Muhammad ibn Yazid Ibn Majah",
        "desc":     "Sixth of the six major canonical hadith collections.",
        "hadiths":  "4,341",
        "cmd":      "majah",
        "hook":     "useMajah",
        "py_class": "Majah",
        "py_mod":   "sunan_ibn_majah",
    },
    {
        "name":     "sunan-al-nasai",
        "pip":      "sunan-al-nasai",
        "label":    "Sunan al-Nasa'i",
        "author":   "Imam Ahmad ibn Shu'ayb al-Nasa'i",
        "desc":     "Known for its strict standards in accepting transmitters.",
        "hadiths":  "5,768",
        "cmd":      "nasai",
        "hook":     "useNasai",
        "py_class": "Nasai",
        "py_mod":   "sunan_al_nasai",
    },
]

CMD_MAP  = {p["cmd"]:  p for p in PACKAGES}
NAME_MAP = {p["name"]: p for p in PACKAGES}
PIP_MAP  = {p["pip"]:  p for p in PACKAGES}
