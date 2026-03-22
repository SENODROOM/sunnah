import pytest
from sunan_al_nasai import Nasai

@pytest.fixture(scope="module")
def nasai(): return Nasai()

def test_has_hadiths(nasai):    assert len(nasai) > 0
def test_get_by_id(nasai):      h = nasai.get(1); assert h is not None; assert h.id == 1
def test_get_missing(nasai):    assert nasai.get(999999) is None
def test_get_by_chapter(nasai): assert len(nasai.getByChapter(1)) > 0
def test_search(nasai):         assert len(nasai.search("prayer")) > 0
def test_search_limit(nasai):   assert len(nasai.search("prayer", limit=5)) <= 5
def test_random(nasai):         assert nasai.getRandom().id > 0
def test_metadata(nasai):       assert nasai.metadata.english.get("title")
def test_to_dict(nasai):        d = nasai.get(1).to_dict(); assert "id" in d
def test_filter(nasai):         assert all(h.chapterId==1 for h in nasai.filter(lambda h: h.chapterId==1))
def test_find(nasai):           assert nasai.find(lambda h: h.id==1) is not None
def test_slice(nasai):          assert len(nasai.slice(0,10)) == 10
