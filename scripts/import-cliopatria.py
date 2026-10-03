"""Imports South Asian kingdoms for the atlas from open datasets.

  Borders + dates : Cliopatria (Seshat Global History Databank), CC BY 4.0
  Summaries       : English Wikipedia lead paragraphs, CC BY-SA 4.0
  Capitals        : Wikidata (CC0), via the Wikidata ID on each Cliopatria row
  Photographs     : Wikimedia Commons, only files under free licences

Inputs  : cliopatria_polities_only.geojson (unzip of cliopatria.geojson.zip from
          github.com/Seshat-Global-History-Databank/cliopatria) in the working dir.
Outputs : lib/data/geo/cliopatria-boundaries.json, labels.json
          lib/data/generated/imported-polities.json, imported-places.json, imported-images.json
          public/images/imp-*.jpg
Network responses are cached in ./cache so reruns are offline and repeatable.
Run with a Python that has shapely installed:  python scripts/import-cliopatria.py
"""
import colorsys, hashlib, json, os, re, sys, time, urllib.parse, urllib.request
from shapely.geometry import shape, mapping, Polygon, MultiPolygon
from shapely.ops import polylabel
from shapely.validation import make_valid

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
UA = {"User-Agent": "BHARATA-atlas/0.1 (https://bhaarata.vercel.app; data import)"}
YEAR_MIN, YEAR_MAX = 600, 1700
os.makedirs("cache", exist_ok=True)

# Cliopatria name -> (our id, display name). Curated records already in prototype.ts keep their ids.
INCLUDE = {
    "Late Pallava Empire": ("pallava", "Pallava"),
    "Chalukya Dynasty": ("chalukya-badami", "Chalukya (Badami)"),
    "Maitraka Dynasty": ("maitraka", "Maitraka"),
    "Kamarupa Kingdom": ("kamarupa", "Kamarupa"),
    "Turk Shahis": ("turk-shahis", "Turk Shahis"),
    "Karkota Dynasty": ("karkota", "Karkota"),
    "Harsha's Empire": ("harsha", "Harsha's Empire"),
    "Gurjara-Pratihara Dynasty": ("pratihara", "Gurjara-Pratihara"),
    "Pala Empire": ("pala", "Pala"),
    "Rashtrakuta Dynasty": ("rashtrakuta", "Rashtrakuta"),
    "Chola Empire": ("chola", "Chola"),
    "Pandya Dynasty": ("pandya", "Pandya"),
    "Pandya Empire": ("pandya", "Pandya"),
    "Sind-Habbari Dynasty": ("habbarid", "Habbarid Emirate of Sind"),
    "Chandra Dynasty": ("chandra", "Chandra (Bengal)"),
    "Chaulukya Dynasty": ("chaulukya", "Chaulukya (Solanki)"),
    "Chandela Kingdom": ("chandela", "Chandela"),
    "Utpala Dynasty": ("utpala", "Utpala (Kashmir)"),
    "Ghaznavid Empire": ("ghaznavid", "Ghaznavid"),
    "Western Chalukya Empire": ("chalukya-kalyani", "Chalukya (Kalyani)"),
    "Paramara Dynasty": ("paramara", "Paramara"),
    "Chauhan Dynasty": ("chauhan", "Chauhan"),
    "Lohara Dynasty": ("lohara", "Lohara (Kashmir)"),
    "Eastern Ganga Kingdom": ("eastern-ganga", "Eastern Ganga"),
    "Sena Dynasty": ("sena", "Sena"),
    "Kingdom of Polonnaruwa": ("polonnaruwa", "Polonnaruwa"),
    "Gahadavala Dynasty": ("gahadavala", "Gahadavala"),
    "Hoysala Kingdom": ("hoysala", "Hoysala"),
    "Ghurid Dynasty": ("ghurid", "Ghurid"),
    "Kakatiya Dynasty": ("kakatiya", "Kakatiya"),
    "Yadava Dynasty": ("yadava", "Yadava (Devagiri)"),
    "(Delhi Sultanate)": ("delhi-sultanate", "Delhi Sultanate"),
    "Kingdom of Dambadeniya": ("dambadeniya", "Dambadeniya"),
    "Kampili Kingdom": ("kampili", "Kampili"),
    "Jaffna kingdom": ("jaffna", "Jaffna"),
    "Vijayanagara Empire": ("vijayanagara", "Vijayanagara"),
    "Bahmani Sultanate": ("bahmani", "Bahmani"),
    "Kashmiri Sultanate": ("kashmir-sultanate", "Kashmir Sultanate"),
    "Sultanate of Bengal": ("bengal-sultanate", "Bengal Sultanate"),
    "Sind-Samma Dynasty": ("samma", "Samma (Sindh)"),
    "Jaunpur Sultanate": ("jaunpur", "Jaunpur Sultanate"),
    "Ahmadnagar Sultanate": ("ahmadnagar", "Ahmadnagar Sultanate"),
    "Berar Sultanate": ("berar", "Berar Sultanate"),
    "Bijapur Sultanate": ("bijapur", "Bijapur Sultanate"),
    "Bidar Sultanate": ("bidar-sultanate", "Bidar Sultanate"),
    "Golconda Sultanate": ("golconda", "Golconda Sultanate"),
    "Nayaks of Madurai": ("madurai-nayaks", "Madurai Nayaks"),
    "Mughal Empire": ("mughal", "Mughal Empire"),
    "Nayaks of Thanjavur": ("thanjavur-nayaks", "Thanjavur Nayaks"),
    "Sur Empire": ("sur", "Sur Empire"),
    "Kingdom of Mysore": ("mysore", "Kingdom of Mysore"),
    "Gorkha Kingdom": ("gorkha", "Gorkha Kingdom"),
    "Maratha Empire": ("maratha", "Maratha Empire"),
    "Thanjavur Maratha Kingdom": ("thanjavur-marathas", "Thanjavur Marathas"),
    "Anurādhapura": ("anuradhapura", "Anuradhapura Kingdom"),
}
# Curated records in prototype.ts: their text stays hand-written, only borders/dates change.
CURATED = {"chola", "pandya", "vijayanagara", "rashtrakuta", "chalukya-kalyani", "hoysala", "pala", "pratihara", "delhi-sultanate", "bahmani"}
# Photographs picked automatically (a Wikipedia lead image, or an image of a capital) are often
# unsuitable: maps, railway stations, modern city views. Only these, checked by eye, are kept.
IMAGE_OK = {"pallava", "chandela", "utpala", "polonnaruwa", "jaunpur", "bijapur", "golconda", "mughal", "maratha"}
# Cliopatria's Wikipedia phrase is sometimes about a city or a disambiguation, not the kingdom.
# The centre-of-area guess fails for states spread over several regions.
REGION_OVERRIDE = {"mughal": "Northern India and the Deccan", "sur": "Northern India", "harsha": "Northern India",
                   "ghaznavid": "Afghanistan and northern India", "ghurid": "Afghanistan and northern India",
                   "pallava": "Tamil country and Andhra", "karkota": "Kashmir and the Himalaya", "bengal-sultanate": "Bengal",
                   "chandra": "Bengal", "paramara": "Malwa", "chauhan": "Rajasthan"}
