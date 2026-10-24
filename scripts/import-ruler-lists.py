"""Rulers of kingdoms that Wikidata has no usable monarch records for, read from the dated tables in
Wikipedia's own "List of ..." articles (CC BY-SA 4.0).

Only the list pages and sections named in LISTS below are read; their layout was checked by hand. Each
record carries the name of the list it came from, so a page can say exactly where the reign came from.
Reigns given only as a start year ("ascension year") end where the next ruler begins, and that is marked.
Rows with no usable years, legendary entries and years before 500 CE are skipped, never guessed.

Needs  : lib/data/generated/imported-polities.json
Output : lib/data/generated/imported-ruler-lists.json
Run    : python scripts/import-ruler-lists.py       (pages cached in ./cache, one request every 2.5 s)
"""
import json, os, re, time, urllib.parse, urllib.request

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
G = os.path.join(ROOT, "lib/data/generated")
UA = {"User-Agent": "BHARATA-atlas/0.1 (https://bhaarata.vercel.app; data import)"}
os.makedirs("cache", exist_ok=True)

# One entry per list to read. kind: "table" (wikitable rows), "bullets" (a * or # list), "succession" (the
# {{Succession table monarch}} template). `heading` is a regex for the section holding the list; the section
# runs to the next heading of the same or higher level. `name_col` picks which name cell of a table to use.
# The layout of each section was checked by hand.
LISTS = [
    {"polity": "utpala", "page": "List of monarchs of Kashmir", "heading": r"Utpala dynasty", "role": "King of Kashmir", "ascension": False},
    {"polity": "lohara", "page": "List of monarchs of Kashmir", "heading": r"Lohara dynasty", "role": "King of Kashmir", "ascension": True},
    {"polity": "kashmir-sultanate", "page": "List of monarchs of Kashmir", "heading": r"Shah Mir dynasty", "role": "Sultan of Kashmir", "ascension": False, "name_col": 0},  # regnal names, as they are known
    {"polity": "kashmir-sultanate", "page": "List of monarchs of Kashmir", "heading": r"Chak dynasty", "role": "Sultan of Kashmir", "ascension": False, "name_col": -1},  # personal names, as they are known
    {"polity": "paramara", "page": "List of kings of Malwa", "heading": r"Paramara", "role": "Paramara king of Malwa", "ascension": False},
    {"polity": "bidar-sultanate", "page": "Bidar Sultanate", "heading": r"Rulers", "role": "Barid Shahi ruler of Bidar"},
    {"polity": "chandela", "page": "Chandelas of Jejakabhukti", "heading": r"List of rulers", "role": "Chandela king"},
    {"polity": "chandra", "page": "Chandra dynasty", "heading": r"List of Chandra rulers", "role": "Chandra king"},
    {"polity": "chauhan", "page": "Chauhan Dynasty", "heading": r"Shakambhari Branch", "role": "Chahamana king of Shakambhari"},
    {"polity": "jaunpur", "page": "Jaunpur Sultanate", "heading": r"List of Sharqi rulers", "role": "Sharqi Sultan of Jaunpur"},
    {"polity": "karkota", "page": "Karkota dynasty", "heading": r"List of rulers", "role": "King of Kashmir"},
    {"polity": "chaulukya", "page": "Chaulukya dynasty", "heading": r"List of rulers", "role": "Chaulukya king of Gujarat"},
    {"polity": "samma", "page": "Samma dynasty", "heading": r"List of rulers", "role": "Jam of Sindh", "name_col": -1},
    {"polity": "thanjavur-marathas", "page": "Thanjavur Maratha kingdom", "heading": r"List of rulers", "role": "Maratha ruler of Thanjavur"},
    {"polity": "bengal-sultanate", "page": "Bengal Sultanate", "heading": r"List of dynasties", "role": "Sultan of Bengal"},
    {"polity": "berar", "page": "Berar Sultanate", "heading": r"List of rulers", "role": "Imad Shahi Sultan of Berar", "kind": "bullets"},
    {"polity": "yadava", "page": "Seuna (Yadava) dynasty", "heading": r"Rulers", "role": "Yadava king of Devagiri", "kind": "bullets"},
    {"polity": "eastern-ganga", "page": "Eastern Ganga dynasty", "heading": r"Trikalinga Rulers", "role": "Eastern Ganga king", "kind": "bullets"},
    {"polity": "kakatiya", "page": "Kakatiya dynasty", "heading": r"Sovereign rulers", "role": "Kakatiya ruler", "kind": "bullets"},
    {"polity": "ahmadnagar", "page": "Ahmadnagar Sultanate", "heading": r"List of rulers", "role": "Nizam Shahi Sultan of Ahmadnagar", "kind": "bullets"},
    {"polity": "pallava", "page": "Pallava dynasty", "heading": r"Later Pallavas", "role": "Pallava king", "kind": "bullets"},
    {"polity": "gahadavala", "page": "Gahadavala dynasty", "heading": r"List of rulers", "role": "Gahadavala king", "kind": "bullets"},
    {"polity": "habbarid", "page": "Habbari Emirate", "heading": r"List of Habbari Emirs", "role": "Habbarid emir of Mansura", "kind": "bullets"},
    {"polity": "kamarupa", "page": "Mlechchha dynasty", "heading": r"Rulers", "role": "Mlechchha king of Kamarupa", "kind": "bullets"},
    {"polity": "kamarupa", "page": "Pala dynasty (Kamarupa)", "heading": r"Rulers", "role": "Pala king of Kamarupa", "kind": "bullets"},
    {"polity": "jaffna", "page": "List of Jaffna monarchs", "heading": r"Aryacakravarti dynasty", "role": "Aryacakravarti king of Jaffna", "last_years": True},
    {"polity": "kamarupa", "page": "Varman dynasty", "heading": r"The dynasty", "role": "Varman king of Kamarupa"},
    {"polity": "anuradhapura", "page": "List of Sri Lankan monarchs", "heading": r"House of Moriya", "role": "King of Anuradhapura", "last_years": True},
    {"polity": "anuradhapura", "page": "List of Sri Lankan monarchs", "heading": r"House of Lambakanna II", "role": "King of Anuradhapura", "last_years": True},
    {"polity": "delhi-sultanate", "page": "List of sultans of Delhi", "heading": r"Mamluk dynasty", "role": "Sultan of Delhi", "kind": "delhi"},
    {"polity": "delhi-sultanate", "page": "List of sultans of Delhi", "heading": r"Khalji dynasty", "role": "Sultan of Delhi", "kind": "delhi"},
    {"polity": "delhi-sultanate", "page": "List of sultans of Delhi", "heading": r"Tughluq dynasty", "role": "Sultan of Delhi", "kind": "delhi"},
    {"polity": "delhi-sultanate", "page": "List of sultans of Delhi", "heading": r"Sayyid dynasty", "role": "Sultan of Delhi", "kind": "delhi"},
    {"polity": "delhi-sultanate", "page": "List of sultans of Delhi", "heading": r"Lodi dynasty", "role": "Sultan of Delhi", "kind": "delhi"},
    {"polity": "vijayanagara", "page": "List of Vijayanagara emperors", "heading": r"Sangama dynasty \(1336", "role": "Emperor of Vijayanagara", "span_to": 1650},
    {"polity": "vijayanagara", "page": "List of Vijayanagara emperors", "heading": r"Saluva dynasty \(1485", "role": "Emperor of Vijayanagara", "span_to": 1650},
    {"polity": "vijayanagara", "page": "List of Vijayanagara emperors", "heading": r"Tuluva dynasty \(1491", "role": "Emperor of Vijayanagara", "span_to": 1650},
    {"polity": "vijayanagara", "page": "List of Vijayanagara emperors", "heading": r"Aravidu dynasty \(1542", "role": "Emperor of Vijayanagara", "span_to": 1650},
    {"polity": "bahmani", "page": "List of Bahmani Sultans", "heading": r"List of Bahmani Shahs", "role": "Bahmani Sultan", "name_col": -1},
    {"polity": "bijapur", "page": "Adil Shahi dynasty", "heading": r"Rulers", "role": "Adil Shahi Sultan of Bijapur", "name_col": 1},
    {"polity": "golconda", "page": "Qutb Shahi dynasty", "heading": r"List of rulers", "role": "Qutb Shahi Sultan of Golconda", "last_years": True},
    {"polity": "gorkha", "page": "Gorkha Kingdom", "heading": r"List of kings of Gorkha", "role": "King of Gorkha", "kind": "succession"},
]


