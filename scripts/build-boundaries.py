"""Rebuilds the dated kingdom outlines in lib/data/geo/.

Inputs, in the working directory:
  districts.geojson   — github.com/guneetnarula/indian-district-boundaries
                        (topojson/india-districts-2019-734.json, converted
                        with `npx mapshaper ... -o format=geojson`)
  ne_admin1.geojson   — Natural Earth 10m admin-1 states/provinces
  orig-*.json         — lib/data/geo/*.json as last committed (the shapes
                        this script reuses), via `git show HEAD:...`
Run with a Python that has shapely installed.

Method: unions of modern districts, small fragments dropped, simplified,
sliver holes removed; frontier bands sized to ~28% of each shape; label
points at each shape's pole of inaccessibility. Writes boundaries,
frontiers and labels JSON keyed `${polityId}-${validFrom}`, then reports
any two kingdoms that claim the same land at the same time."""
import json, sys
from shapely.geometry import shape, mapping, MultiPolygon, Polygon
from shapely.ops import unary_union, polylabel
from shapely.validation import make_valid

import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lib", "data", "geo")
D = {}
for f in json.load(open("districts.geojson"))["features"]:
    if f["geometry"]:
        D[(f["properties"]["st_nm"], f["properties"]["district"])] = make_valid(shape(f["geometry"]))
NE = {}
for f in json.load(open("ne_admin1.geojson"))["features"]:
    p = f["properties"]
    if p["admin"] in ("Sri Lanka", "Bangladesh", "Pakistan"):
        NE[(p["admin"], p["name"])] = make_valid(shape(f["geometry"]))
# Originals from the last commit, never this script's own output.
old = json.load(open("orig-boundaries.json"))

def dist(state, names=None, where=None):
    out = []
    for (st, n), g in D.items():
        if st != state: continue
        if names is not None and n not in names: continue
        if where and not where(g): continue
        out.append(g)
    if names is not None:
        found = {n for (st, n) in D if st == state and n in names}
        missing = set(names) - found
        if missing: sys.exit(f"missing in {state}: {missing}")
    return out

def ne(country, names):
    gs = [NE[(country, n)] for n in names]
    return gs

def polys(geom):
    if geom.geom_type == "Polygon": return [geom]
    if geom.geom_type == "MultiPolygon": return list(geom.geoms)
    return [q for g in geom.geoms for q in polys(g)] if hasattr(geom, "geoms") else []

def clean(geom, tol):
    geom = make_valid(geom)
    # Close hairline gaps where two source datasets meet (India/Bangladesh/Pakistan).
    geom = geom.buffer(0.02, join_style="mitre").buffer(-0.02, join_style="mitre")
    geom = make_valid(geom.simplify(tol, preserve_topology=True))
    ps = polys(geom)
    total = sum(p.area for p in ps)
    kept = []
    for p in ps:
        if p.area < total * 0.01: continue
        holes = [r for r in p.interiors if Polygon(r).area > 0.05]  # drop sliver holes
        kept.append(Polygon(p.exterior, holes))
    return kept[0] if len(kept) == 1 else MultiPolygon(kept)

def old_shape(key): return make_valid(shape(old[key]))

TN = "Tamil Nadu"; KA = "Karnataka"
chola_tamil = old_shape("chola-850")
sl_north = ne("Sri Lanka", ["Yāpanaya", "Kilinŏchchi", "Mulativ", "Mannārama", "Vavuniyāva", "Anurādhapura", "Pŏḷŏnnaruva", "Trikuṇāmalaya"])
pandya_south = old_shape("pandya-1190")
up_west = dist("Uttar Pradesh", where=lambda g: g.centroid.x < 82.3)
malwa = dist("Madhya Pradesh", ["Ujjain", "Indore", "Dewas", "Dhar", "Ratlam", "Mandsaur", "Neemuch", "Shajapur", "Agar Malwa", "Rajgarh", "Sehore", "Bhopal"])
delhi_core = dist("Delhi") + dist("Haryana") + dist("Punjab") + ne("Pakistan", ["Punjab"]) + dist("Uttar Pradesh")
bahmani_lands = (dist(KA, ["Kalaburagi", "Bidar", "Yadgir", "Vijayapura"])
    + dist("Maharashtra", ["Aurangabad", "Jalna", "Bid", "Latur", "Osmanabad", "Nanded", "Parbhani", "Hingoli", "Solapur"])
    + dist("Telangana", ["Hyderabad", "Ranga Reddy", "Medchal Malkajgiri", "Vikarabad", "Sangareddy", "Medak", "Siddipet", "Kamareddy",
        "Nizamabad", "Karimnagar", "Jagitial", "Rajanna Sircilla", "Peddapalli", "Warangal Urban", "Warangal Rural", "Jangoan",
        "Yadadri Bhuvanagiri", "Nalgonda", "Mahabubnagar", "Narayanpet"]))

