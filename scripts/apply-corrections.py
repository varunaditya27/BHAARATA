"""Corrections found by scripts/validate-data.py and checked against Wikipedia by hand.

The importers pull what Wikidata and Wikipedia say; where that is demonstrably wrong for this atlas, the fix
is listed here with its reason, and applied to the generated files. It is idempotent (safe to re-run), and
should be run after the importers, before committing.

Run: python scripts/apply-corrections.py
"""
import json, os, re, urllib.parse, urllib.request

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
G = os.path.join(ROOT, "lib/data/generated")

# Records that do not belong in the list of a kingdom's rulers.
REMOVE_PEOPLE = {
    "khas-mahal": "Wikidata lists her as 'Queen regnant'; she was a consort of Jahangir, not a ruler of the Mughal Empire.",
    "jaswant-singh-of-marwar": "He was Maharaja of Marwar (Jodhpur), a Mughal ally and officer, not a Mughal ruler.",
    "q16312506": "A Wikidata item with no English label, no dates and no article; nothing can be shown for it.",
    "khadija-sultana": "Wikidata lists her as a ruler of the Mughal Empire; she was a Mughal princess, not an emperor.",
    "gaj-singh-of-marwar": "Maharaja of Marwar (Jodhpur), a Mughal ally, not a Mughal ruler.",
    "jai-singh-ii": "Kachwaha ruler of Amber (Jaipur), a Mughal noble, not a Mughal ruler.",
    "rajadhiraja-chola-ii": "The same king as 'Rajadiraja Chola II', listed twice by Wikidata (once with only his lifetime).",
    "parakrama-pandyan-ii": "A Pandya prince who ruled Polonnaruwa in Sri Lanka, not a ruler of the Pandya kingdom of Madurai.",
    "taj-ud-din-firuz-shah": "Same king as 'Feroze Shah' (1397–1422) in Wikipedia's list of Bahmani sultans, which has his reign; Wikidata gives only his lifetime.",
    "nizam-ud-din-ahmad-iii": "Same king as 'Nizam Shah Bahmani' (1461–1463) in Wikipedia's list, which has his reign.",
    "mahmud-szach": "Same king as 'Mahmood Shah Bahmani II' (1482–1518) in Wikipedia's list. The Wikidata label is in Polish.",
    "n-ssir-ad-din-mahmud-xah-tughluq": "Same sultan as 'Nasir-ud-Din Mahmud Shah Tughluq' (1394–1413) in Wikipedia's list of Delhi sultans. The Wikidata label is in Catalan.",
    "vijay-sena": "Same king as 'Vijaya Sena' (1096–1159) in Wikipedia's article on the Sena dynasty, which has his reign.",
    "bukka": "Same emperor as 'Bukka Raya I' (1356–1377) in Wikipedia's list of Vijayanagara emperors, which has his reign.",
    "mohammad-ghaznavi": "Wikidata gives one reign, 1030–1041. His article gives two short ones, in 1030 and 1040–41; the correct entries come from there.",
    "kalinga-magha": "Wikidata files him under the Eastern Ganga as 'King of Jaffna'; he ruled in Sri Lanka and was not an Eastern Ganga ruler.",
    "q16311542": "A Wikidata item with no English label, no dates and no article; nothing can be shown for it.",
}
# Reign dates where Wikidata is wrong. Checked against the Wikipedia article for each.
FIX_DATES = {
    "chamaraja-wodeyar-iv": (1572, 1576, "Wikipedia: took over in 1572 after his brother's death and ruled until 1576. Wikidata repeats his brother's 1553–1572."),
}
# Wikipedia titles that resolve to the wrong page.
FIX_WIKIPEDIA = {"anuradhapura": ("Anuradhapura_kingdom", "'Anurādhapura' redirects to the article about the city; the kingdom has its own."), "turk-shahis": ("Turk_Shahis", "'Kabul Shahi' is a disambiguation page; the dynasty's article is 'Turk Shahis'.")}
# Kingdoms whose summary fell back to a placeholder line because the first article tried was a
# disambiguation page, or its opening had an unbalanced bracket. The right article's opening is used.
FIX_SUMMARY_FROM = {"anuradhapura": "Anuradhapura kingdom", "turk-shahis": "Turk Shahis"}

# Rulers whose Wikidata item has no Wikipedia link here, but whose article exists under another title.
# person id -> (Wikipedia title, opening sentences as the article gives them)
FIX_PERSON_ARTICLE = {
    "masud-ii": ("Mas'ud_II", "Mas'ud ibn Mawdud ibn Mas'ud, commonly known as Mas'ud II, was Ghaznavid sultan for sometime in 1048. Masud was the son and successor of Mawdud of Ghazni, and ruled for a short period."),
}