# Lists read by hand from a Wikipedia article where its layout can't be parsed reliably (prose, infobox, merged
# cells). Every row is exactly what the named article states; "?" means the article gives no end year. Each was
# cross-checked against the article before entry. polity -> (article, role, [(name, start, end), ...])
MANUAL = {
    "chera": ("Chera Perumals of Makotai", "Chera Perumal", [("Sthanu Ravi Kulasekhara", 844, 870), ("Rama Rajasekhara", 870, 883), ("Vijayaraga", 883, 895), ("Goda Goda", 895, 905), ("Goda Ravi", 905, 943), ("Indu Goda", 943, 962), ("Bhaskara Ravi Manukuladitya", 962, 1021), ("Ravi Goda", 1021, 1089), ("Rama Kulasekhara", 1089, 1122)]),
    "ghaznavid": ("Mahmud of Ghazni", "Ghaznavid ruler", [("Mahmud of Ghazni", 998, 1030, "Sultan of the Ghaznavid Empire"), ("Muhammad of Ghazni", 1030, 1030, "Sultan of the Ghaznavid Empire"), ("Muhammad of Ghazni (second reign)", 1040, 1041, "Sultan of the Ghaznavid Empire"), ("Alp Tigin", 962, 963, "Governor of Ghazna")]),
    "sena": ("Sena dynasty", "Sena king of Bengal", [("Samanta Sena", 1070, 1095), ("Hemanta Sena", 1095, 1096), ("Vijaya Sena", 1096, 1159), ("Ballala Sena", 1159, 1179), ("Lakshmana Sena", 1179, 1206), ("Vishvarupa Sena", 1206, 1225), ("Keshava Sena", 1225, 1230)]),
    "maitraka": ("Kingdom of Valabhi", "Maitraka king of Valabhi", [("Bhatarka", 470, 492), ("Dharasena I", 493, 499), ("Dronasinha", 500, 520), ("Dhruvasena I", 520, 550), ("Dharapatta", 550, 556), ("Guhasena", 556, 570), ("Dharasena II", 570, 595), ("Shiladitya I", 595, 615), ("Kharagraha I", 615, 626), ("Dharasena III", 626, 640), ("Dhruvasena II (Baladitya)", 640, 644), ("Dharasena IV", 644, 651), ("Dhruvasena III", 650, 655), ("Kharagraha II", 655, 658), ("Shiladitya II", 658, 685), ("Shiladitya III", 690, 710), ("Shiladitya IV", 710, 740), ("Shiladitya V", 740, 762), ("Shiladitya VI Dhrubhata", 762, 776)]),
    "turk-shahis": ("Turk Shahis", "Turk Shahi ruler of Kabul", [("Barha Tegin", 665, 680), ("Tegin Shah", 680, 739), ("Fromo Kesaro", 739, 745), ("Bo Fuzhun", 745, None), ("Khingala", 780, 785), ("Lagaturman", 815, 822)]),
    "madurai-nayaks": ("Madurai Nayak dynasty", "Nayak ruler of Madurai", [("Viswanatha Nayak", 1529, 1563), ("Kumara Krishnappa Nayak", 1563, 1573), ("Muttu Krishnappa Nayak", 1602, 1609), ("Muttu Virappa Nayak", 1609, 1623), ("Tirumala Nayak", 1623, 1659), ("Muthu Alakadri Nayak", 1659, 1662), ("Chokkanatha Nayak", 1662, 1682), ("Rangakrishna Muthu Virappa Nayak", 1682, 1689), ("Rani Mangammal", 1689, 1704), ("Vijaya Ranga Chokkanatha Nayak", 1704, 1731), ("Queen Meenakshi", 1731, 1736)]),
    "thanjavur-nayaks": ("Thanjavur Nayak kingdom", "Nayak ruler of Thanjavur", [("Sevappa Nayaka", 1532, 1580), ("Achuthappa Nayaka", 1560, 1614), ("Raghunatha Nayaka", 1600, 1634), ("Vijaya Raghava Nayaka", 1634, 1673)]),
    "kampili": ("Kampili kingdom", "Ruler of Kampili", [("Singeya Nayaka III", 1280, 1300), ("Kampilideva", 1300, 1327)]),
    "dambadeniya": ("Kingdom of Dambadeniya", "King of Dambadeniya", [("Vijayabahu III", 1220, 1224), ("Parakramabahu II", 1234, 1269), ("Vijayabahu IV", 1269, 1271), ("Bhuvanaikabahu I", 1271, 1283), ("Parakramabahu III", 1302, 1310), ("Bhuvanaikabahu II", 1310, 1326)]),
    "ghurid": ("Ghurid dynasty", "Ghurid ruler", [("Izz al-Din Husayn", 1100, 1146), ("Sayf al-Din Suri", 1146, 1149), ("Baha al-Din Sam I", 1149, 1149), ("Ala al-Din Husayn", 1149, 1161), ("Sayf al-Din Muhammad", 1161, 1163), ("Ghiyath al-Din Muhammad", 1163, 1203), ("Muhammad of Ghor", 1203, 1206), ("Ghiyath al-Din Mahmud", 1206, 1212), ("Baha al-Din Sam III", 1212, 1213), ("Ala al-Din Atsiz", 1213, 1214), ("Ala al-Din Ali", 1214, 1215),
                ("Fakhr al-Din Masud", 1152, 1163, "Ghurid ruler of Bamiyan"), ("Shams al-Din Muhammad ibn Masud", 1163, 1192, "Ghurid ruler of Bamiyan"), ("Baha al-Din Sam II", 1192, 1206, "Ghurid ruler of Bamiyan"), ("Jalal al-Din Ali", 1206, 1215, "Ghurid ruler of Bamiyan")]),
    "sur": ("Sur Empire", "Sur Sultan", [("Sher Shah Suri", 1540, 1545), ("Islam Shah Suri", 1545, 1554), ("Firuz Shah Suri", 1554, 1554), ("Muhammad Adil Shah", 1554, 1555), ("Ibrahim Shah Suri", 1555, 1555), ("Sikandar Shah Suri", 1555, 1555), ("Adil Shah Suri", 1555, 1556)]),
    "maratha": ("Maratha Empire", "Chhatrapati of the Marathas", [("Shivaji", 1674, 1680), ("Sambhaji", 1681, 1689), ("Rajaram I", 1689, 1700)]),
    "harsha": ("Harshavardhana", "Emperor of Kannauj", [("Harsha", 606, 647)]),
}

