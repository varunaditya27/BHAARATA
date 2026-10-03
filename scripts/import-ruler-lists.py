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

# polityId -> list page, the heading that starts the section, the role to show, and whether years are only starts.
LISTS = [
    {"polity": "utpala", "page": "List of monarchs of Kashmir", "heading": r"Utpala dynasty", "role": "King of Kashmir", "ascension": False},
    {"polity": "lohara", "page": "List of monarchs of Kashmir", "heading": r"Lohara dynasty", "role": "King of Kashmir", "ascension": True},
    {"polity": "kashmir-sultanate", "page": "List of monarchs of Kashmir", "heading": r"Shah Mir dynasty", "role": "Sultan of Kashmir", "ascension": False, "name_col": 0},  # regnal names, as they are known
    {"polity": "kashmir-sultanate", "page": "List of monarchs of Kashmir", "heading": r"Chak dynasty", "role": "Sultan of Kashmir", "ascension": False, "name_col": -1},  # personal names, as they are known
    {"polity": "paramara", "page": "List of kings of Malwa", "heading": r"Paramara", "role": "Paramara king of Malwa", "ascension": False},
]

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
    m = re.search(r"^(=+)[^=\n]*" + heading + r"[^=\n]*\1\s*$", s, re.M)
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
        if line.startswith("|") and not line.startswith(("|-", "|}", "|+")):
            body = line[1:]
            # a leading attribute block such as  style="..."| value
            parts += re.split(r"\|\|", body)
        elif parts and line and not line.startswith(("!", "{|")):
            parts[-1] += " " + line
    return parts

def parse(entry):
    s = section(page(entry["page"]), entry["heading"])
    out = []
    for row in re.split(r"\n\|-", s):
        cs = [clean(re.sub(r'^[^|]*\|(?!\|)', "", c) if "=" in c.split("|")[0] and "|" in c else c) for c in cells(row)]
        cs = [c for c in cs if c]
        if len(cs) < 2: continue
        yearcell = next((c for c in cs if re.search(r"\b[5-9]\d\d\b|\b1[0-7]\d\d\b", c) and not re.fullmatch(r"\d{1,3}", c)), None)
        if not yearcell: continue
        years = [int(y) for y in re.findall(r"\b([5-9]\d\d|1[0-7]\d\d)\b", re.sub(r"\b\d{1,2}\s+\w+\s+(?=\d{3,4})", "", yearcell))]
        if not years or "BCE" in yearcell or "legendary" in yearcell.lower(): continue
        names = [c for c in cs if c != yearcell and re.search(r"[^\W\d_]{2,}", c) and not re.fullmatch(r"[\d\s.]+", c)]
        if not names: continue
        name = names[entry.get("name_col", 0)]
        name = re.sub(r"\s*\(.*?\)|\s*\".*?\"", "", name).strip(" ,")
        if "interregnum" in name.lower() or len(name) < 3: continue
        out.append({"name": name, "start": years[0], "end": years[-1] if len(years) > 1 else None})
    if entry["ascension"]:
        for a, b in zip(out, out[1:]): a["end"] = b["start"]
    return out

def main():
    polities = {p["id"]: p for p in json.load(open(f"{G}/imported-polities.json"))}
    records, seen = [], set()
    for e in LISTS:
        p = polities[e["polity"]]
        for r in parse(e):
            end = r["end"] if r["end"] is not None else r["start"]
            if not (p["from"] - 60 <= r["start"] and end <= p["to"] + 60) or end < r["start"]: continue
            nm = r["name"]
            if (nm, e["polity"]) in seen: nm += " (restored)"          # the source lists a restored ruler again
            seen.add((r["name"], e["polity"]))
            rid = re.sub(r"[^a-z0-9]+", "-", nm.lower().replace("ā", "a").replace("ī", "i").replace("ū", "u")).strip("-") + f"-{r['start']}-" + e["polity"]
            r["name"] = nm
            records.append({"id": rid, "name": r["name"], "role": e["role"], "polityId": e["polity"], "start": r["start"], "end": end,
                            "datesAre": "reign", "endFromNext": e["ascension"] and r["end"] is not None, "list": e["page"]})
    json.dump(records, open(f"{G}/imported-ruler-lists.json", "w"), indent=1, ensure_ascii=False)
    for pid in sorted({r["polityId"] for r in records}):
        rs = [r for r in records if r["polityId"] == pid]
        print(pid, len(rs), [(r["name"], r["start"], r["end"]) for r in rs])

if __name__ == "__main__":
    main()
