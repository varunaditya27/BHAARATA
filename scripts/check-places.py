"""Matches the hand-written places in lib/data/prototype.ts to Wikidata items and records Wikidata's coordinates.

For each place, the Wikidata item is named below (found and confirmed by hand: a city, village or site, not a
district or an airport). The script reads that item's coordinates (P625, CC0) and writes them with the item id
to lib/data/generated/place-wikidata.json. prototype.ts then uses them in place of the typed-in numbers.
It prints any place whose typed-in coordinates are more than 0.05 degrees (about 5 km) from Wikidata's.

Run  : python scripts/check-places.py        (one request every 2 s)
"""
import json, os, re, time, urllib.parse, urllib.request

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
UA = {"User-Agent": "BHARATA-atlas/0.1 (https://bhaarata.vercel.app; data check)"}

# place id -> Wikidata item (checked by hand against its description)
ITEMS = {
    "thanjavur": "Q41496", "gangaikondacholapuram": "Q1493439", "madurai": "Q228405", "hampi": "Q26732", "kanchipuram": "Q212332",
    "nagapattinam": "Q695585", "kodungallur": "Q1006282", "manyakheta": "Q191771", "basavakalyan": "Q712521", "dorasamudra": "Q1013556", "belur": "Q760603",
    "ellora": "Q189616", "pataliputra": "Q80484", "gauda": "Q1496277", "somapura": "Q305044", "kannauj": "Q614890", "bateshwar": "Q4868834", "delhi": "Q1353",
    "gulbarga": "Q37112", "bidar": "Q461922", "anuradhapura": "Q5724", "polonnaruwa": "Q394443",
}
SEARCH = {"nagapattinam": "Nagapattinam", "kodungallur": "Kodungallur", "manyakheta": "Manyakheta", "basavakalyan": "Basavakalyan",
          "dorasamudra": "Halebidu", "belur": "Belur Karnataka", "ellora": "Ellora Caves", "pataliputra": "Pataliputra", "gauda": "Gauda Bengal",
          "somapura": "Somapura Mahavihara", "kannauj": "Kannauj", "bateshwar": "Bateshwar Madhya Pradesh", "delhi": "Delhi",
          "gulbarga": "Kalaburagi", "bidar": "Bidar", "anuradhapura": "Anuradhapura", "polonnaruwa": "Polonnaruwa"}

def get(url):
    for attempt in range(6):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))
        except Exception:
            time.sleep(6 + attempt * 6)
    raise RuntimeError(url)

def coords(q):
    e = get("https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode({"action": "wbgetentities", "ids": q, "props": "claims|descriptions|labels", "format": "json"}))["entities"][q]
    c = e["claims"].get("P625")
    v = c[0]["mainsnak"]["datavalue"]["value"] if c else None
    return e["labels"].get("en", {}).get("value", q), e["descriptions"].get("en", {}).get("value", ""), (round(v["longitude"], 4), round(v["latitude"], 4)) if v else None

def main():
    src = open(os.path.join(ROOT, "lib/data/prototype.ts")).read()
    ours = {m[0]: (float(m[1]), float(m[2])) for m in re.findall(r'\{ id: "([a-z]+)", slug: "[a-z]+", name: "[^"]+", placeType: "[a-z]+", coordinates: \[([\d.]+), ([\d.]+)\]', src)}
    path = os.path.join(ROOT, "lib/data/generated/place-wikidata.json")
    out = json.load(open(path)) if os.path.exists(path) else {}
    for pid, q in ITEMS.items():
        if pid in out: continue
        if q is None:
            hits = get("https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode({"action": "wbsearchentities", "search": SEARCH[pid], "language": "en", "limit": 6, "format": "json"}))["search"]
            time.sleep(2)
            cands = []
            for h in hits:
                label, desc, c = coords(h["id"]); time.sleep(2)
                if c and not re.search(r"district|taluk|airport|station|university|commune|temple", desc, re.I): cands.append((h["id"], desc))
            # prefer a settlement (city, town, village, municipality), then a site
            pick = next((i for i, d in cands if re.search(r"city|town|village|municipality|capital", d, re.I)), None) or next((i for i, d in cands), None)
            q = pick
        if q is None:
            print("NO MATCH", pid); continue
        label, desc, c = coords(q); time.sleep(2)
        d = max(abs(c[0] - ours[pid][0]), abs(c[1] - ours[pid][1])) if c else None
        out[pid] = {"q": q, "label": label, "description": desc, "coordinates": list(c)}
        print(f"{pid:24} {q:12} {desc[:60]:60} {c}  ours {ours[pid]}  {'** MOVED %.3f deg' % d if d and d > 0.05 else ''}")
        json.dump(out, open(path, "w"), indent=1, ensure_ascii=False)       # saved after each place, so a rate limit loses nothing

if __name__ == "__main__":
    main()