# Listed in a table, but the article itself says there is no direct evidence for them: not shown.
SKIP = {("kamarupa", "Avantivarman")}
# Rows that contradict another row in the same list (Wikipedia's Tuluva table gives Thimma Bhupala 1491–1505; its Saluva table gives 1491).
SKIP_ROWS = {("vijayanagara", "Thimma Bhupala", 1491, 1505)}

# Where a table cell holds titles run together with the name, the name the ruler is known by.
NAME_FIX = {"Khwajah-i-Jahan Malik-us-Sharq Atabeg-i-Azam": "Malik Sarwar"}

def page(title):
    path = "cache/wt-" + re.sub(r"\W", "_", title)
    if os.path.exists(path): return open(path).read()
    time.sleep(2.5)
    u = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode({"action": "parse", "page": title, "prop": "wikitext", "redirects": 1, "format": "json"})
    for attempt in range(5):
        try:
            s = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))["parse"]["wikitext"]["*"]; break
        except Exception:
            if attempt == 4: raise
            time.sleep(8 + attempt * 8)
    open(path, "w").write(s); return s

def section(s, heading):
    m = re.search(r"^(=+)(?!=)[^\n]*?" + heading + r"[^\n]*?(?<!=)\1\s*$", s, re.M)
    if not m: return ""
    level = len(m.group(1))
    nxt = re.search(r"^={1,%d}[^=\n].*?={1,%d}\s*$" % (level, level), s[m.end():], re.M)
    return s[m.end(): m.end() + nxt.start()] if nxt else s[m.end():]

