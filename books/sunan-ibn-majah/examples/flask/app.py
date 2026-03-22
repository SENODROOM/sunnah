from flask import Flask, jsonify, request
from sunan_ibn_majah import Majah
app = Flask(__name__)
majah = Majah()

@app.get("/api/hadith/random")
def random(): return jsonify(majah.getRandom().to_dict())

@app.get("/api/hadith/<int:id>")
def get(id):
    h = majah.get(id)
    return jsonify(h.to_dict()) if h else ("Not found", 404)

@app.get("/api/search")
def search(): return jsonify([h.to_dict() for h in majah.search(request.args.get("q",""), int(request.args.get("limit",0)))])

@app.get("/api/chapters")
def chapters(): return jsonify([c.to_dict() for c in majah.chapters])

if __name__ == "__main__": app.run(debug=True)
