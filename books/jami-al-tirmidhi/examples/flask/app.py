from flask import Flask, jsonify, request
from jami_al_tirmidhi import Tirmidhi
app = Flask(__name__)
tirmidhi = Tirmidhi()

@app.get("/api/hadith/random")
def random(): return jsonify(tirmidhi.getRandom().to_dict())

@app.get("/api/hadith/<int:id>")
def get(id):
    h = tirmidhi.get(id)
    return jsonify(h.to_dict()) if h else ("Not found", 404)

@app.get("/api/search")
def search(): return jsonify([h.to_dict() for h in tirmidhi.search(request.args.get("q",""), int(request.args.get("limit",0)))])

if __name__ == "__main__": app.run(debug=True)