def clean(c):
    c = re.sub(r"<ref[^>]*?/>|<ref.*?</ref>|\{\{[^}]*\}\}", "", c, flags=re.S)
    c = re.sub(r"\[\[(?:[^\]|]*\|)?([^\]]*)\]\]", r"\1", c)
    c = re.sub(r"'''?|<br\s*/?>|&nbsp;|<[^>]+>|style=\"[^\"]*\"|align=\"[^\"]*\"|\|", " ", c)
    return re.sub(r"\s+", " ", c).strip()

def cells(row):
    parts = []
    for line in row.split("\n"):
        line = line.strip()
        if line.startswith("|}"): break                       # the table ended; what follows belongs to something else
        if line.startswith("|") and not line.startswith(("|-", "|+")):
            body = line[1:]
            # a leading attribute block such as  style="..."| value
            parts += re.split(r"\|\|", body)
        elif parts and line and not line.startswith(("!", "{|")):
            parts[-1] += " " + line
    return parts

RANGE = re.compile(r"\b([3-9]\d\d|1[0-7]\d\d)\s*(?:CE|AD)?\s*(?:–|—|-|&ndash;|to)\s*([3-9]\d\d|1[0-7]\d\d)\b")

def parse_bullets(entry):
    out = []
    for line in section(page(entry["page"]), entry["heading"]).split("\n"):
        if not re.match(r"\s*[*#]", line): continue
        text = clean(re.sub(r"^\s*[*#]+", "", line))
        m = RANGE.search(text)
        if not m: continue
        name = re.split(r"\s*[\(,:]|\s+r\.|\s+reign|\s+\d", text)[0].strip(" -–—.'")
        name = re.sub(r"^(Raja|Sultan|King)\s+", "", name) if name.count(" ") > 1 else name
        if len(name) < 3: continue
        a, b = int(m.group(1)), int(m.group(2))
        fix = DATE_FIX.get((entry["polity"], name))
        if fix: a, b = fix[0], fix[1]
        out.append({"name": name, "start": a, "end": b})
    return out

