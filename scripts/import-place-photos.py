"""Downloads Wikidata's main image (P18) for each hand-written place that lacks a photograph of itself.

Reads lib/data/generated/place-wikidata.json (written by check-places.py). For each place listed in WANT, takes the item's
image, accepts it only if its Commons licence is free (CC BY, CC BY-SA, CC0, public domain), downloads a 1200 px version
to public/images/place-<id>.jpg and records the credit in lib/data/generated/place-photos.json.

Run : python scripts/import-place-photos.py      (cached in ./cache)
"""
import hashlib, json, os, re, time, urllib.parse, urllib.request

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
UA = {"User-Agent": "BHARATA-atlas/0.1 (https://bhaarata.vercel.app; data import)"}
os.makedirs("cache", exist_ok=True)

# Places whose current picture shows a different place, or that have none.
WANT = ["basavakalyan", "dorasamudra", "kodungallur", "kanchipuram", "nagapattinam", "belur", "pataliputra", "gauda",
        "gulbarga", "anuradhapura", "polonnaruwa", "badami", "sasaram"]
# Left out on purpose: Manyakheta (Wikidata's image is a railway station) and Kannauj (a temple in a different town).

def get(url, key=None, binary=False):
    path = f"cache/{key}" if key else None
    if path and os.path.exists(path):
        return open(path, "rb").read() if binary else json.load(open(path))
    for attempt in range(6):
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90).read(); break
        except Exception:
            if attempt == 5: raise
            time.sleep(6 + attempt * 6)
    if binary:
        if path: open(path, "wb").write(data)
        return data
    obj = json.loads(data)
    if path: json.dump(obj, open(path, "w"))
    return obj

def main():
    places = json.load(open(os.path.join(ROOT, "lib/data/generated/place-wikidata.json")))
    out = {}
    for pid in WANT:
        q = places[pid]["q"]
        e = get("https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode({"action": "wbgetentities", "ids": q, "props": "claims", "format": "json"}), f"p18-{q}.json")["entities"][q]
        time.sleep(1.5)
        files = [c["mainsnak"]["datavalue"]["value"] for c in e["claims"].get("P18", []) if "datavalue" in c["mainsnak"]]
        if not files: print("no image:", pid); continue
        for fname in files[:3]:
            title = "File:" + fname
            r = get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "titles": title, "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 1200, "format": "json"}),
                    "pi-" + hashlib.md5(title.encode()).hexdigest() + ".json")
            time.sleep(1.5)
            page = next(iter(r["query"]["pages"].values()))
            if "imageinfo" not in page: continue
            ii = page["imageinfo"][0]; m = ii["extmetadata"]
            lic = m.get("LicenseShortName", {}).get("value", "")
            if not re.match(r"(CC BY|CC0|Public domain|PD|CC-BY|Attribution)", lic, re.I) or re.search(r"\bNC\b|ND", lic): continue
            if ii["width"] < 900 or re.search(r"\.(svg|tif|gif|pdf)$", fname, re.I): continue
            artist = re.sub(r"<[^>]+>", "", m.get("Artist", {}).get("value", "")).strip() or "Unknown"
            data = get(ii["thumburl"], "pimg-" + hashlib.md5(ii["thumburl"].encode()).hexdigest() + ".jpg", binary=True)
            key = f"place-{pid}"
            open(os.path.join(ROOT, "public/images", f"{key}.jpg"), "wb").write(data)
            title_clean = fname.rsplit(".", 1)[0].replace("_", " ")
            out[key] = {"file": f"/images/{key}.jpg", "alt": title_clean[:160], "title": title_clean[:90], "artist": artist[:80], "license": lic, "sourceUrl": ii["descriptionurl"]}
            print(pid, "|", title_clean[:60], "|", artist[:25], "|", lic)
            break
        else:
            print("no free image:", pid)
    json.dump(out, open(os.path.join(ROOT, "lib/data/generated/place-photos.json"), "w"), indent=1, ensure_ascii=False)

if __name__ == "__main__":
    main()
