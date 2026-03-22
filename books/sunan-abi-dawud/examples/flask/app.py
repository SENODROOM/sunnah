from flask import Flask, jsonify, request
from sunan_abi_dawud import Dawud

app = Flask(__name__)
dawud = Dawud()


@app.get("/api/hadith/random")
def random():
    return jsonify(dawud.getRandom().to_dict())


@app.get("/api/hadith/<int:id>")
def get(id):
    h = dawud.get(id)
    return jsonify(h.to_dict()) if h else ("Not found", 404)


@app.get("/api/search")
def search():
    return jsonify(
        [
            h.to_dict()
            for h in dawud.search(
                request.args.get("q", ""), int(request.args.get("limit", 0))
            )
        ]
    )


if __name__ == "__main__":
    app.run(debug=True)
