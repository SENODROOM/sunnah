# Python tests — run with: python -m pytest tests/python/
import pytest
from sahih_al_bukhari import Bukhari

@pytest.fixture(scope="module")
def bukhari():
    return Bukhari()

def test_total_hadiths(bukhari):
    assert len(bukhari) == 7277
    assert bukhari.length == 7277

def test_get_by_id(bukhari):
    h = bukhari.get(1)
    assert h is not None
    assert h.id == 1
    assert h.chapterId == 1
    assert h.narrator
    assert h.text

def test_get_missing_id(bukhari):
    assert bukhari.get(999999) is None

def test_get_by_chapter(bukhari):
    hadiths = bukhari.getByChapter(1)
    assert isinstance(hadiths, list)
    assert len(hadiths) > 0
    assert all(h.chapterId == 1 for h in hadiths)

def test_search_returns_results(bukhari):
    results = bukhari.search("prayer")
    assert len(results) > 0

def test_search_with_limit(bukhari):
    results = bukhari.search("prayer", limit=5)
    assert len(results) <= 5

def test_search_case_insensitive(bukhari):
    lower = bukhari.search("prayer")
    upper = bukhari.search("PRAYER")
    assert len(lower) == len(upper)

def test_get_random(bukhari):
    h = bukhari.getRandom()
    assert h.id > 0
    assert h.text

def test_index_access(bukhari):
    assert bukhari[0].id > 0

def test_iteration(bukhari):
    count = sum(1 for _ in bukhari)
    assert count == 7277

def test_metadata(bukhari):
    assert bukhari.metadata.english.get("title")
    assert bukhari.metadata.english.get("author")

def test_chapters(bukhari):
    assert isinstance(bukhari.chapters, list)
    assert len(bukhari.chapters) > 0
    assert bukhari.chapters[0].english

def test_slice(bukhari):
    sliced = bukhari.slice(0, 10)
    assert len(sliced) == 10

def test_filter(bukhari):
    ch1 = bukhari.filter(lambda h: h.chapterId == 1)
    assert all(h.chapterId == 1 for h in ch1)

def test_find(bukhari):
    h = bukhari.find(lambda h: h.id == 23)
    assert h is not None
    assert h.id == 23

def test_map(bukhari):
    narrators = bukhari.map(lambda h: h.narrator)
    assert len(narrators) == 7277
    assert all(isinstance(n, str) for n in narrators)

def test_to_dict(bukhari):
    h = bukhari.get(1)
    d = h.to_dict()
    assert "id" in d
    assert "chapterId" in d
    assert "english" in d
    assert "arabic" in d
