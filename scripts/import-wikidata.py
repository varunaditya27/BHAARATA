"""Imports present-day protected monuments and historical battles from Wikidata (CC0)
and Wikipedia (summaries, CC BY-SA 4.0).

Outputs : public/data/monuments.geojson          (4,000+ ASI-protected monuments with coordinates)
          lib/data/generated/imported-battles.json (battles dated 600-1700 in the subcontinent)
Needs   : lib/data/geo/cliopatria-boundaries.json, boundaries.json (to say which kingdoms' borders
          contained each battle site in its year) and shapely.
Responses are cached in ./cache.   Run:  python scripts/import-wikidata.py
"""
import json, os, re, time, urllib.parse, urllib.request
from shapely.geometry import shape, Point
from shapely.validation import make_valid

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
UA = {"User-Agent": "BHARATA-atlas/0.1 (https://bhaarata.vercel.app; data import)"}
os.makedirs("cache", exist_ok=True)
BBOX = (60, 5, 93, 37)  # lon/lat box of the subcontinent; battles outside it (Arabia, Central Asia) are dropped

def fetch(url, key):
    path = f"cache/{key}"
    if os.path.exists(path): return json.load(open(path))
    for attempt in range(5):
        try:
            obj = json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read())
            break
        except Exception:
            if attempt == 4: raise
            time.sleep(3 + attempt * 4)
    json.dump(obj, open(path, "w")); return obj

def sparql(q, key):
    return fetch("https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(q), key)["results"]["bindings"]

def point(wkt):
    m = re.match(r"Point\(([-\d.]+) ([-\d.]+)\)", wkt)
    return (float(m.group(1)), float(m.group(2))) if m else None

def article_title(url):
    return urllib.parse.unquote(url.rsplit("/wiki/", 1)[-1]) if url else None

def main():
    # ---- monuments protected by the Archaeological Survey of India ----
    rows = sparql("""SELECT ?m ?mLabel ?coord ?article WHERE {
      ?m wdt:P1371 ?asi ; wdt:P625 ?coord .
      OPTIONAL { ?article schema:about ?m ; schema:isPartOf <https://en.wikipedia.org/> }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }""", "monuments.json")
    seen, feats = set(), []
    for r in rows:
        q = r["m"]["value"].rsplit("/", 1)[-1]
        name = r["mLabel"]["value"]
        pt = point(r["coord"]["value"])
        if q in seen or not pt or re.fullmatch(r"Q\d+", name): continue
        seen.add(q)
        props = {"n": name, "q": q}
        if "article" in r: props["w"] = article_title(r["article"]["value"])
        feats.append({"type": "Feature", "properties": props, "geometry": {"type": "Point", "coordinates": [round(pt[0], 4), round(pt[1], 4)]}})
    os.makedirs(os.path.join(ROOT, "public/data"), exist_ok=True)
    json.dump({"type": "FeatureCollection", "features": feats}, open(os.path.join(ROOT, "public/data/monuments.geojson"), "w"), separators=(",", ":"), ensure_ascii=False)
    print(len(feats), "monuments,", sum("w" in f["properties"] for f in feats), "with a Wikipedia article")

    # ---- battles ----
    rows = sparql("""SELECT ?b ?bLabel ?date ?coord ?locCoord ?article WHERE {
      ?b wdt:P31/wdt:P279* wd:Q178561 ; wdt:P585 ?date .
      FILTER(YEAR(?date) >= 600 && YEAR(?date) <= 1700)
      OPTIONAL { ?b wdt:P625 ?coord }
      OPTIONAL { ?b wdt:P276 ?loc . ?loc wdt:P625 ?locCoord }
      OPTIONAL { ?article schema:about ?b ; schema:isPartOf <https://en.wikipedia.org/> }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }""", "battles.json")
    shapes = []
    for b in json.load(open(os.path.join(ROOT, "lib/data/geo/cliopatria-boundaries.json"))):
        shapes.append((b["polityId"], b["validFrom"], b["validTo"], make_valid(shape(b["geometry"]))))
    chera = json.load(open(os.path.join(ROOT, "lib/data/geo/boundaries.json")))["chera-800"]
    shapes.append(("chera", 800, 1124, make_valid(shape(chera))))

    out, seen = [], set()
    for r in rows:
        q = r["b"]["value"].rsplit("/", 1)[-1]
        name = r["bLabel"]["value"]
        pt = point(r.get("coord", {}).get("value", "")) or point(r.get("locCoord", {}).get("value", ""))
        if q in seen or not pt or re.fullmatch(r"Q\d+", name): continue
        if not (BBOX[0] <= pt[0] <= BBOX[2] and BBOX[1] <= pt[1] <= BBOX[3]): continue
        seen.add(q)
        year = int(r["date"]["value"][:4]) if not r["date"]["value"].startswith("-") else None
        if year is None: continue
        p = Point(pt)
        within = sorted({pid for pid, a, z, g in shapes if a <= year <= z and g.contains(p)})
        title = article_title(r["article"]["value"]) if "article" in r else None
        summary = None
        if title:
            try:
                wp = fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title, safe="_()%,'"), f"wp-battle-{q}.json")
                summary = wp.get("extract")
            except Exception:
                pass
        out.append({"id": "battle-" + re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") + f"-{year}", "name": name, "year": year,
                    "date": r["date"]["value"][:10], "location": [round(pt[0], 4), round(pt[1], 4)], "wikidata": q,
                    "wikipedia": title, "extract": summary, "polityIds": within})
    out.sort(key=lambda b: b["year"])
    json.dump(out, open(os.path.join(ROOT, "lib/data/generated/imported-battles.json"), "w"), indent=1, ensure_ascii=False)
    print(len(out), "battles;", sum(bool(b["polityIds"]) for b in out), "inside a mapped kingdom's borders;", sum(bool(b["extract"]) for b in out), "with a summary")

if __name__ == "__main__":
    main()
