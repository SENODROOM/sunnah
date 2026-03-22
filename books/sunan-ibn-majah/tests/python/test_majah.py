import pytest
from sunan_ibn_majah import Majah

@pytest.fixture(scope="module")
def majah(): return Majah()

def test_has_hadiths(majah):    assert len(majah) > 0
def test_get_by_id(majah):      h = majah.get(1); assert h is not None; assert h.id == 1
def test_get_missing(majah):    assert majah.get(999999) is None
def test_get_by_chapter(majah): assert len(majah.getByChapter(1)) > 0
def test_search(majah):         assert len(majah.search("prayer")) > 0
def test_search_limit(majah):   assert len(majah.search("prayer", limit=5)) <= 5
def test_random(majah):         assert majah.getRandom().id > 0
def test_metadata(majah):       assert majah.metadata.english.get("title")
def test_to_dict(majah):        d = majah.get(1).to_dict(); assert "id" in d
def test_filter(majah):         assert all(h.chapterId==1 for h in majah.filter(lambda h: h.chapterId==1))
def test_find(majah):           assert majah.find(lambda h: h.id==1) is not None
def test_slice(majah):          assert len(majah.slice(0,10)) == 10
