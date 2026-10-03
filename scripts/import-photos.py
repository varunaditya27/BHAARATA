"""Finds and downloads a photograph for kingdoms and places that have none, from Wikimedia Commons.

Only free licences are accepted (CC BY, CC BY-SA, CC0, public domain). Choosing is a human step:

  1. `python scripts/import-photos.py candidates`
       Searches Commons using the queries in QUERIES (the best-known monument of each kingdom) and
       writes contact sheets to ./cache/sheet-*.jpg, numbering the candidates. Needs Pillow.
  2. Look at the sheets and record your choice in PICKS below as {id: exact Commons file title}.
  3. `python scripts/import-photos.py download`
       Downloads the picked files (1600 px wide) to public/images/ and writes
       lib/data/generated/photos.json with each photo's credit.

Responses are cached in ./cache. Run from a scratch directory outside the repository.
"""
import hashlib, json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
UA = {"User-Agent": "BHARATA-atlas/0.1 (https://bhaarata.vercel.app; data import)"}
os.makedirs("cache", exist_ok=True)

# kingdom id -> search queries naming its best-known surviving monument or site.
QUERIES = {
    "anuradhapura": ["Ruwanwelisaya", "Jetavanaramaya"],
    "chalukya-badami": ["Badami cave temples", "Pattadakal Virupaksha temple"],
    "maitraka": ["Gop Temple Jamnagar", "Valabhi Gujarat"],
    "kamarupa": ["Kamakhya Temple"],
    "turk-shahis": ["Bala Hissar Kabul"],
    "karkota": ["Martand Sun Temple"],
    "harsha": ["Nalanda ruins", "Harsh ka Tila Thanesar"],
    "habbarid": ["Banbhore ruins", "Mansura Sindh ruins"],
    "chandra": ["Mainamati ruins Buddhist"],
    "chaulukya": ["Rani ki vav", "Modhera Sun Temple"],
    "ghaznavid": ["Minaret of Ghazni", "Tomb of Mahmud of Ghazni"],
    "paramara": ["Bhojeshwar Temple", "Udayeshwara Temple Udaipur"],
    "chauhan": ["Ranthambore Fort", "Taragarh Fort Ajmer"],
    "lohara": ["Pandrethan temple Kashmir", "Lohara Fort Poonch"],
    "eastern-ganga": ["Konark Sun Temple", "Jagannath Temple Puri"],
    "sena": ["Dhakeshwari Temple", "Vikrampur Bangladesh ruins"],
    "gahadavala": ["Dhamek Stupa Sarnath", "Kannauj Jama Masjid"],
    "yadava": ["Daulatabad Fort", "Chand Minar Daulatabad"],
    "dambadeniya": ["Dambadeniya Sri Lanka"],
    "kampili": ["Anegundi", "Anegundi Fort Karnataka"],
    "jaffna": ["Jaffna Fort", "Jaffna Nallur Kandaswamy"],
    "kashmir-sultanate": ["Jamia Masjid Srinagar", "Madin Sahib Shrine Srinagar"],
    "bengal-sultanate": ["Adina Mosque", "Sixty Dome Mosque Bagerhat"],
    "samma": ["Makli Necropolis", "Tomb of Jam Nizamuddin"],
    "ahmadnagar": ["Ahmednagar Fort", "Farah Bagh Ahmednagar"],
    "berar": ["Narnala Fort", "Gawilgarh Fort"],
    "bidar-sultanate": ["Bidar Fort", "Rangin Mahal Bidar"],
    "madurai-nayaks": ["Thirumalai Nayakkar Mahal"],
    "thanjavur-nayaks": ["Thanjavur Palace Durbar Hall", "Thanjavur Nayak palace"],
    "thanjavur-marathas": ["Saraswathi Mahal Library Thanjavur", "Thanjavur Maratha Palace"],
    "sur": ["Tomb of Sher Shah Suri Sasaram", "Purana Qila"],
    "mysore": ["Ranganathaswamy Temple Srirangapatna", "Srirangapatna fort"],
    "gorkha": ["Gorkha Durbar", "Gorkha Palace Nepal"],
    "kakatiya": ["Ramappa Temple Palampet", "Warangal Fort Kakatiya Kala Thoranam"],
    "ghurid": ["Minaret of Jam", "Qutb Minar Delhi"],
}

