"""Adds native-script names and alternative English names to kingdoms, rulers and places,
from the Wikidata entity pages the other importers have already cached (CC0).

A name is chosen in the language a reader of that region would use (Tamil for the Tamil country,
Persian for the sultanates, and so on), never translated or transliterated by us. If Wikidata has
no label in a suitable language, the record simply has no native name.

Needs  : the other importers' output, and their ./cache (run them first, from the same directory)
Output : lib/data/generated/imported-names.json
Run    : python scripts/import-names.py
"""
import json, os, re

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

# Which languages to try, in order, for each region name used in imported-polities.json.
REGION_LANGS = {
    "Southern India": ["ta", "ml", "kn", "te"], "Tamil country and the east coast": ["ta", "te"], "Tamil country and Andhra": ["ta", "te"],
    "Karnataka and the Deccan": ["kn", "te", "mr", "hi"], "Deccan": ["kn", "te", "mr", "hi", "fa"],
    "Gujarat and Malwa": ["gu", "hi"], "Malwa": ["hi", "gu"], "Rajasthan": ["hi"], "Punjab and Rajasthan": ["pa", "hi"],
    "Bengal": ["bn"], "Assam and the north-east": ["as", "bn"], "Odisha and the east coast": ["or", "bn"],
    "Kashmir and the Himalaya": ["ks", "hi", "ur"], "Himalaya and Nepal": ["ne", "hi"],
    "Afghanistan and Sindh": ["fa", "ps", "ur", "sd"], "Sindh and Makran": ["sd", "ur", "fa"], "Afghanistan and northern India": ["fa", "ur", "hi"],
    "Sri Lanka": ["si", "ta"], "Gangetic plain": ["hi", "sa"], "Northern India": ["hi", "fa", "sa"], "Central India": ["hi", "mr"],
    "Northern India and the Deccan": ["fa", "ur", "hi"], "Bengal and Bihar": ["bn", "hi"],
}
SULTANATE = ["fa", "ur", "ar"]
# Wikidata items that stand for the city or region rather than the kingdom, so their labels name the wrong thing.
SKIP_NATIVE = {"anuradhapura"}
FALLBACK = ["hi", "ta", "kn", "te", "fa", "bn", "si", "ne", "ur"]

def entity(q):
    path = f"cache/wd-{q}.json"
    if not os.path.exists(path): return None
    return json.load(open(path))["entities"][q]

def native(ent, langs):
    labels = ent.get("labels", {})
    for lang in langs:
        v = labels.get(lang, {}).get("value")
        if v and not re.fullmatch(r"[\x00-\x7f]+", v):   # a label that is plain ASCII is just the English name again
            return {"lang": lang, "text": v}
    return None

def aliases(ent, name):
    out = []
    for a in ent.get("aliases", {}).get("en", []):
        v = a["value"].strip()
        if 3 <= len(v) <= 40 and v.lower() != name.lower() and v not in out and not re.search(r"\d{3,}", v): out.append(v)
    return out[:5]

def main():
    polities = json.load(open(os.path.join(ROOT, "lib/data/generated/imported-polities.json")))
    people = json.load(open(os.path.join(ROOT, "lib/data/generated/imported-people.json")))
    places = json.load(open(os.path.join(ROOT, "lib/data/generated/imported-places.json")))
    out = {"polities": {}, "people": {}, "places": {}}
    for p in polities:
        ent = entity(p["wikidata"])
        if not ent: continue
        langs = (SULTANATE if re.search(r"Sultanate|Emirate|Mughal|Ghaznavid|Ghurid", p["name"]) else []) + REGION_LANGS.get(p["region"], []) + FALLBACK
        rec = {}
        n = None if p["id"] in SKIP_NATIVE else native(ent, langs)
        if n: rec["native"] = n
        al = aliases(ent, p["name"])
        if al: rec["aliases"] = al
        if rec: out["polities"][p["id"]] = rec
    for p in people:
        ent = entity(p["q"])
        if not ent: continue
        rec = {}
        home = next((q for q in polities if q["id"] == p["polityId"]), None)
        langs = (REGION_LANGS.get(home["region"], []) if home else []) + (SULTANATE if re.search(r"Sultan|Mughal|Ghaznavid|emperor of", p["role"], re.I) else []) + FALLBACK
        n = native(ent, langs)
        if n: rec["native"] = n
        al = aliases(ent, p["name"])
        if al: rec["aliases"] = al
        if rec: out["people"][p["id"]] = rec
    for p in places:
        ent = entity(p["wikidata"])
        if not ent: continue
        n = native(ent, REGION_LANGS.get(p.get("region", ""), []) + FALLBACK)
        if n: out["places"][p["id"]] = {"native": n}
    json.dump(out, open(os.path.join(ROOT, "lib/data/generated/imported-names.json"), "w"), indent=1, ensure_ascii=False)
    print({k: len(v) for k, v in out.items()}, "records with a name or aliases;",
          "native:", {k: sum("native" in r for r in v.values()) for k, v in out.items()})

if __name__ == "__main__":
    main()