S = {  # key: (geometry parts, simplify tolerance)
  "chola-850": (dist(TN, ["Thanjavur", "Thiruvarur", "Nagapattinam", "Tiruchirappalli", "Ariyalur", "Perambalur", "Pudukkottai", "Karur"]), 0.03),
  "chola-985": ([chola_tamil], 0.0),
  "chola-993": ([chola_tamil] + sl_north, 0.04),
  "chola-1071": ([chola_tamil], 0.0),
  "chola-1251": (dist(TN, ["Thanjavur", "Thiruvarur", "Nagapattinam"]), 0.02),
  "pandya-1190": ([pandya_south], 0.0),
  "pandya-1251": ([pandya_south] + dist(TN, ["Pudukkottai", "Tiruchirappalli", "Karur", "Ariyalur", "Perambalur", "Cuddalore", "Viluppuram",
                   "Kallakurichi", "Kancheepuram", "Chengalpattu", "Tiruvannamalai"]), 0.04),
  "pandya-1311": ([pandya_south], 0.0),
  "hoysala-1026": (dist(KA, ["Hassan", "Chikkamagaluru"]), 0.02),
  "hoysala-1117": ([old_shape("hoysala-1026")], 0.0),
  "vijayanagara-1336": ([old_shape("vijayanagara-1336").difference(unary_union(dist(KA, ["Kalaburagi", "Bidar", "Yadgir", "Vijayapura"])).buffer(0.01))], 0.04),
  "vijayanagara-1566": (dist("Andhra Pradesh", ["Anantapur", "Chittoor", "Y.S.R."]) + dist(TN, ["Vellore", "Tiruvannamalai", "Krishnagiri", "Ranipet", "Tirupathur"])
                        + dist(KA, ["Kolar", "Chikkaballapura"]), 0.04),
  "pala-750": (dist("West Bengal", ["Maldah", "Dakshin Dinajpur", "Uttar Dinajpur", "Murshidabad"]) + ne("Bangladesh", ["Rajshahi", "Rangpur"]), 0.04),
  "pala-770": (dist("Bihar") + dist("West Bengal", where=lambda g: g.centroid.y < 26.6) + ne("Bangladesh", ["Rajshahi", "Rangpur", "Dhaka", "Khulna"]), 0.05),
  "pratihara-730": (dist("Rajasthan", ["Jalor", "Sirohi", "Barmer", "Jodhpur", "Pali", "Udaipur", "Rajsamand", "Chittaurgarh", "Bhilwara", "Ajmer", "Nagaur"]) + malwa, 0.05),
  "pratihara-816": (dist("Rajasthan") + malwa + dist("Madhya Pradesh", ["Vidisha", "Raisen", "Guna", "Ashoknagar", "Shivpuri", "Gwalior", "Morena", "Bhind", "Datia", "Sheopur"])
                    + up_west + dist("Haryana") + dist("Delhi"), 0.06),
  "pratihara-916": (dist("Uttar Pradesh", ["Kannauj", "Farrukhabad", "Etawah", "Mainpuri", "Auraiya", "Kanpur Nagar", "Kanpur Dehat", "Hardoi", "Etah", "Kasganj", "Unnao", "Firozabad"]), 0.03),
  "delhi-sultanate-1206": (delhi_core + dist("Bihar"), 0.06),
  "delhi-sultanate-1296": (delhi_core + dist("Bihar") + dist("Rajasthan") + dist("Gujarat") + dist("Madhya Pradesh") + dist("Maharashtra") + dist("Telangana"), 0.07),
  "delhi-sultanate-1336": (delhi_core, 0.06),
  "bahmani-1347": (bahmani_lands, 0.05),
  "bahmani-1490": (dist(KA, ["Bidar"]) + dist("Maharashtra", ["Latur", "Osmanabad"]), 0.03),
}
KEEP = ["chera-800", "rashtrakuta-753", "chalukya-kalyani-973"]