# Capitals Wikidata lists that are not useful as separate map places: a district rather than a city,
# or the same city as a hand-written place (Vijayanagara is Hampi).
SKIP_PLACES = {"vijaypura district", "vijayanagara"}
WIKI_TITLE = {"anuradhapura": "Kingdom_of_Anuradhapura"}

def get(url, key, binary=False):
    path = f"cache/{key}"
    if os.path.exists(path):
        return open(path, "rb").read() if binary else json.load(open(path))
    for attempt in range(4):
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
            break
        except Exception as e:
            if attempt == 3: raise
            time.sleep(2 + attempt * 3)
    if binary:
        open(path, "wb").write(data); return data
    obj = json.loads(data); json.dump(obj, open(path, "w")); return obj

def region(lon, lat):
    if lat > 31.5 and lon > 73: return "Kashmir and the Himalaya"
    if lon < 70: return "Afghanistan and Sindh" if lat > 27 else "Sindh and Makran"
    if lat < 9.9 and lon > 79.4: return "Sri Lanka"
    if lat > 29 and lon > 79: return "Himalaya and Nepal"
    if lon > 88 and lat > 22.5: return "Bengal" if lon < 92 else "Assam and the north-east"
    if lat > 24.5 and lon < 75: return "Punjab and Rajasthan"
    if lat > 24.5: return "Gangetic plain" if lon > 76.5 else "Northern India"
    if lat > 19.5 and lon > 80: return "Odisha and the east coast"
    if lat > 20.5: return "Gujarat and Malwa" if lon < 77 else "Central India"
    if lat > 15.5: return "Deccan"
    if lat > 12.8 and lon > 78.5: return "Tamil country and the east coast"
    if lat > 12.8: return "Karnataka and the Deccan"
    return "Southern India"

def accent(slug):
    h = int(hashlib.md5(slug.encode()).hexdigest()[:6], 16)
    hue = (h % 360) / 360
    r, g, b = colorsys.hls_to_rgb(hue, 0.36, 0.42)
    return "#%02x%02x%02x" % (int(r * 255), int(g * 255), int(b * 255))