# Ruler "portraits" that do not show that ruler. image key -> reason. The file is deleted too.
REMOVE_RULER_IMAGES = {
    "ruler-alp-tigin": "The file is a photograph of the town of Pınarbaşı, not of Alp Tigin.",
    "ruler-toghrul-of-ghazna": "The file is a gold dinar of Mas'ud III, a different ruler.",
    "ruler-sultan-muhammad-qutb-shah": "The file's own title says the subject is 'Muḥammad or Sultan Mahmud': identity not established.",
}

# Capitals Wikidata files under the wrong kingdom, or as a district. kingdom id -> (capitals, reason)
FIX_CAPITALS = {
    "chalukya-badami": (["Badami"], "Wikidata mixes in the capitals of the Rashtrakutas (Manyakheta) and the later Kalyani Chalukyas (Basavakalyan)."),
    "chalukya-kalyani": (["Basavakalyan"], "Manyakheta was the Rashtrakuta capital; the Kalyani Chalukyas ruled from Kalyani, today's Basavakalyan (their Wikipedia article)."),
    "bijapur": (["Vijayapura"], "Wikidata also lists the district, which is not a city."),
    "sur": (["Sasaram"], "The Sur Empire's own article says Sasaram was its capital; Wikidata lists Delhi."),
    "mysore": (["Mysore", "Srirangapatna"], "Bengaluru was never the capital of the Kingdom of Mysore."),
}
# Alternative names Wikidata lists that are a different thing. kingdom id -> names to drop.
REMOVE_ALIASES = {"pallava": ["Kurumba Pallava dynasty"], "chauhan": ["boy"], "maitraka": ["Mer", "Mithira"]}

# Photographs where Commons' structured data names no creator, but the file page does. key -> (artist, where it was found)
FIX_CREDITS = {
    "imp-chandela": ("Hullie", "file page: uploaded by Hullie to Dutch Wikipedia, later moved to Commons"),
    "ruler-mas-ud-i": ("PHGCOM", "file page: self-made photograph taken at the British Museum"),
    "ruler-ibrahim-adil-shah-ii": ("Unknown Deccani painter (about 1620s)", "file page: a 17th-century miniature, public domain; the painter is not recorded"),
}

# Battles whose Wikipedia title redirects to a broader subject, so the summary described something else
# (the whole Dutch–Portuguese war, or Shivaji's biography). They keep Wikidata's date and place only.
STRIP_BATTLE_SUMMARY = [
    "battle-battle-of-kolhapur-1659",
    "battle-action-of-23-march-1654-1654",
    "battle-action-of-2-may-1654-1654",
    "battle-action-of-30-september-1639-1639",
    "battle-battle-of-badghis-654",
]

# Battles that have no Wikipedia article of their own in the importer's data, or whose article it missed, with a short
# description written in our own words from the named source. Where no usable source was found (Sangamner 1679, whose only
# source is unreliable; Friday Battle, Kanchi, Ucha, Mandavgad, Balkh 1602, Badghis, and the three Dutch–Portuguese actions), the battle keeps only Wikidata's date and place.
FIX_BATTLES = {
    "battle-battle-of-somnath-1026": {"wikipedia": "Sack_of_Somnath", "extract": "The sack of Somnath, on 6–8 January 1026, was a campaign led by Mahmud of Ghazni against the Chaulukya dynasty of Gujarat, his fifteenth invasion of India. It ended with the destruction of the Somnath Temple."},
    "battle-battle-of-tarnab-1448": {"wikipedia": "Battle_of_Tarnab_(1448)", "extract": "In spring 1448, east of Herat, the Timurid ruler Ulugh Beg of Samarkand decisively defeated Ala al-Dawla Mirza of Khurasan, during the Second Timurid Succession Crisis."},
    "battle-battle-of-qandabil-720": {"wikipedia": "Al-Mufaddal_ibn_al-Muhallab", "extract": "In 720, the sons of al-Muhallab, who had rebelled against the Umayyads, fled to Qandabil in Sind hoping for refuge. Their ally shut the gates against them, and they were killed fighting their Umayyad pursuer, Hilal ibn Ahwaz al-Tamimi."},
    "battle-battle-of-kolhapur-1659": {"otherSource": {"title": "Military History Wiki: Battle of Kolhapur", "url": "https://military-history.fandom.com/wiki/Battle_of_Kolhapur"}, "extract": "On 28 December 1659, near Kolhapur, a Maratha force under Shivaji defeated a larger Bijapur army led by Rustam Zaman, who fled the field. It was the Marathas' second major victory over Bijapur, after Pratapgad."},
    "battle-battle-of-umberkhind-1661": {"otherSource": {"title": "Military History Wiki: Battle of Umberkhind", "url": "https://military-history.fandom.com/wiki/Battle_of_Umberkhind"}, "extract": "On 3 February 1661, in the Umberkhind pass of the Sahyadri hills near Khopoli, Shivaji's Maratha forces ambushed a Mughal army led by Kartalab Khan. After about two hours the Mughals surrendered their arms and paid a ransom to be allowed to leave."},
    "battle-battle-of-salher-1672": {"otherSource": {"title": "Military History Wiki: Battle of Salher", "url": "https://military-history.fandom.com/wiki/Battle_of_Salher"}, "extract": "In February 1672, near the fort of Salher in Nashik district, Maratha forces under Prataprao Gujar and Moropant Pingle defeated a larger Mughal force. It is described as the first battle in which the Mughals lost in the open field."},
}

