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

# Battles whose Wikipedia title redirects to a broader subject, so the summary described something else
# (the whole Dutch–Portuguese war, or Shivaji's biography). They keep Wikidata's date and place only.
STRIP_BATTLE_SUMMARY = [
    "battle-battle-of-kolhapur-1659",
    "battle-action-of-23-march-1654-1654",
    "battle-action-of-2-may-1654-1654",
    "battle-action-of-30-september-1639-1639",
    "battle-battle-of-badghis-654",
]

def rw(name, fn):
    p = os.path.join(G, name); d = json.load(open(p)); d = fn(d)
    json.dump(d, open(p, "w"), indent=1, ensure_ascii=False); open(p, "a").write("\n")

def people(d):
    d = [r for r in d if r["id"] not in REMOVE_PEOPLE]
    for r in d:
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
    return d

if __name__ == "__main__":
    rw("imported-people.json", people); rw("imported-polities.json", polities); rw("imported-battles.json", battles)
    print("applied", len(REMOVE_PEOPLE), "removals,", len(FIX_DATES), "date fix,", len(FIX_WIKIPEDIA), "title fix,", len(STRIP_BATTLE_SUMMARY), "battle summaries stripped")
