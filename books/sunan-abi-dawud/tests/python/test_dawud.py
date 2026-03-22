import pytest
from sunan_abi_dawud import Dawud


@pytest.fixture(scope="module")
def dawud():
    return Dawud()


def test_has_hadiths(dawud):
    assert len(dawud) > 0


def test_get_by_id(dawud):
    h = dawud.get(1)
    assert h is not None
    assert h.id == 1


def test_get_missing(dawud):
    assert dawud.get(999999) is None


def test_get_by_chapter(dawud):
    assert len(dawud.getByChapter(1)) > 0


def test_search(dawud):
    assert len(dawud.search("prayer")) > 0


def test_search_limit(dawud):
    assert len(dawud.search("prayer", limit=5)) <= 5


def test_random(dawud):
    assert dawud.getRandom().id > 0


def test_metadata(dawud):
    assert dawud.metadata.english.get("title")


def test_to_dict(dawud):
    d = dawud.get(1).to_dict()
    assert "id" in d


def test_filter(dawud):
    assert all(h.chapterId == 1 for h in dawud.filter(lambda h: h.chapterId == 1))


def test_find(dawud):
    assert dawud.find(lambda h: h.id == 1) is not None


def test_slice(dawud):
    assert len(dawud.slice(0, 10)) == 10