# kingdom id -> the exact Commons file chosen by eye from the candidate sheets.
# Left out on purpose, because no candidate showed the kingdom's own site: maitraka, lohara, sena, dambadeniya, gahadavala (a kakatiya and ghurid pick was added in a second pass).
PICKS = {
    'anuradhapura': 'File:Ruwanweli Saya 1.jpg',
    'chalukya-badami': 'File:A-temple-at-pattadakal-badami.jpg',
    'kamarupa': 'File:Kamakhya Temple, Nilanchal pahad.jpg',
    'turk-shahis': 'File:Bala Hisar.jpg',
    'karkota': 'File:Martand Sun Temple Central shrine (6133772365).jpg',
    'harsha': 'File:Temple 12 - Nalanda Mahavihara (21).jpg',
    'habbarid': 'File:Bhanbhore; A Citadel in Ruins (12097777236).jpg',
    'chandra': 'File:The beautiful Shalban vihar.jpg',
    'chaulukya': 'File:Sun Temple, Modhera - Sabha Mandap 01.jpg',
    'ghaznavid': 'File:US agencies seek to preserve Ghazni Minarets DVIDS432801 (cropped and retouched).jpg',
    'paramara': 'File:Shiva Temple, Bhojpur 01.jpg',
    'chauhan': 'File:Fort of Ranthambore as visible from Ranthambore National Park.jpg',
    'eastern-ganga': 'File:Konark Sun Temple Puri district, Odisha, India 3.jpg',
    'yadava': 'File:Daulatabad Fort & Chand Minar Aurangabad Maharashtra.jpg',
    'kampili': 'File:Main Entrance of Anegundi Fort (02).jpg',
    'jaffna': 'File:Nallur Kandasamy front entrance.jpg',
    'kashmir-sultanate': 'File:Jamia Masjid Srinagar 01 (edited).jpg',
    'bengal-sultanate': 'File:Adina Mosque at Malda district of West Bengal 08.jpg',
    'samma': 'File:Tomb of Jam Nizamuddin Makli.jpg',
    'ahmadnagar': 'File:Faria Bagh Palace of second Nizam.JPG',
    'berar': 'File:Narnala - The main gate arches.jpg',
    'bidar-sultanate': 'File:Gumbaz Darwaza in the Bidar fort.jpg',
    'madurai-nayaks': 'File:Mathura thirumala naikar palace.JPG',
    'thanjavur-nayaks': 'File:S-TN-49 Thanjavur Palace.jpg',
    'thanjavur-marathas': 'File:2013-Sarasvati-Mahal-Library-101.JPG',
    'sur': 'File:Sher Shah Suri Tomb.jpg',
    'mysore': 'File:Outer Wall SW Ranganatha Swamy Temple Srirangapatna Jan24 A7C 08954.jpg',
    'gorkha': 'File:Gorkha Palace durbar.jpg',
    'kakatiya': 'File:Kakatiya kala thoranam in Warangal fort.jpg',
    'ghurid': 'File:Jam minaret ghor province Afghanistan.jpg',
}

BAD_TITLE = re.compile(r"\b(map|plan|flag|logo|coat of arms|diagram|poster|stamp|banner|cartoon|illustration|drawing|sketch)\b", re.I)

def fetch(url, key, binary=False):
    path = f"cache/{key}"
    if os.path.exists(path):
        return open(path, "rb").read() if binary else json.load(open(path))
    for attempt in range(5):
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90).read()
            break
        except Exception:
            if attempt == 4: raise
            time.sleep(3 + attempt * 3)
    if binary:
        open(path, "wb").write(data); return data
    obj = json.loads(data); json.dump(obj, open(path, "w")); return obj