def clean_summary(text):
    text = re.sub(r"\s*\([^)]*[^\x00-\x7f][^)]*\)", "", text)       # pronunciations / native-script glosses
    text = re.sub(r"\s*\((?:[^()]{0,3}|[^()]*(?:pronounced|IPA|romanised|romanized|lit\.)[^()]*)\)", "", text)
    text = re.sub(r"\[\d+\]", "", text)
    sentences = re.split(r"(?<=[.!?])\s+(?=[A-Z])", text.strip())
    out = ""
    for s in sentences:
        if len(out) + len(s) > 460 and out: break
        out += (" " if out else "") + s
    return out

def summary_for(wp, e):
    text = clean_summary(wp.get("extract", ""))
    # A disambiguation-style or list-style lead says nothing useful about the kingdom itself.
    if len(text) < 60 or "term used to denote" in text or wp.get("type") == "disambiguation" or text.count("(") != text.count(")"):
        return f"Appears in the Cliopatria historical-borders dataset from {e['from']} to {e['to']}. The linked Wikipedia article has more."
    return text

def poly_list(g):
    if g.geom_type == "Polygon": return [g]
    if g.geom_type == "MultiPolygon": return list(g.geoms)
    return [q for x in g.geoms for q in poly_list(x)] if hasattr(g, "geoms") else []

def rnd(o):
    if isinstance(o, float): return round(o, 3)
    if isinstance(o, (list, tuple)): return [rnd(x) for x in o]
    return o