def parse_succession(entry):
    s = section(page(entry["page"]), entry["heading"]); out = []
    for n in sorted({int(x) for x in re.findall(r"\|\s*name(\d+)\s*=", s)}):
        def f(key):
            m = re.search(r"\|\s*%s%d\s*=\s*(.*)" % (key, n), s)
            return clean(m.group(1)) if m else ""
        a, b = re.search(r"\d{3,4}", f("reignstart")), re.search(r"\d{3,4}", f("reignend"))
        if f("name") and a and b: out.append({"name": f("name"), "start": int(a.group()), "end": int(b.group())})
    return out

def parse_table(entry):
    s = section(page(entry["page"]), entry["heading"])
    out = []
    for row in re.split(r"\n\|-", s):
        cs = [clean(re.sub(r'^[^|]*\|(?!\|)', "", c) if "=" in c.split("|")[0] and "|" in c else c) for c in cells(row)]
        cs = [c for c in cs if c]
        if len(cs) < 2: continue
        # the reign cell: the first with a year range, else the first with any year
        if entry.get("last_years"):
            # separate "from" and "until" columns: the last two numbers in the row that look like years (cells that are only a number)
            nums = [int(re.search(r"(\d{3,4})$", c).group(1)) for c in cs if re.fullmatch(r"(\d{1,2}\s+\w+\s+)?\d{3,4}", c)]
            if len(nums) < 2: continue
            names = [c for c in cs if re.search(r"[^\W\d_]{2,}", c) and not c.startswith("*") and not re.fullmatch(r"\d+px|rowspan.*|colspan.*|N/A|-", c)]
            if not names: continue
            name = re.sub(r"\s*\(.*?\)|\s*\".*?\"", "", names[0])
            name = re.sub(r"[\u0590-\u06FF\u0750-\u077F]+", "", name).strip(" ,'")
            out.append({"name": name, "start": nums[-2], "end": nums[-1]})
            continue
        yearcell = next((c for c in cs if RANGE.search(c)), None) or next((c for c in cs if re.search(r"\b[5-9]\d\d\b|\b1[0-7]\d\d\b", c) and not re.fullmatch(r"\d{1,3}", c)), None)
        if not yearcell: continue
        yearcell = re.sub(r"\b(\d{3,4})/\d{3,4}\b", r"\1", yearcell)     # "1215/1218": the source is unsure; take the earlier
        rng = RANGE.search(re.sub(r"\b\d{1,2}\s+\w+\s+(?=\d{3,4})", "", yearcell))
        years = [int(rng.group(1)), int(rng.group(2))] if rng else [int(y) for y in re.findall(r"\b([5-9]\d\d|1[0-7]\d\d)\b", re.sub(r"\b\d{1,2}\s+\w+\s+(?=\d{3,4})", "", yearcell))][:2]
        if not years or "BCE" in yearcell or "legendary" in yearcell.lower(): continue
        names = [c for c in cs if c != yearcell and re.search(r"[^\W\d_]{2,}", c) and not re.fullmatch(r"[\d\s.]+", c) and not re.fullmatch(r"\d+px|rowspan.*|colspan.*|N/A", c)]
        if not names: continue
        name = names[entry.get("name_col", 0)]
        if entry.get("name_after"):
            parts = re.split(entry["name_after"], name)
            if len(parts) > 1: name = "Jam " + parts[-1].strip()
        name = re.sub(r"\s*\(.*?\)|\s*\".*?\"|^\d+px\s*", "", name).strip(" ,")
        name = re.sub(r"[\u007d\u007b\u0027\u2019]{2,}|\s*\}\}.*$", "", name).strip(" ,'")
        name = re.sub(r"\s+Puppet King.*$|,\s*Sultan of Delhi$", "", name)
        name = re.sub(r"[\u0590-\u06FF\u0750-\u077F]+", "", name).strip(" ,'")      # drop Arabic-script names printed beside the English one
        name = NAME_FIX.get(name, name)
        if "interregnum" in name.lower() or len(name) < 3: continue
        fix = DATE_FIX.get((entry["polity"], name))
        if fix: years = [fix[0], fix[1]]
        out.append({"name": name, "start": years[0], "end": years[-1] if len(years) > 1 else None})
    if entry.get("ascension"):
        for a, b in zip(out, out[1:]): a["end"] = b["start"]
    return out

