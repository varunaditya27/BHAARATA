"""Imports temples, mosques, forts, tombs, palaces and monasteries with a known date of
construction (or founding) between 600 and 1700 from Wikidata (CC0).

For each: name, year, category, coordinates, a one-line description, the Wikipedia article, and
(when Wikidata links one) a free-licence photograph's credit and a 480px thumbnail address on
Wikimedia Commons. The thumbnail is linked, not copied into the repository, so the repo stays small;
the credit (artist, licence, page) travels with it and is shown wherever the picture is.

Output : public/data/sites.geojson
Run    : python scripts/import-sites.py        (responses cached in ./cache; needs no extra packages)
"""
import hashlib, json, os, re, time, urllib.parse, urllib.request

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
UA = {"User-Agent": "BHARATA-atlas/0.1 (https://bhaarata.vercel.app; data import)"}
os.makedirs("cache", exist_ok=True)

# Wikidata's own type labels -> the five groups the map uses. Anything not listed is left out
# (Tibetan monasteries are outside the atlas; "princely state" and "historical country" are
# kingdoms, not sites; "city", "village" and "inscription" are not buildings).
CATEGORY = {
    "Hindu temple": "temple", "temple": "temple", "Buddhist temple": "temple", "Jain temple": "temple",
    "cave temple": "temple", "rock-cut temple": "temple", "shrine": "temple", "gurdwara": "temple", "church building": "temple",
    "mosque": "mosque", "dargah": "mosque", "Friday mosque": "mosque", "madrasa": "mosque",
    "fort": "fort", "fortress": "fort", "citadel": "fort", "hill fort": "fort", "castle": "fort", "gate": "fort",
    "tomb": "tomb", "mausoleum": "tomb", "tomb of a saint": "tomb", "memorial": "tomb",
    "palace": "palace", "stepwell": "palace", "building": "palace", "garden": "palace",
    "monastery": "monastery", "vihāra": "monastery", "stupa": "monastery", "Buddhist monastery": "monastery",
    "archaeological site": "monastery", "ruins": "monastery", "monument": "monastery",
}
# Where Wikidata's box catches Tibet and Central Asia, names that give it away.
OUT_OF_SCOPE = re.compile(r"\b(Tibet|Lhasa|Gompa|Ladakh Gonpa|Potala|Drigung|Ralung|Samding|Kumbum|Shigatse)\b", re.I)
BOX = ("Point(60 5)", "Point(93 37)")

def fetch(url, key, binary=False):
    path = f"cache/{key}"
    if os.path.exists(path):
        return open(path, "rb").read() if binary else json.load(open(path))
    for attempt in range(5):
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=170).read()
            break
        except Exception:
            if attempt == 4: raise
            time.sleep(3 + attempt * 4)
    if binary:
        open(path, "wb").write(data); return data
    obj = json.loads(data); json.dump(obj, open(path, "w")); return obj

def main():
    sparql = f"""SELECT ?s ?sLabel ?sDescription ?d ?c ?typeLabel ?img ?article WHERE {{
      SERVICE wikibase:box {{ ?s wdt:P625 ?c . bd:serviceParam wikibase:cornerSouthWest "{BOX[0]}"^^geo:wktLiteral ; wikibase:cornerNorthEast "{BOX[1]}"^^geo:wktLiteral . }}
      ?s wdt:P571 ?d . FILTER(YEAR(?d) >= 600 && YEAR(?d) <= 1700)
      ?s wdt:P31 ?type .
      OPTIONAL {{ ?s wdt:P18 ?img }}
      OPTIONAL {{ ?article schema:about ?s ; schema:isPartOf <https://en.wikipedia.org/> }}
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }} }}"""
    rows = fetch("https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(sparql), "sites.json")["results"]["bindings"]
    sites = {}
    for r in rows:
        q = r["s"]["value"].rsplit("/", 1)[-1]
        name = r["sLabel"]["value"]
        cat = CATEGORY.get(r["typeLabel"]["value"])
        if not cat or re.fullmatch(r"Q\d+", name) or OUT_OF_SCOPE.search(name): continue
        m = re.match(r"Point\(([-\d.]+) ([-\d.]+)\)", r["c"]["value"])
        year = int(r["d"]["value"][:4]) if not r["d"]["value"].startswith("-") else None
        if not m or year is None: continue
        s = sites.setdefault(q, {"q": q, "name": name, "year": year, "cat": cat, "lon": round(float(m.group(1)), 4), "lat": round(float(m.group(2)), 4),
                                 "desc": r.get("sDescription", {}).get("value", ""), "imgs": [], "wiki": None})
        if "img" in r and r["img"]["value"] not in s["imgs"]: s["imgs"].append(r["img"]["value"])
        if "article" in r: s["wiki"] = urllib.parse.unquote(r["article"]["value"].rsplit("/wiki/", 1)[-1])
        # A site with several types keeps the first group seen; prefer the more specific one.
        if s["cat"] in ("palace", "monastery") and cat in ("temple", "mosque", "fort", "tomb"): s["cat"] = cat
    print(len(sites), "dated sites after filtering")

    features, with_photo = [], 0
    for s in sorted(sites.values(), key=lambda x: x["year"]):
        props = {"n": s["name"], "q": s["q"], "y": s["year"], "t": s["cat"]}
        if s["desc"]: props["d"] = s["desc"][:90]
        if s["wiki"]: props["w"] = s["wiki"]
        for url in s["imgs"][:2]:
            fname = urllib.parse.unquote(url.rsplit("/", 1)[-1]).replace("_", " ")
            if re.search(r"\.(svg|tif|tiff|gif|webp|pdf|ogv|webm)$", fname, re.I): continue
            qs = urllib.parse.urlencode({"action": "query", "titles": "File:" + fname, "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 480, "format": "json"})
            try:
                info = fetch("https://commons.wikimedia.org/w/api.php?" + qs, "cm-" + hashlib.md5(fname.encode()).hexdigest() + "-480.json")
            except Exception:
                continue
            page = next(iter(info["query"]["pages"].values()))
            if "imageinfo" not in page: continue
            ii = page["imageinfo"][0]; m = ii["extmetadata"]
            lic = m.get("LicenseShortName", {}).get("value", "")
            if not re.match(r"(CC BY|CC0|Public domain|PD|CC-BY|Attribution)", lic, re.I) or re.search(r"\bNC\b|ND", lic): continue
            if ii["width"] < 600 or not (0.5 <= ii["height"] / ii["width"] <= 1.4): continue
            artist = re.sub(r"<[^>]+>", "", m.get("Artist", {}).get("value", "")).strip() or "Unknown"
            props["i"] = ii["thumburl"]
            props["c"] = f"{artist[:60]}, {lic}"
            props["p"] = ii["descriptionurl"]
            with_photo += 1
            break
        features.append({"type": "Feature", "properties": props, "geometry": {"type": "Point", "coordinates": [s["lon"], s["lat"]]}})
    os.makedirs(os.path.join(ROOT, "public/data"), exist_ok=True)
    json.dump({"type": "FeatureCollection", "features": features}, open(os.path.join(ROOT, "public/data/sites.geojson"), "w"), separators=(",", ":"), ensure_ascii=False)
    cats = {}
    for f in features: cats[f["properties"]["t"]] = cats.get(f["properties"]["t"], 0) + 1
    print(len(features), "sites written;", with_photo, "with a free photo;", cats)

if __name__ == "__main__":
    main()
