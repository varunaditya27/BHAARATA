"""Imports rulers of the atlas's kingdoms from Wikidata (CC0) and Wikipedia (CC BY-SA 4.0).

A person is included when Wikidata says they are a monarch (occupation or position held is a
kind of "monarch") AND links them to one of our kingdoms, by one of three routes:
  1. country of citizenship / family (dynasty) / a position whose jurisdiction is the kingdom;
  2. a position whose English label names the kingdom ("Chola king", "Mughal emperor", ...).
Reign dates come from the start/end of the office when Wikidata has them; otherwise only the
lifetime is known and the record says so (datesAre: "lifetime"). People with neither are skipped.

Needs : lib/data/generated/imported-polities.json (run import-cliopatria.py first)
Output: lib/data/generated/imported-people.json
Run   : python scripts/import-rulers.py     (responses cached in ./cache)
"""
import hashlib, json, os, re, time, urllib.parse, urllib.request

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
UA = {"User-Agent": "BHARATA-atlas/0.1 (https://bhaarata.vercel.app; data import)"}
os.makedirs("cache", exist_ok=True)

# Position label -> kingdom id. "Chalukya king" names two kingdoms and is settled by the person's dates.
POSITION_TO_POLITY = {
    "Chola king": "chola", "Pandya King": "pandya", "Sultan of the Ghaznavid Empire": "ghaznavid",
    "Mughal emperor": "mughal", "Hoysala king": "hoysala", "Pallava king": "pallava",
    "Rashtrakuta emperor": "rashtrakuta", "King of Sena": "sena", "Chalukya king": "chalukya",
    "Vijayanagara monarch": "vijayanagara", "Sultan of Hindustan (Sultan of Delhi)": "delhi-sultanate",
    "Sultan of Delhi": "delhi-sultanate", "Sultan of Bengal": "bengal-sultanate", "Sultan of Bijapur": "bijapur",
    "Ahmadnagar Sultan": "ahmadnagar", "Bahmani Sultan": "bahmani", "King of Jaffna": "jaffna",
    "King of Polonnaruwa": "polonnaruwa", "King of Dambadeniya": "dambadeniya", "King of Anuradhapura": "anuradhapura",
    "Jaunpur Sultanate": "jaunpur", "Maharaja of Mysore": "mysore",
}

def fetch(url, key):
    path = f"cache/{key}"
    if os.path.exists(path): return json.load(open(path))
    for attempt in range(5):
        try:
            obj = json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=170).read()); break
        except Exception:
            if attempt == 4: raise
            time.sleep(3 + attempt * 4)
    json.dump(obj, open(path, "w")); return obj