# Dates in a Wikipedia list that contradict the ruler's own article, corrected to the article. (polity, name) -> (start, end, reason)
DATE_FIX = {("pallava", "Paramesvaravarman II"): (725, 731, "his own article: succeeded his father Narasimhavarman II in 725 and reigned till 731; the dynasty list gives 705–710")}

def parse_delhi(entry):
    """'List of sultans of Delhi': each row has the name as '''[[Article|Label]]''' and a reign cell with line breaks."""
    s = section(page(entry["page"]), entry["heading"])
    out = []
    for row in re.split(r"\n\|-", s):
        m = re.search(r"'''\[\[([^\]|]+)(?:\|[^\]]+)?\]\]'''", row)
        if not m: continue
        name = re.sub(r"\s*\(.*?\)", "", m.group(1)).strip()
        after = row[m.end():]
        cell = next((c for c in re.split(r"\n\|", after) if re.search(r"\b(1[0-7]\d\d|[5-9]\d\d)\b", c) and "aged" not in c and "<hr" not in c), None)
        if not cell: continue
        cell = re.sub(r"\{\{[^}]*\}\}|\(~.*?\)", "", cell)
        cell = re.sub(r"\b\d{1,2}\s+\w+\s+(?=\d{3,4})", "", cell)
        years = [int(y) for y in re.findall(r"\b([5-9]\d\d|1[0-7]\d\d)\b", cell)]
        if years: out.append({"name": name, "start": years[0], "end": years[-1] if len(years) > 1 else None})
    return out

def parse(entry):
    return {"table": parse_table, "bullets": parse_bullets, "succession": parse_succession, "delhi": parse_delhi}[entry.get("kind", "table")](entry)

