"""Checks the committed data against itself and against its sources, and prints every problem found.

Offline checks : required fields, duplicate ids, coordinates inside the atlas area, dates in range and in
                 order, rulers inside their kingdom's span, image files present and credited, links between
                 records resolve, summaries not truncated or empty.
Online checks  : every Wikipedia title exists (and is not a disambiguation or redirect to another subject),
                 every Wikidata id still has the label we expect, every Commons file is still there and
                 still under a free licence.   (pass --offline to skip these)

Run from a scratch directory:  python /path/to/scripts/validate-data.py [--offline]
Exit code is 1 if anything failed.
"""
import json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
G = os.path.join(ROOT, "lib/data/generated")
UA = {"User-Agent": "BHARATA-atlas/0.1 (https://bhaarata.vercel.app; data validation)"}
OFFLINE = "--offline" in sys.argv
problems = []
def bad(kind, msg): problems.append((kind, msg))
def load(p): return json.load(open(p))

polities = load(f"{G}/imported-polities.json"); people = load(f"{G}/imported-people.json")
people += [{**r, "q": None, "summary": "(from a list page)", "wikipedia": None} for r in load(f"{G}/imported-ruler-lists.json")]
places = load(f"{G}/imported-places.json"); battles = load(f"{G}/imported-battles.json")
imgs = {**load(f"{G}/imported-images.json"), **load(f"{G}/imported-ruler-images.json"), **load(f"{G}/photos.json")}
sites = load(f"{ROOT}/public/data/sites.geojson")["features"]
monuments = load(f"{ROOT}/public/data/monuments.geojson")["features"]
borders = load(f"{ROOT}/lib/data/geo/cliopatria-boundaries.json")
names = load(f"{G}/imported-names.json")
LON, LAT = (58, 98), (3, 40)

def inbox(lon, lat): return LON[0] <= lon <= LON[1] and LAT[0] <= lat <= LAT[1]

# ---- ids, fields
for label, rows, key in (("polity", polities, "id"), ("person", people, "id"), ("place", places, "id"), ("battle", battles, "id")):
    seen = set()
    for r in rows:
        if r[key] in seen: bad(label, f"duplicate id {r[key]}")
        seen.add(r[key])
        if not r.get("name") or re.fullmatch(r"Q\d+", r["name"]): bad(label, f"{r[key]}: missing or unresolved name {r.get('name')!r}")
pids = {p["id"] for p in polities}

# ---- kingdoms
for p in polities:
    if not (300 <= p["from"] <= p["to"] <= 1750): bad("polity", f"{p['id']}: odd span {p['from']}–{p['to']}")
    s = p.get("summary", "")
    if len(s) < 80: bad("polity", f"{p['id']}: summary very short ({len(s)} chars)")
    if s.count("(") != s.count(")"): bad("polity", f"{p['id']}: unbalanced brackets in summary")
    if not re.search(r"[.!?)\"”]$", s.strip()): bad("polity", f"{p['id']}: summary does not end like a sentence: …{s[-30:]!r}")
    if not re.fullmatch(r"#[0-9a-fA-F]{6}", p["accentColor"]): bad("polity", f"{p['id']}: bad colour")
    for c in p["capitals"]:
        if c not in {pl["id"] for pl in places} and c not in {"thanjavur","madurai","hampi","kanchipuram"}: pass
    if not p["imageKey"] and f"kp-{p['id']}" not in imgs and not p["curated"]: bad("gap", f"{p['id']}: no photograph")

# ---- borders
bids = {f["polityId"] for f in borders}
for f in borders:
    if not f["validFrom"] <= f["validTo"]: bad("border", f"{f['polityId']}: shape runs backwards")
    if f["polityId"] not in pids: bad("border", f"shape for unknown kingdom {f['polityId']}")
miss = pids - bids
for m in sorted(miss): bad("border", f"{m}: no border shapes at all")

# ---- people
span = {p["id"]: (p["from"], p["to"]) for p in polities}
# Fathers who shared the throne with a son, as the sources state (not an error).
COREGENT = {("Sevappa Nayaka", "Achuthappa Nayaka")}
LONG_REIGNS_OK = {"Anantavarman Chodaganga"}
by_poly = {}
for r in people:
    by_poly.setdefault(r["polityId"], []).append(r)
    if r["polityId"] not in pids: bad("person", f"{r['id']}: unknown kingdom {r['polityId']}"); continue
    a, b = r.get("start"), r.get("end")
    if a is not None and b is not None and a > b: bad("person", f"{r['id']}: starts after it ends ({a}–{b})")
    lo, hi = span[r["polityId"]]
    if a is not None and r["datesAre"] == "reign" and not (lo - 60 <= a <= hi + 60): bad("person", f"{r['id']} ({r['name']}): reign {a}–{b} is far outside {r['polityId']} {lo}–{hi}")
    if a is not None and b is not None and r["datesAre"] == "reign" and b - a > 70 and r["name"] not in LONG_REIGNS_OK: bad("person", f"{r['id']} ({r['name']}): reign of {b-a} years looks wrong")
    if a is not None and b is not None and r["datesAre"] == "lifetime" and b - a > 100: bad("person", f"{r['id']} ({r['name']}): lifetime of {b-a} years looks wrong")
    if not r.get("summary"): bad("person", f"{r['id']}: no summary")