def commons(params, key):
    return fetch("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({**params, "format": "json"}), key)

def free(m):
    lic = m.get("LicenseShortName", {}).get("value", "")
    return bool(re.match(r"(CC BY|CC0|Public domain|PD|CC-BY|Attribution)", lic, re.I)) and not re.search(r"\bNC\b|ND", lic), lic

def info(title, width):
    r = commons({"action": "query", "titles": title, "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": width},
                f"info-{hashlib.md5((title + str(width)).encode()).hexdigest()}.json")
    page = next(iter(r["query"]["pages"].values()))
    return page["imageinfo"][0] if "imageinfo" in page else None

def search(query, limit=10):
    r = commons({"action": "query", "generator": "search", "gsrsearch": f"filetype:bitmap {query}", "gsrnamespace": 6, "gsrlimit": limit,
                 "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 640},
                f"search-{hashlib.md5(query.encode()).hexdigest()}.json")
    pages = sorted(r.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
    out = []
    for p in pages:
        ii = p.get("imageinfo", [None])[0]
        if not ii or BAD_TITLE.search(p["title"]): continue
        ok, lic = free(ii["extmetadata"])
        if not ok or ii["width"] < 1400 or not (0.45 <= ii["height"] / ii["width"] <= 0.9): continue
        out.append({"title": p["title"], "thumb": ii["thumburl"], "w": ii["width"], "h": ii["height"], "lic": lic,
                    "artist": re.sub(r"<[^>]+>", "", ii["extmetadata"].get("Artist", {}).get("value", "")).strip()[:50]})
    return out

def candidates():
    from PIL import Image, ImageDraw
    found = {}
    for kid, queries in QUERIES.items():
        seen, cands = set(), []
        for q in queries:
            for c in search(q)[:4]:
                if c["title"] not in seen: seen.add(c["title"]); cands.append(c)
        found[kid] = cands[:6]
    json.dump(found, open("cache/candidates.json", "w"), indent=1)
    ids = list(found)
    per_sheet = 4
    for s in range(0, len(ids), per_sheet):
        group = ids[s:s + per_sheet]
        sheet = Image.new("RGB", (6 * 300, len(group) * 232), "white")
        d = ImageDraw.Draw(sheet)
        for r, kid in enumerate(group):
            d.text((4, r * 232 + 2), kid.upper(), fill="black")
            for c, cand in enumerate(found[kid]):
                data = fetch(cand["thumb"], "th-" + hashlib.md5(cand["thumb"].encode()).hexdigest() + ".jpg", binary=True)
                try:
                    from io import BytesIO
                    im = Image.open(BytesIO(data)).convert("RGB"); im.thumbnail((296, 190))
                except Exception:
                    continue
                sheet.paste(im, (c * 300 + 2, r * 232 + 16))
                d.text((c * 300 + 4, r * 232 + 208), f"[{c}] {cand['title'][5:42]}", fill="black")
        sheet.save(f"cache/sheet-{s // per_sheet}.jpg", quality=85)
    print(f"wrote {-(-len(ids) // per_sheet)} sheets to cache/; candidate titles in cache/candidates.json")

def download():
    credits = {}
    for kid, title in PICKS.items():
        ii = info(title, 1600)
        if not ii:
            print("missing", title); continue
        ok, lic = free(ii["extmetadata"])
        if not ok:
            print("not free", title, lic); continue
        data = fetch(ii["thumburl"], "img-" + hashlib.md5(ii["thumburl"].encode()).hexdigest() + ".jpg", binary=True)
        key = f"kp-{kid}"
        open(os.path.join(ROOT, "public/images", f"{key}.jpg"), "wb").write(data)
        artist = re.sub(r"<[^>]+>", "", ii["extmetadata"].get("Artist", {}).get("value", "")).strip() or "Unknown"
        fname = title[5:].rsplit(".", 1)[0]
        credits[key] = {"file": f"/images/{key}.jpg", "alt": f"{fname}"[:160], "title": fname[:90], "artist": artist[:80],
                        "license": lic, "sourceUrl": ii["descriptionurl"]}
    json.dump(credits, open(os.path.join(ROOT, "lib/data/generated/photos.json"), "w"), indent=1, ensure_ascii=False)
    print(len(credits), "photos downloaded")

if __name__ == "__main__":
    {"candidates": candidates, "download": download}[sys.argv[1] if len(sys.argv) > 1 else "candidates"]()
