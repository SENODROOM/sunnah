# Flask REST API example
# Run: pip install flask && python examples/flask/app.py
from flask import Flask, jsonify, request
from sahih_al_bukhari import Bukhari

app    = Flask(__name__)
bukhari = Bukhari()

@app.get("/api/hadith/random")
def random_hadith():
    return jsonify(bukhari.getRandom().to_dict())

@app.get("/api/hadith/<int:hadith_id>")
def get_hadith(hadith_id):
    h = bukhari.get(hadith_id)
    if not h:
        return jsonify({"error": "Hadith not found"}), 404
    return jsonify(h.to_dict())

@app.get("/api/chapter/<int:chapter_id>")
def get_chapter(chapter_id):
    hadiths = bukhari.getByChapter(chapter_id)
    if not hadiths:
        return jsonify({"error": "Chapter not found"}), 404
    return jsonify({"count": len(hadiths), "hadiths": [h.to_dict() for h in hadiths]})

@app.get("/api/search")
def search():
    q      = request.args.get("q", "")
    limit  = int(request.args.get("limit", 0))
    results = bukhari.search(q, limit)
    return jsonify({"query": q, "count": len(results), "results": [h.to_dict() for h in results]})

@app.get("/api/chapters")
def chapters():
    return jsonify([c.to_dict() for c in bukhari.chapters])

@app.get("/api/meta")
def meta():
    return jsonify({**bukhari.metadata.to_dict(), "total": bukhari.length})

if __name__ == "__main__":
    print("Sahih al-Bukhari API running at http://localhost:5000")
    print("Try: http://localhost:5000/api/hadith/1")
    app.run(debug=True)