def rw(name, fn):
    p = os.path.join(G, name); d = json.load(open(p)); d = fn(d)
    json.dump(d, open(p, "w"), indent=1, ensure_ascii=False); open(p, "a").write("\n")

def people(d):
    d = [r for r in d if r["id"] not in REMOVE_PEOPLE]
    for r in d:
        if r.get("imageKey") in REMOVE_RULER_IMAGES: del r["imageKey"]
        if r["id"] in FIX_PERSON_ARTICLE: r["wikipedia"], r["summary"] = FIX_PERSON_ARTICLE[r["id"]]
        if r["id"] in FIX_DATES: r["start"], r["end"] = FIX_DATES[r["id"]][:2]
    return d

def opening(title, sentences=3):
    u = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "titles": title, "prop": "extracts", "exintro": 1, "explaintext": 1, "redirects": 1, "format": "json"})
    page = next(iter(json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "BHARATA-atlas/0.1"}), timeout=60))["query"]["pages"].values()))
    text = re.sub(r"\s*\(Sinhala:.*?, named", ", named", page["extract"].split("\n")[0])   # a transliteration note with a missing bracket
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z])", text)
    return " ".join(parts[:sentences])

def polities(d):
    for p in d:
        if p["id"] in FIX_CAPITALS: p["capitals"] = FIX_CAPITALS[p["id"]][0]
    for p in d:
        if p["id"] in FIX_SUMMARY_FROM and p["summary"].startswith("Appears in"):
            p["summary"] = opening(FIX_SUMMARY_FROM[p["id"]])
    for p in d:
        if p["id"] in FIX_WIKIPEDIA: p["wikipedia"] = FIX_WIKIPEDIA[p["id"]][0]
    return d

def battles(d):
    for b in d:
        if b["id"] in STRIP_BATTLE_SUMMARY:
            b["extract"] = f"{b['name']}, {b['year']}. Wikidata records its date and place; there is no article that describes this battle on its own."
            b["wikipedia"] = None
    for b in d:
        fix = FIX_BATTLES.get(b["id"])
        if fix: b.update(fix)
    return d

def drop_images(d):
    for k in REMOVE_RULER_IMAGES:
        c = d.pop(k, None)
        if c:
            path = os.path.join(ROOT, "public" + c["file"])
            if os.path.exists(path): os.remove(path)
    return d

def undouble(text):
    """Commons gives some artist fields twice ("Unknown authorUnknown author"); keep one copy."""
    return re.sub(r"\s{2,}", " ", re.sub(r"^(.+?)\1(?=\W|$)", r"\1", text))

def credits(d):
    for rec in d.values():
        if "artist" in rec: rec["artist"] = undouble(rec["artist"])
    for k, (artist, _why) in FIX_CREDITS.items():
        if k in d: d[k]["artist"] = artist
    return d

def site_credits():
    p = os.path.join(ROOT, "public/data/sites.geojson"); d = json.load(open(p))
    for f in d["features"]:
        if "c" in f["properties"]: f["properties"]["c"] = undouble(f["properties"]["c"])
    json.dump(d, open(p, "w"), separators=(",", ":"), ensure_ascii=False)

def names(d):
    for k, drop in REMOVE_ALIASES.items():
        rec = d["polities"].get(k)
        if rec and "aliases" in rec: rec["aliases"] = [a for a in rec["aliases"] if a not in drop]
    return d

if __name__ == "__main__":
    rw("imported-names.json", names)
    rw("imported-images.json", credits); rw("imported-ruler-images.json", lambda d: drop_images(credits(d)))
    rw("imported-people.json", people); rw("imported-polities.json", polities); rw("imported-battles.json", battles)
    site_credits()
    print("applied", len(REMOVE_PEOPLE), "removals,", len(FIX_DATES), "date fix,", len(FIX_WIKIPEDIA), "title fix,", len(STRIP_BATTLE_SUMMARY), "battle summaries stripped")