def sparql(q, key):
    return fetch("https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(q), key)["results"]["bindings"]

def year(v):
    m = re.match(r"(-?)(\d{4})", v or "")
    return None if not m or m.group(1) else int(m.group(2))

def clean_summary(text):
    text = re.sub(r"\s*\([^)]*[^\x00-\x7f][^)]*\)", "", text or "")
    text = re.sub(r"\s*\((?:[^()]{0,3}|[^()]*(?:pronounced|IPA|born|died|r\.|c\.|reigned)[^()]*)\)", "", text)
    text = re.sub(r"\[\d+\]", "", text)
    out = ""
    for s in re.split(r"(?<=[.!?])\s+(?=[A-Z])", text.strip()):
        if out and len(out) + len(s) > 330: break
        out += (" " if out else "") + s
    return out if out.count("(") == out.count(")") else ""

REIGN_PATTERNS = [
    re.compile(r"\br\.?\s*(?:c\.\s*)?(\d{3,4})\s*[–—-]\s*(\d{3,4})"),
    re.compile(r"\b(?:ruled|reigned)\b[^.]{0,60}?\bfrom\s+(?:c\.\s*)?(\d{3,4})\s+(?:to|until)\s+(?:c\.\s*)?(\d{3,4})"),
    re.compile(r"\b(?:ruled|reigned)\b[^.]{0,40}?\b(?:c\.\s*)?(\d{3,4})\s*[–—-]\s*(\d{3,4})"),
]

def reign_from_text(text):
    """A reign stated outright in the Wikipedia lead, or None. Deliberately narrow."""
    for rx in REIGN_PATTERNS:
        m = rx.search(text or "")
        if m:
            a, z = int(m.group(1)), int(m.group(2))
            if 600 <= a < z <= 1750 and z - a <= 60: return a, z
    return None

def norm(s): return re.sub(r"[^a-z0-9]", "", s.lower())

def main():
    pols = json.load(open(os.path.join(ROOT, "lib/data/generated/imported-polities.json")))
    spans = {}
    for b in json.load(open(os.path.join(ROOT, "lib/data/geo/cliopatria-boundaries.json"))):
        a, z = spans.get(b["polityId"], (9999, -9999)); spans[b["polityId"]] = (min(a, b["validFrom"]), max(z, b["validTo"]))
    byq = {p["wikidata"]: p["id"] for p in pols}
    ids = " ".join("wd:" + q for q in byq)

    route_a = sparql(f"""SELECT DISTINCT ?p ?pLabel ?s ?occLabel ?birth ?death ?article WHERE {{
      VALUES ?s {{ {ids} }}
      {{ ?p wdt:P27 ?s }} UNION {{ ?p wdt:P53 ?s }} UNION {{ ?pos wdt:P1001 ?s . ?p wdt:P39 ?pos }}
      ?p wdt:P31 wd:Q5 . {{ ?p wdt:P106 ?occ }} UNION {{ ?p wdt:P39 ?occ }} ?occ wdt:P279* wd:Q116 .
      OPTIONAL {{ ?p wdt:P569 ?birth }} OPTIONAL {{ ?p wdt:P570 ?death }}
      OPTIONAL {{ ?article schema:about ?p ; schema:isPartOf <https://en.wikipedia.org/> }}
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }} }}""", "rulers-a.json")
    # Resolve each exact position name to its Wikidata item first (a label scan over every position times out).
    pos_ids, pos_label = [], {}
    for label in POSITION_TO_POLITY:
        found = fetch("https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&type=item&limit=10&search=" + urllib.parse.quote(label), "pos-" + re.sub(r"\W+", "-", label.lower()) + ".json")
        for hit in found.get("search", []):
            if hit.get("label", "").lower() == label.lower():
                pos_ids.append("wd:" + hit["id"]); pos_label[hit["id"]] = label
    wanted = " ".join(pos_ids)
    route_b = sparql(f"""SELECT DISTINCT ?p ?pLabel ?posLabel ?birth ?death ?article WHERE {{
      VALUES ?pos {{ {wanted} }}
      ?p wdt:P31 wd:Q5 ; wdt:P39 ?pos . ?pos rdfs:label ?posLabel . FILTER(LANG(?posLabel) = "en")
      OPTIONAL {{ ?p wdt:P569 ?birth }} OPTIONAL {{ ?p wdt:P570 ?death }}
      OPTIONAL {{ ?article schema:about ?p ; schema:isPartOf <https://en.wikipedia.org/> }}
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }} }}""", "rulers-b3.json")

    people = {}
    def add(x, polity, role):
        q = x["p"]["value"].rsplit("/", 1)[-1]
        d = people.setdefault(q, {"q": q, "name": x["pLabel"]["value"], "birth": year(x.get("birth", {}).get("value")),
                                  "death": year(x.get("death", {}).get("value")), "polities": set(), "roles": set(),
                                  "wikipedia": urllib.parse.unquote(x["article"]["value"].rsplit("/wiki/", 1)[-1]) if "article" in x else None})
        if polity: d["polities"].add(polity)
        if role: d["roles"].add(role)
    for x in route_a: add(x, byq[x["s"]["value"].rsplit("/", 1)[-1]], x["occLabel"]["value"] if "occLabel" in x else None)
    for x in route_b:
        pid = POSITION_TO_POLITY.get(x["posLabel"]["value"])
        if pid is None: continue
        add(x, pid, x["posLabel"]["value"])

    # Reign dates: start/end qualifiers of monarch offices, where Wikidata has them.
    qids = " ".join("wd:" + q for q in people)
    reigns = {}
    for x in sparql(f"""SELECT ?p ?start ?end WHERE {{ VALUES ?p {{ {qids} }}
      ?p p:P39 ?st . ?st ps:P39 ?pos ; pq:P580 ?start . ?pos wdt:P279* wd:Q116 . OPTIONAL {{ ?st pq:P582 ?end }} }}""", "rulers-reigns.json"):
        q = x["p"]["value"].rsplit("/", 1)[-1]
        s, e = year(x["start"]["value"]), year(x.get("end", {}).get("value"))
        if s is None: continue
        a, z = reigns.get(q, (s, e)); reigns[q] = (min(a, s), None if (e is None or z is None) else max(z, e))

    out, skipped = [], {"no dates": 0, "out of range": 0, "no kingdom": 0}
    for q, d in people.items():
        # Settle "Chalukya king" (Badami or Kalyani) and multi-kingdom people by overlap with each kingdom's span.
        cands = set(d["polities"])
        if "chalukya" in cands:
            cands.discard("chalukya"); cands |= {"chalukya-badami", "chalukya-kalyani"}
        wp = None
        if d["wikipedia"]:
            try: wp = fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(d["wikipedia"], safe="_()%,'"), f"wp-ruler-{q}.json")
            except Exception: wp = None
        r = reigns.get(q)
        # A "reign" over 60 years is another office's dates mixed in; fall back to the lifetime.
        if r and r[1] is not None and r[1] - r[0] > 60: r = None
        text_reign = None
        if r: start, end, kind = r[0], r[1], "reign"
        elif d["birth"] and d["death"]: start, end, kind = d["birth"], d["death"], "lifetime"
        elif wp and (text_reign := reign_from_text(wp.get("extract"))): start, end, kind = text_reign[0], text_reign[1], "reign"
        else: skipped["no dates"] += 1; continue
        if (end or start) < 600 or start > 1700: skipped["out of range"] += 1; continue
        def overlap(pid):
            a, z = spans.get(pid, (9999, -9999)); return min(z, end or start) - max(a, start)
        best = max(cands, key=overlap) if cands else None
        if best is None or overlap(best) < 0: skipped["no kingdom"] += 1; continue
        # Consorts and other royals are not rulers, whatever Wikidata's class tree says.
        if d["roles"] and all("consort" in r.lower() for r in d["roles"]): skipped["no kingdom"] += 1; continue
        summary = clean_summary(wp.get("extract")) if wp else ""
        # Prefer a specific title ("Sultan", "King") over the generic "monarch"; say "Ruler" only as a last resort.
        roles = sorted((r for r in d["roles"] if not re.fullmatch(r"Q\d+", r)), key=lambda r: (r.lower() == "monarch", len(r)))
        role = (roles[0][0].upper() + roles[0][1:]) if roles else "Ruler"
        if role.lower() == "monarch": role = "Ruler"
        out.append({"id": re.sub(r"[^a-z0-9]+", "-", d["name"].lower()).strip("-") or q.lower(), "q": q, "name": d["name"], "role": role,
                    "polityId": best, "start": start, "end": end, "datesAre": kind, "datesFromText": bool(text_reign), "wikipedia": d["wikipedia"], "summary": summary})
    # unique ids
    seen = {}
    for p in out:
        n = seen.get(p["id"], 0); seen[p["id"]] = n + 1
        if n: p["id"] = f"{p['id']}-{p['q'].lower()}"
    out.sort(key=lambda p: (p["polityId"], p["start"]))

    # Images: whatever Wikidata links for the person (a painting, coin, statue or relief), free licences only.
    # The credit keeps the file's real title, so a modern statue is never passed off as a contemporary portrait.
    credits = {}
    for p in out:
        ent = fetch(f"https://www.wikidata.org/wiki/Special:EntityData/{p['q']}.json", f"wd-{p['q']}.json")["entities"][p["q"]]
        for c in ent["claims"].get("P18", [])[:2]:
            try: fname = c["mainsnak"]["datavalue"]["value"].replace("_", " ")
            except KeyError: continue
            if re.search(r"\.(svg|tif|tiff|gif|webp|pdf|ogv)$", fname, re.I): continue
            # Wikidata's "image" is sometimes a map, a tomb or a garden named after the ruler. Not a depiction of them.
            if re.search(r"\b(map|territor|tomb|garden|entrance|grave|mausoleum|dargah|fort|view|ruin|cemetery|inscription|gate|temple|mosque|panorama|pancha|rathas|house of)", fname, re.I): continue
            q = urllib.parse.urlencode({"action": "query", "titles": "File:" + fname, "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 700, "format": "json"})
            info = fetch("https://commons.wikimedia.org/w/api.php?" + q, "cm-" + hashlib.md5(fname.encode()).hexdigest() + "-700.json")
            page = next(iter(info["query"]["pages"].values()))
            if "imageinfo" not in page: continue
            ii = page["imageinfo"][0]; m = ii["extmetadata"]
            lic = m.get("LicenseShortName", {}).get("value", "")
            if not re.match(r"(CC BY|CC0|Public domain|PD|CC-BY|Attribution)", lic, re.I) or re.search(r"\bNC\b|ND", lic): continue
            if ii["width"] < 350 or not (0.5 <= ii["height"] / ii["width"] <= 1.7): continue
            artist = re.sub(r"<[^>]+>", "", m.get("Artist", {}).get("value", "")).strip() or "Unknown"
            req = urllib.request.Request(ii["thumburl"], headers=UA)
            cache = f"cache/img-{hashlib.md5(fname.encode()).hexdigest()}-700.jpg"
            if not os.path.exists(cache):
                for attempt in range(4):
                    try: open(cache, "wb").write(urllib.request.urlopen(req, timeout=60).read()); break
                    except Exception:
                        if attempt == 3: raise
                        time.sleep(3 + attempt * 3)
            data = open(cache, "rb").read()
            if len(data) < 8000: continue
            open(os.path.join(ROOT, "public/images", f"ruler-{p['id']}.jpg"), "wb").write(data)
            key = f"ruler-{p['id']}"
            credits[key] = {"file": f"/images/{key}.jpg", "alt": f"{p['name']}: {fname.rsplit('.', 1)[0]}"[:160], "title": fname.rsplit(".", 1)[0][:90],
                            "artist": artist[:80], "license": lic, "sourceUrl": ii["descriptionurl"]}
            p["imageKey"] = key
            break
    json.dump(credits, open(os.path.join(ROOT, "lib/data/generated/imported-ruler-images.json"), "w"), indent=1, ensure_ascii=False)
    print(len(credits), "rulers with a free-licence image")
    json.dump(out, open(os.path.join(ROOT, "lib/data/generated/imported-people.json"), "w"), indent=1, ensure_ascii=False)
    kinds = [p["datesAre"] for p in out]
    print(len(out), "rulers;", kinds.count("reign"), "with reign dates,", kinds.count("lifetime"), "lifetime only;", sum(bool(p["summary"]) for p in out), "with a summary; skipped", skipped)

if __name__ == "__main__":
    main()