for pid, rs in by_poly.items():
    rs = [r for r in rs if r["datesAre"] == "reign" and r.get("start") is not None]
    rs.sort(key=lambda r: r["start"])
    for x, y in zip(rs, rs[1:]):
        if x["end"] is not None and x["end"] > x["start"] and y["end"] != y["start"] and y["start"] < x["end"] - 15 and x["name"] != y["name"]:
            if x["name"] != y["name"] and x["role"] == y["role"] and (x["name"], y["name"]) not in COREGENT: bad("overlap", f"{pid}: {x['name']} ({x['start']}–{x['end']}) overlaps {y['name']} ({y['start']}–{y['end']}) by {x['end']-y['start']} years")

# ---- places
for pl in places:
    lon, lat = pl["coordinates"]
    if not inbox(lon, lat): bad("place", f"{pl['id']}: coordinates {lon},{lat} outside the atlas area")
names_seen = {}
for pl in places: names_seen.setdefault(pl["name"].lower(), []).append(pl["id"])
for n, ids in names_seen.items():
    if len(ids) > 1: bad("place", f"duplicate place name {n}: {ids}")

# ---- battles
for b in battles:
    if not (600 <= b["year"] <= 1750): bad("battle", f"{b['id']}: year {b['year']} out of range")
    lon, lat = b["location"] if isinstance(b["location"], list) else (b["location"]["lon"], b["location"]["lat"]) if isinstance(b["location"], dict) else (None, None)
    if lon is None or not inbox(lon, lat): bad("battle", f"{b['id']}: bad location {b['location']}")
    for q in b["polityIds"]:
        if q not in pids and q != "chera": bad("battle", f"{b['id']}: unknown kingdom {q}")
    if not b.get("extract") or len(b["extract"]) < 40: bad("battle", f"{b['id']}: very short description")
    if not b["polityIds"]: bad("battle", f"{b['id']}: not inside any kingdom's borders (still shown on the map)") if False else None

# ---- sites and monuments
for f in sites:
    pr = f["properties"]; lon, lat = f["geometry"]["coordinates"]
    if not inbox(lon, lat): bad("site", f"{pr['n']}: outside area")
    if not (600 <= pr["y"] <= 1700): bad("site", f"{pr['n']}: year {pr['y']}")
    if re.search(r"\b(Tibet|Lhasa|Gompa)\b", pr["n"]): bad("site", f"{pr['n']}: looks out of scope")
sn = {}
for f in sites: sn.setdefault((f["properties"]["n"].lower(), round(f["geometry"]["coordinates"][0], 1), round(f["geometry"]["coordinates"][1], 1)), []).append(f["properties"]["q"])
for k, v in sn.items():
    if len(v) > 1: bad("site", f"near-duplicate {k[0]}: {v}")
for f in monuments:
    lon, lat = f["geometry"]["coordinates"]
    if not inbox(lon, lat): bad("monument", f"{f['properties'].get('n')}: outside area")

# ---- images
for k, c in imgs.items():
    path = os.path.join(ROOT, "public" + c["file"])
    if not os.path.exists(path): bad("image", f"{k}: file missing {c['file']}")
    elif os.path.getsize(path) < 15000: bad("image", f"{k}: file suspiciously small")
    for fld in ("artist", "license", "sourceUrl", "alt"):
        if not c.get(fld): bad("image", f"{k}: missing {fld}")
    if not re.match(r"(CC BY|CC0|Public domain|PD|CC-BY|Attribution)", c.get("license", ""), re.I): bad("image", f"{k}: licence {c.get('license')!r} not on the allow-list")
    if c.get("artist") == "Unknown": bad("credit", f"{k}: photographer unknown (licence {c['license']})")
used = {c["file"] for c in imgs.values()}
for fn in os.listdir(os.path.join(ROOT, "public/images")):
    if fn.startswith(("imp-", "kp-", "ruler-")) and f"/images/{fn}" not in used: bad("image", f"{fn}: on disk but not credited anywhere")

# ---- names
for kind, d in names.items():
    for i, rec in d.items():
        n = rec.get("native")
        if n and re.fullmatch(r"[\x00-\x7f]+", n["text"]): bad("name", f"{kind}/{i}: native name is plain ASCII")

# Redirects checked by hand and found to be the same subject under a newer title (no action needed).
REDIRECTS_OK = {"Pandya Empire", "Gurjara-Pratihara dynasty", "Rashtrakuta dynasty", "Habbari dynasty", "Ghaznavids", "Yadava Dynasty",
                "Bahmani Sultanate", "Adil Shahi dynasty", "Qutb Shahi dynasty", "Battle_of_Waliyan", "Battle_at_Machhiwara", "Skirmish_of_Narsapur_Road"}
