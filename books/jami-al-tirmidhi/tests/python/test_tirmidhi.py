import pytest
from jami_al_tirmidhi import Tirmidhi

@pytest.fixture(scope="module")
def tirmidhi(): return Tirmidhi()

def test_has_hadiths(tirmidhi):     assert len(tirmidhi) > 0
def test_get_by_id(tirmidhi):       h = tirmidhi.get(1); assert h is not None; assert h.id == 1
def test_get_missing(tirmidhi):     assert tirmidhi.get(999999) is None
def test_get_by_chapter(tirmidhi):  assert len(tirmidhi.getByChapter(1)) > 0
def test_search(tirmidhi):          assert len(tirmidhi.search("prayer")) > 0
def test_search_limit(tirmidhi):    assert len(tirmidhi.search("prayer", limit=5)) <= 5
def test_random(tirmidhi):          assert tirmidhi.getRandom().id > 0
def test_metadata(tirmidhi):        assert tirmidhi.metadata.english.get("title")
def test_to_dict(tirmidhi):         d = tirmidhi.get(1).to_dict(); assert "id" in d
def test_filter(tirmidhi):          assert all(h.chapterId==1 for h in tirmidhi.filter(lambda h: h.chapterId==1))
def test_find(tirmidhi):            assert tirmidhi.find(lambda h: h.id==1) is not None
def test_slice(tirmidhi):           assert len(tirmidhi.slice(0,10)) == 10