def main():
    d = json.load(open("cliopatria_polities_only.geojson"))
    boundaries, labels, meta = [], {}, {}
    for f in d["features"]:
        p = f["properties"]
        if p["Name"] not in INCLUDE or p.get("MemberOf"): continue
        if p["ToYear"] < YEAR_MIN or p["FromYear"] > YEAR_MAX: continue
        pid, display = INCLUDE[p["Name"]]
        g = make_valid(shape(f["geometry"]))
        ps = [q for q in poly_list(g) if q.area > 0.003]
        if not ps: continue
        g = ps[0] if len(ps) == 1 else MultiPolygon(ps)
        bid = f"{pid}-{p['FromYear']}"
        if bid in labels: continue
        biggest = max(ps, key=lambda q: q.area)
        pt = polylabel(biggest, tolerance=0.02)
        labels[bid] = [round(pt.x, 3), round(pt.y, 3)]
        m = mapping(g)
        boundaries.append({"polityId": pid, "validFrom": p["FromYear"], "validTo": p["ToYear"], "source": p["Name"],
                           "geometry": {"type": m["type"], "coordinates": rnd(m["coordinates"])}})
        meta.setdefault(pid, {"display": display, "names": set(), "wikipedia": p["Wikipedia"], "wikidata": p["Wikidata"], "from": 9999, "to": -9999, "pts": [], "bounds": [999, 999, -999, -999]})
        e = meta[pid]; b = g.bounds; e["bounds"] = [min(e["bounds"][0], b[0]), min(e["bounds"][1], b[1]), max(e["bounds"][2], b[2]), max(e["bounds"][3], b[3])]; e["names"].add(p["Name"]); e["from"] = min(e["from"], p["FromYear"]); e["to"] = max(e["to"], p["ToYear"]); e["pts"].append((pt.x, pt.y, g.area))
        if p["Name"] in ("Pandya Empire",): e["wikipedia"], e["wikidata"] = p["Wikipedia"], p["Wikidata"]
    boundaries.sort(key=lambda b: (b["polityId"], b["validFrom"]))
    print(len(meta), "kingdoms,", len(boundaries), "border snapshots")

    polities, places, images, seen_places = [], [], {}, set()
    for pid, e in sorted(meta.items(), key=lambda kv: kv[1]["from"]):
        title = urllib.parse.quote(e["wikipedia"], safe="_()%,'")
        if pid in WIKI_TITLE:
            title = WIKI_TITLE[pid]
        wp = get(f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}", f"wp-{pid}-{title}.json" if pid in WIKI_TITLE else f"wp-{pid}.json")
        wd_id = e["wikidata"]
        wd = get(f"https://www.wikidata.org/wiki/Special:EntityData/{wd_id}.json", f"wd-{wd_id}.json")["entities"][wd_id]
        caps = []
        for c in wd["claims"].get("P36", [])[:6]:
            try: cid = c["mainsnak"]["datavalue"]["value"]["id"]
            except KeyError: continue
            ce = get(f"https://www.wikidata.org/wiki/Special:EntityData/{cid}.json", f"wd-{cid}.json")["entities"][cid]
            coord = ce["claims"].get("P625")
            if not coord: continue
            v = coord[0]["mainsnak"]["datavalue"]["value"]
            name = ce["labels"].get("en", {}).get("value")
            if not name or name in [x[0] for x in caps]: continue
            caps.append((name, v["longitude"], v["latitude"], cid, ce))
            if len(caps) == 3: break
        # photograph: the Wikipedia lead image if it is a real photo, else a capital's image
        cand = []
        orig = (wp.get("originalimage") or {}).get("source")
        if orig and not re.search(r"map|flag|coat|emblem|seal|logo|\.svg|banner|territor|extent|empire_", orig, re.I): cand.append(orig)
        for _, _, _, _, ce in caps:
            for c in ce["claims"].get("P18", [])[:1]:
                cand.append("File:" + c["mainsnak"]["datavalue"]["value"])
        credit = None
        for src in (cand if pid in IMAGE_OK else []):
            fname = urllib.parse.unquote(src.rsplit("/", 1)[-1]) if src.startswith("http") else src[5:]
            fname = fname.replace("_", " ")
            if re.search(r"\.(svg|tif|tiff|gif|webp|pdf|ogv)$", fname, re.I): continue
            q = urllib.parse.urlencode({"action": "query", "titles": "File:" + fname, "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 1600, "format": "json"})
            info = get("https://commons.wikimedia.org/w/api.php?" + q, "cm-" + hashlib.md5(fname.encode()).hexdigest() + ".json")
            page = next(iter(info["query"]["pages"].values()))
            if "imageinfo" not in page: continue
            ii = page["imageinfo"][0]; m = ii["extmetadata"]
            lic = m.get("LicenseShortName", {}).get("value", "")
            if not re.match(r"(CC BY|CC0|Public domain|PD|CC-BY|Attribution)", lic, re.I) or re.search(r"\bNC\b|ND", lic): continue
            if ii["width"] < 900 or ii["height"] > ii["width"] * 1.2: continue
            artist = re.sub(r"<[^>]+>", "", m.get("Artist", {}).get("value", "")).strip() or "Unknown"
            data = get(ii["thumburl"], f"img-{hashlib.md5(fname.encode()).hexdigest()}.jpg", binary=True)
            if len(data) < 20000: continue
            open(os.path.join(ROOT, "public/images", f"imp-{pid}.jpg"), "wb").write(data)
            credit = {"file": f"/images/imp-{pid}.jpg", "alt": f"{e['display']}: {re.sub(chr(10), ' ', fname.rsplit('.', 1)[0])}"[:160],
                      "title": fname.rsplit(".", 1)[0][:90], "artist": artist[:80], "license": lic, "sourceUrl": ii["descriptionurl"]}
            break
        if credit: images[f"imp-{pid}"] = credit
        elif os.path.exists(os.path.join(ROOT, "public/images", f"imp-{pid}.jpg")): os.remove(os.path.join(ROOT, "public/images", f"imp-{pid}.jpg"))

        lon = sum(x * a for x, _, a in e["pts"]) / sum(a for _, _, a in e["pts"]); lat = sum(y * a for _, y, a in e["pts"]) / sum(a for _, _, a in e["pts"])
        for name, clon, clat, cid, _ in caps:
            if name.lower() in seen_places or name.lower() in SKIP_PLACES: continue
            seen_places.add(name.lower())
            places.append({"id": re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-"), "name": name, "coordinates": [round(clon, 4), round(clat, 4)], "region": region(clon, clat), "wikidata": cid})
        wname = "Delhi Sultanate" if pid == "delhi-sultanate" else e["display"]
        polities.append({
            "id": pid, "name": e["display"], "from": e["from"], "to": e["to"], "wikipedia": e["wikipedia"], "wikidata": wd_id,
            "title": wp.get("title", wname), "summary": summary_for(wp, e),
            "capitals": [c[0] for c in caps],
            "region": REGION_OVERRIDE.get(pid) or region(lon, lat), "accentColor": accent(pid),
            "imageKey": f"imp-{pid}" if credit else None, "curated": pid in CURATED,
        })
        print(f"  {pid:20s} {e['from']:5d}-{e['to']:5d} caps={len(caps)} img={'y' if credit else '-'} {wp.get('title')}")

    os.makedirs(os.path.join(ROOT, "lib/data/generated"), exist_ok=True)
    json.dump(boundaries, open(os.path.join(ROOT, "lib/data/geo/cliopatria-boundaries.json"), "w"), separators=(",", ":"))
    old_labels = {"chera-800": [76.7382, 9.8037]}  # Chera keeps its hand-built shape (no Cliopatria equivalent)
    json.dump({**old_labels, **labels}, open(os.path.join(ROOT, "lib/data/geo/labels.json"), "w"), indent=0)
    json.dump(polities, open(os.path.join(ROOT, "lib/data/generated/imported-polities.json"), "w"), indent=1, ensure_ascii=False)
    json.dump(places, open(os.path.join(ROOT, "lib/data/generated/imported-places.json"), "w"), indent=1, ensure_ascii=False)
    json.dump(images, open(os.path.join(ROOT, "lib/data/generated/imported-images.json"), "w"), indent=1, ensure_ascii=False)
    print("images", len(images), "places", len(places))

if __name__ == "__main__":
    main()