def main():
    polities = {p["id"]: p for p in json.load(open(f"{G}/imported-polities.json"))}
    existing = json.load(open(f"{G}/imported-people.json"))
    records, seen = [], set()
    # Words that name a dynasty, a title or a kingdom prove nothing about which person is meant.
    STOP = {"shah", "sultan", "khan", "deva", "devaraya", "raya", "king", "empire", "ibn", "bin", "din", "ud-din", "of", "the", "chola", "nizam", "adil",
            "qutb", "imad", "barid", "lodi", "tughluq", "tughlaq", "khalji", "wodeyar", "pandya", "nayak", "nayaka", "sena", "pala", "bahmani", "suri", "ghazni"}
    def tokens(n):
        return {t for t in re.split(r"[^a-z]+", n.lower().replace("-", "")) if len(t) >= 4 and t not in STOP}
    def match(pid, name, a, b):
        """The best Wikidata record for this ruler: same kingdom, overlapping years, and a shared first name or distinctive word."""
        key = re.sub(r"\W", "", name.lower())[:6]
        best, best_score = None, 0
        for x in existing:
            if x["polityId"] != pid or not (x["start"] <= b + 5 and a <= (x["end"] or x["start"]) + 5): continue
            score = (3 if re.sub(r"\W", "", x["name"].lower())[:6] == key else 0) + len(tokens(x["name"]) & tokens(name))
            if score > best_score: best, best_score = x, score
        return best
    def known(pid, name, a, b):
        """True if Wikidata already has this ruler with a reign. A lifetime-only record is replaced by the list's reign."""
        m = match(pid, name, a, b)
        return bool(m and m["datesAre"] == "reign")
    for e in LISTS:
        p = polities[e["polity"]]
        for r in parse(e):
            end = r["end"] if r["end"] is not None else r["start"]
            if not (p["from"] - 60 <= r["start"] and end <= e.get("span_to", p["to"] + 60)) or end < r["start"]: continue
            if known(e["polity"], r["name"], r["start"], end) or (e["polity"], r["name"]) in SKIP or (e["polity"], r["name"], r["start"], end) in SKIP_ROWS: continue
            nm = r["name"]
            if (nm, e["polity"]) in seen: nm += " (second term)"          # the source lists the same ruler again (a restored reign, or a second office)
            seen.add((r["name"], e["polity"]))
            rid = re.sub(r"[^a-z0-9]+", "-", nm.lower().replace("ā", "a").replace("ī", "i").replace("ū", "u")).strip("-") + f"-{r['start']}-" + e["polity"]
            r["name"] = nm
            old = match(e["polity"], r["name"], r["start"], end)
            records.append({"id": rid, "name": r["name"], "role": e["role"], "polityId": e["polity"], "start": r["start"], "end": end,
                            "datesAre": "reign", "endFromNext": bool(e.get("ascension")) and r["end"] is not None, "list": e["page"],
                            "supersedes": [old["id"]] if old else []})
    for pid, (article, role_default, rows) in MANUAL.items():
        p = polities.get(pid) or {"from": 800, "to": 1124}      # Chera has no Cliopatria entry; its span is the article's
        for row in rows:
            name, start, end = row[:3]
            role = row[3] if len(row) > 3 else role_default
            stop = end if end is not None else start
            if not (p["from"] - 60 <= start and stop <= p["to"] + 60) or known(pid, name, start, stop): continue
            old = match(pid, name, start, stop)
            records.append({"id": re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") + f"-{start}-" + pid, "name": name, "role": role, "polityId": pid,
                            "start": start, "end": end, "datesAre": "reign", "endFromNext": False, "list": article,
                            "supersedes": [old["id"]] if old else []})
    json.dump(records, open(f"{G}/imported-ruler-lists.json", "w"), indent=1, ensure_ascii=False)
    for pid in sorted({r["polityId"] for r in records}):
        rs = [r for r in records if r["polityId"] == pid]
        print(pid, len(rs), [(r["name"], r["start"], r["end"]) for r in rs])

if __name__ == "__main__":
    main()