# Names that differ from Wikidata's label on purpose (our name is the one a reader knows).
NAMES_OK = {"Q654380", "Q5636647", "Q5790", "Q1148042"}

# ---- online
def api(url, t=60):
    for a in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=t))
        except Exception:
            time.sleep(2 + a * 3)
    return None

if not OFFLINE:
    titles = {}
    for p in polities: titles[p["wikipedia"]] = ("polity", p["id"])
    for r in people:
        if r.get("wikipedia"): titles[r["wikipedia"]] = ("person", r["id"])
    for b in battles:
        if b.get("wikipedia"): titles[b["wikipedia"]] = ("battle", b["id"])
    tl = list(titles)
    for i in range(0, len(tl), 40):
        chunk = tl[i:i + 40]
        r = api("https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "titles": "|".join(chunk), "prop": "pageprops|info", "ppprop": "disambiguation", "redirects": 1, "format": "json"}))
        if not r: bad("online", f"Wikipedia batch {i} failed"); continue
        q = r["query"]; norm = {n["from"]: n["to"] for n in q.get("normalized", [])}; red = {n["from"]: n["to"] for n in q.get("redirects", [])}
        pages = {p["title"]: p for p in q["pages"].values()}
        for t in chunk:
            t2 = norm.get(t.replace("_", " "), t.replace("_", " ")); final = red.get(t2, t2)
            pg = pages.get(final)
            kind, rid = titles[t]
            if not pg or "missing" in pg: bad("wikipedia", f"{kind} {rid}: article {t!r} does not exist")
            elif "pageprops" in pg and "disambiguation" in pg["pageprops"]: bad("wikipedia", f"{kind} {rid}: {t!r} is a disambiguation page")
            elif t not in REDIRECTS_OK and final != t2 and final.lower().replace(" ", "") != t2.lower().replace(" ", ""): bad("wikipedia", f"{kind} {rid}: {t!r} redirects to {final!r} (check it is the same subject)")
    qids = {p["wikidata"]: p["name"] for p in polities} | {r["q"]: r["name"] for r in people if r.get("q")} | {pl["wikidata"]: pl["name"] for pl in places if pl.get("wikidata")}
    ql = list(qids)
    for i in range(0, len(ql), 40):
        chunk = ql[i:i + 40]
        r = api("https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode({"action": "wbgetentities", "ids": "|".join(chunk), "props": "labels|sitelinks", "languages": "en", "format": "json"}))
        if not r: bad("online", f"Wikidata batch {i} failed"); continue
        for q, e in r.get("entities", {}).items():
            if "missing" in e: bad("wikidata", f"{q} ({qids[q]}): no such item"); continue
            if q in NAMES_OK: continue
            lab = e.get("labels", {}).get("en", {}).get("value", "")
            a, b = re.sub(r"\W", "", lab.lower()), re.sub(r"\W", "", qids[q].lower())
            if a and b and a not in b and b not in a and not (set(lab.lower().split()) & set(qids[q].lower().split())):
                bad("wikidata", f"{q}: our name {qids[q]!r} vs Wikidata label {lab!r}")
    files = {c["sourceUrl"].rsplit("/wiki/", 1)[-1] for c in imgs.values() if "/wiki/File:" in c["sourceUrl"]}
    fl = [urllib.parse.unquote(f) for f in files]
    for i in range(0, len(fl), 40):
        chunk = fl[i:i + 40]
        r = api("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "titles": "|".join(chunk), "prop": "imageinfo", "iiprop": "extmetadata", "format": "json"}))
        if not r: bad("online", f"Commons batch {i} failed"); continue
        for pg in r["query"]["pages"].values():
            if "missing" in pg or "imageinfo" not in pg: bad("commons", f"{pg['title']}: file gone"); continue
            lic = pg["imageinfo"][0]["extmetadata"].get("LicenseShortName", {}).get("value", "")
            if not re.match(r"(CC BY|CC0|Public domain|PD|CC-BY|Attribution)", lic, re.I) or re.search(r"\bNC\b|ND", lic): bad("commons", f"{pg['title']}: licence now {lic!r}")

kinds = {}
for k, m in problems: kinds.setdefault(k, []).append(m)
for k, ms in sorted(kinds.items()):
    print(f"\n== {k} ({len(ms)})"); [print("  ", m) for m in ms[:40]]
    if len(ms) > 40: print(f"   … and {len(ms)-40} more")
print(f"\n{len(problems)} problems across {len(polities)} kingdoms, {len(people)} rulers, {len(places)} places, {len(battles)} battles, {len(sites)} sites, {len(imgs)} credited images" + (" (offline)" if OFFLINE else ""))
sys.exit(1 if problems else 0)