def rnd(o):
    if isinstance(o, float): return round(o, 4)
    if isinstance(o, (list, tuple)): return [rnd(x) for x in o]
    return o

def frontier(poly):
    lo, hi = 0.01, 0.28
    for _ in range(18):
        mid = (lo + hi) / 2
        frac = poly.difference(poly.buffer(-mid)).area / poly.area
        hi, lo = (mid, lo) if frac > 0.28 else (hi, mid)
    band = make_valid(poly.difference(poly.buffer(-lo, join_style="round")).simplify(0.01, preserve_topology=True))
    ps = polys(band)
    return ps[0] if len(ps) == 1 else MultiPolygon(ps)

oldF = json.load(open("orig-frontiers.json")); oldL = json.load(open("orig-labels.json"))
B, F, L = {}, {}, {}
cache = {}
for key, (parts, tol) in S.items():
    g = unary_union(parts)
    g = make_valid(g) if tol == 0 else clean(g, tol)
    B[key] = {"type": mapping(g)["type"], "coordinates": rnd(mapping(g)["coordinates"])}
    F[key] = {k: rnd(v) if k == "coordinates" else v for k, v in mapping(frontier(g)).items()}
    biggest = max(polys(g), key=lambda p: p.area)
    # The Sultanate's label belongs over Delhi and the Ganga plain, not at
    # the widest point of its outline (which falls in western Punjab).
    if key.startswith("delhi-sultanate"):
        from shapely.geometry import box
        core = max(polys(make_valid(biggest.intersection(box(76.5, 25.0, 81.5, 30.0)))), key=lambda p: p.area)
        pt = polylabel(core, tolerance=0.01)
    else:
        pt = polylabel(biggest, tolerance=0.01)
    L[key] = [round(pt.x, 4), round(pt.y, 4)]
    n = sum(len(r.coords) for p in polys(g) for r in [p.exterior, *p.interiors])
    print(f"{key:24s} {g.geom_type:12s} pts {n:4d} area {g.area:6.2f} label {L[key]}")
for k in KEEP:
    B[k], F[k], L[k] = old[k], oldF[k], oldL[k]

# No two shapes of different kingdoms should claim much of the same land at the same time.
spans = {"chola-850": (850, 984), "chola-985": (985, 992), "chola-993": (993, 1070), "chola-1071": (1071, 1250), "chola-1251": (1251, 1279),
  "pandya-1190": (1190, 1250), "pandya-1251": (1251, 1310), "pandya-1311": (1311, 1345), "hoysala-1026": (1026, 1116), "hoysala-1117": (1117, 1343),
  "vijayanagara-1336": (1336, 1565), "vijayanagara-1566": (1566, 1646), "pala-750": (750, 769), "pala-770": (770, 1161),
  "pratihara-730": (730, 815), "pratihara-816": (816, 915), "pratihara-916": (916, 1036),
  "delhi-sultanate-1206": (1206, 1295), "delhi-sultanate-1296": (1296, 1335), "delhi-sultanate-1336": (1336, 1526),
  "bahmani-1347": (1347, 1489), "bahmani-1490": (1490, 1527), "chera-800": (800, 1124), "rashtrakuta-753": (753, 982), "chalukya-kalyani-973": (973, 1189)}
shapes = {k: make_valid(shape(v)) for k, v in B.items()}
pid = lambda k: k.rsplit("-", 1)[0]
for a in spans:
    for b in spans:
        if a >= b or pid(a) == pid(b): continue
        (a0, a1), (b0, b1) = spans[a], spans[b]
        if a0 > b1 or b0 > a1: continue
        inter = shapes[a].intersection(shapes[b]).area
        if inter > 0.15: print(f"  overlap {a} × {b} ({max(a0,b0)}–{min(a1,b1)}): {inter:.2f} sq°")
json.dump(B, open(f"{ROOT}/boundaries.json", "w")); json.dump(F, open(f"{ROOT}/frontiers.json", "w")); json.dump(L, open(f"{ROOT}/labels.json", "w"), indent=1)
