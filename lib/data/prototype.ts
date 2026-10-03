import type {
  Evidence,
  HistoricalBoundary,
  HistoricalEvent,
  HistoricalRoute,
  Person,
  Place,
  Polity,
  Source,
} from "@/lib/domain/types";
import boundaryGeometries from "./geo/boundaries.json";
import cliopatriaBoundaries from "./geo/cliopatria-boundaries.json";
import importedPolities from "./generated/imported-polities.json";
import importedPlaces from "./generated/imported-places.json";
import importedBattles from "./generated/imported-battles.json";
import importedPeople from "./generated/imported-people.json";
import { images } from "./images";
import importedNames from "./generated/imported-names.json";
import importedRulerLists from "./generated/imported-ruler-lists.json";
import placeWikidata from "./generated/place-wikidata.json";

/** Boundary geometry lives in geo/boundaries.json (keyed by boundary id,
 * `${polityId}-${validFrom}`) — tens of thousands of coordinates don't
 * belong inline in a TypeScript module. */
function boundaryGeometry(id: string): GeoJSON.Polygon | GeoJSON.MultiPolygon {
  const g = (boundaryGeometries as Record<string, GeoJSON.Polygon | GeoJSON.MultiPolygon>)[id];
  if (!g) throw new Error(`No boundary geometry for ${id}`);
  return g;
}

/**
 * PROTOTYPE DATA — NOT A SCHOLARLY CORPUS.
 *
 * Per PROJECT_BIBLE.md §10 (Data Policy): prototype records are acceptable
 * during UI development and must remain clearly illustrative. Boundary
 * geometry is deliberately coarse hand-drawn approximation — it exists to
 * prove the map engine can render zoom-dependent, time-indexed territory,
 * not to assert where a frontier actually ran in a given year.
 *
 * Widely-known facts (capitals, language, religion, approximate reign
 * dates, that a named inscription/temple/statue exists) are stated
 * straightforwardly — these aren't in dispute and don't need hedging.
 * What's illustrative is the *specific narrative detail* BHĀRATA would
 * normally derive from a cited source (a claim's exact wording, a
 * transcription's exact lines, a territory's exact frontier) — those are
 * flagged per-record (`claimIsIllustrative`, boundary `confidence`) rather
 * than blanket-disclaimed, so the distinction stays legible.
 *
 * Photography is real and credited (see lib/data/images.ts). Do not pair
 * a real, identifiable artifact's photo with invented scholarly content
 * about that specific artifact — see the evidence record below for how
 * that's handled.
 */

export const PROTOTYPE_SOURCE: Source = {
  id: "prototype-illustrative",
  title: "No published source yet",
  sourceType: "digital",
  citation:
    "Written as a placeholder for this early version of the site. It does not come from a published source.",
};

const baseSources: Source[] = [
  PROTOTYPE_SOURCE,
  {
    id: "sii-vol-2",
    title: "South Indian Inscriptions, Vol. II",
    sourceType: "epigraphic",
    citation:
      "E. Hultzsch and V. Venkayya (eds.), South Indian Inscriptions, Volume II: Tamil Inscriptions of Rajaraja, Rajendra-Chola and others in the Rajarajesvara Temple at Tanjavur. Archaeological Survey of India, Madras. Scan from the Digital Library of India (public domain).",
    url: "https://archive.org/details/in.ernet.dli.2015.34674",
  },
  {
    id: "nilakanta-sastri-cholas",
    title: "The Cōḻas",
    sourceType: "bibliographic",
    citation: "K. A. Nilakanta Sastri, The Cōḻas, University of Madras, 1955.",
  },
];


const curatedPolities: Polity[] = [
  {
    id: "chola",
    slug: "chola",
    name: "Chola",
    nativeName: "இடைக்காலச் சோழர்கள்",
    alternativeNames: ["Cholas", "Chola dynasty"],
    polityType: "Empire",
    region: "Southern India",
    language: "Tamil",
    religion: "Shaivism, Vaishnavism",
    notableFor: "Its navy and its great temples",
    quote: "Tamil kings who built great temples and sent fleets to Sri Lanka and Southeast Asia.",
    period: {
      startYear: 850,
      endYear: 1279,
      startQualifier: "circa",
      endQualifier: "circa",
      confidence: "probable",
    },
    capitals: ["Thanjavur", "Gangaikonda Cholapuram"],
    summary:
      "A Tamil dynasty from the Kaveri delta. Under Rajaraja I and his son Rajendra I it ruled most of southern India and northern Sri Lanka, and its fleets crossed the Bay of Bengal. It is remembered for its great temples, such as the Brihadisvara Temple at Thanjavur.",
    accentColor: "#96341a",
    heroImageKey: "chola-brihadisvara",
    rulerIds: ["rajaraja-i", "rajendra-i"],
    provenance: [{ sourceId: "wikipedia-check-chola", note: "Written here; each statement was checked against this article." }],
  },
  {
    id: "pandya",
    slug: "pandya",
    name: "Pandya",
    nativeName: "பாண்டியர்",
    alternativeNames: ["Pandyas", "Pandyan dynasty"],
    polityType: "Kingdom",
    region: "Southern India",
    language: "Tamil",
    religion: "Hinduism, Jainism, Buddhism",
    notableFor: "Its rise in the 1250s, and sea trade through its ports",
    quote: "The kings of Madurai, who rose to rule the far south in the 1200s.",
    period: {
      startYear: 1190,
      endYear: 1345,
      startQualifier: "circa",
      endQualifier: "circa",
      confidence: "probable",
    },
    capitals: ["Madurai"],
    summary:
      "One of the oldest Tamil dynasties, ruling from Madurai. In the 1250s, under Jatavarman Sundara Pandyan I, it expanded north into the Telugu country and conquered northern Sri Lanka, until the Delhi Sultanate's invasion of 1310–11.",
    accentColor: "#3a5a78",
    heroImageKey: "pandya-meenakshi",
    rulerIds: ["jatavarman-sundara-pandyan-i"],
    provenance: [{ sourceId: "wikipedia-check-pandya", note: "Written here; each statement was checked against this article." }],
  },
  {
    id: "vijayanagara",
    slug: "vijayanagara",
    name: "Vijayanagara",
    nativeName: "విజయనగర సామ్రాజ్యం",
    alternativeNames: ["Vijayanagara Empire"],
    polityType: "Empire",
    region: "Deccan / Southern India",
    language: "Kannada, Telugu, Sanskrit",
    religion: "Vaishnavism, Shaivism",
    notableFor: "Its huge capital at Hampi, Indian Ocean trade, and temple building",
    quote: "A Deccan empire ruled from Hampi, one of the largest cities of its time.",
    period: {
      startYear: 1336,
      endYear: 1646,
      startQualifier: "circa",
      endQualifier: "circa",
      confidence: "probable",
    },
    capitals: ["Hampi"],
    summary:
      "An empire founded in 1336 and ruled from the city of Vijayanagara, today's Hampi. It was at its largest under Krishnadevaraya in the early 1500s. After its defeat at Talikota in 1565 the city was sacked, and a smaller empire carried on from further south-east.",
    accentColor: "#8a6d1f",
    heroImageKey: "vijayanagara-virupaksha",
    rulerIds: ["krishnadevaraya"],
    provenance: [{ sourceId: "wikipedia-check-vijayanagara", note: "Written here; each statement was checked against this article." }],
  },
  {
    id: "chera",
    slug: "chera",
    name: "Chera",
    nativeName: "சேரர்",
    alternativeNames: ["Cheras", "Chera Perumals"],
    polityType: "Kingdom",
    region: "Southern India",
    language: "Early Malayalam",
    religion: "Hinduism, with Christian, Jewish and Muslim trading communities",
    notableFor: "The Malabar spice trade with the Middle East",
    quote: "Kings of the Kerala coast, rich from the pepper and spice trade.",
    period: {
      startYear: 844,
      endYear: 1124,
      startQualifier: "circa",
      endQualifier: "circa",
      confidence: "probable",
    },
    capitals: ["Kodungallur"],
    summary:
      "Kings of the Kerala coast, known in this period as the Chera Perumals, who ruled from Kodungallur. Their ports sent pepper and other spices across the Indian Ocean to the Middle East. Copper-plate charters record grants to Christian and Jewish traders, and West Asian Muslim merchants settled there too.",
    accentColor: "#2f6b5e",
    heroImageKey: "chera-vadakkunnathan",
    rulerIds: [],
    provenance: [{ sourceId: "wikipedia-check-chera", note: "Written here; each statement was checked against this article." }],
  },
  {
    id: "rashtrakuta",
    slug: "rashtrakuta",
    name: "Rashtrakuta",
    nativeName: "ರಾಷ್ಟ್ರಕೂಟ",
    alternativeNames: ["Rashtrakutas"],
    polityType: "Empire",
    region: "Deccan",
    language: "Kannada, Sanskrit",
    religion: "Hinduism, Jainism",
    notableFor: "The Kailasa Temple at Ellora, cut out of solid rock; raids reaching Kannauj and Tamil country",
    quote: "Deccan emperors who had the Kailasa Temple cut out of solid rock at Ellora.",
    period: {
      startYear: 753,
      endYear: 982,
      startQualifier: "circa",
      endQualifier: "circa",
      confidence: "probable",
    },
    capitals: ["Manyakheta"],
    summary:
      "A Deccan dynasty that took power from the Chalukyas of Badami around 753. Its armies raided as far as Kannauj in the north and the Tamil country in the south, and under Krishna I the Kailasa Temple at Ellora was cut downward out of a single rock face.",
    accentColor: "#5c3a6e",
    heroImageKey: "rashtrakuta-kailasa",
    rulerIds: ["amoghavarsha-i"],
    provenance: [{ sourceId: "wikipedia-check-rashtrakuta", note: "Written here; each statement was checked against this article." }],
  },
  {
    id: "chalukya-kalyani",
    slug: "chalukya-kalyani",
    name: "Chalukya (Kalyani)",
    alternativeNames: ["Western Chalukyas", "Later Chalukyas"],
    polityType: "Empire",
    region: "Deccan",
    language: "Kannada, Sanskrit",
    religion: "Hinduism, Jainism",
    notableFor: "Temples at Lakkundi and Itagi; counting years from Vikramaditya VI's accession",
    quote: "Rulers of the western Deccan from Kalyani, who overthrew the Rashtrakutas.",
    period: {
      startYear: 973,
      endYear: 1189,
      startQualifier: "circa",
      endQualifier: "circa",
      confidence: "probable",
    },
    capitals: ["Basavakalyan"],
    summary:
      "The Chalukyas of Kalyani, who overthrew the Rashtrakutas in 973 and ruled the western Deccan for two centuries. Under Vikramaditya VI, inscriptions counted the years from his accession in 1076.",
    accentColor: "#b06b2c",
    heroImageKey: "chalukya-itagi",
    rulerIds: ["vikramaditya-vi"],
    provenance: [{ sourceId: "wikipedia-check-chalukya-kalyani", note: "Written here; each statement was checked against this article." }],
  },
  {
    id: "hoysala",
    slug: "hoysala",
    name: "Hoysala",
    nativeName: "ಹೊಯ್ಸಳ",
    alternativeNames: ["Hoysalas"],
    polityType: "Kingdom",
    region: "Deccan",
    language: "Kannada, Sanskrit",
    religion: "Hinduism, Jainism",
    notableFor: "Carved soapstone temples at Belur and Halebidu",
    quote: "Kings of southern Karnataka, famous for their richly carved temples.",
    period: {
      startYear: 1026,
      endYear: 1343,
      startQualifier: "circa",
      endQualifier: "circa",
      confidence: "probable",
    },
    capitals: ["Dorasamudra", "Belur"],
    summary:
      "A southern Karnataka kingdom known above all for its intricately carved soapstone temples — the Chennakeshava Temple at Belur and Hoysaleswara Temple at Halebidu remain among the most ornamented in India.",
    accentColor: "#8c3f5f",
    heroImageKey: "hoysala-chennakeshava",
    rulerIds: ["vishnuvardhana"],
    provenance: [{ sourceId: "wikipedia-check-hoysala", note: "Written here; each statement was checked against this article." }],
  },
  {
    id: "pala",
    slug: "pala",
    name: "Pala",
    nativeName: "पाल वंश",
    alternativeNames: ["Palas", "Pala Empire"],
    polityType: "Empire",
    region: "Bengal and Bihar",
    language: "Sanskrit",
    religion: "Buddhism, Shaivism",
    notableFor: "Patronage of the great Buddhist monasteries of eastern India — Nalanda, Vikramashila and Somapura",
    quote: "Kings of Bengal and Bihar, and great patrons of Buddhist monasteries.",
    period: { startYear: 750, endYear: 1161, startQualifier: "circa", endQualifier: "circa", confidence: "probable" },
    capitals: ["Pataliputra", "Gauda"],
    summary:
      "A dynasty from Bengal that began, by tradition, with the election of Gopala as king around 750. Under Dharmapala and Devapala it ruled Bengal and Bihar and fought the Pratiharas and Rashtrakutas for control of Kannauj.",
    accentColor: "#5e6b2a",
    heroImageKey: "pala-somapura",
    rulerIds: ["dharmapala"],
    provenance: [{ sourceId: "wikipedia-check-pala", note: "Written here; each statement was checked against this article." }],
  },
  {
    id: "pratihara",
    slug: "pratihara",
    name: "Gurjara-Pratihara",
    nativeName: "गुर्जर-प्रतिहार राजवंश",
    alternativeNames: ["Pratiharas", "Imperial Pratiharas"],
    polityType: "Empire",
    region: "Northern and western India",
    language: "Sanskrit",
    religion: "Vaishnavism, Shaivism",
    notableFor: "Ruling northern India from Kannauj, and holding back Arab armies west of the Indus",
    quote: "Rulers of northern India from Kannauj for about two centuries.",
    period: { startYear: 730, endYear: 1036, startQualifier: "circa", endQualifier: "circa", confidence: "probable" },
    capitals: ["Kannauj"],
    summary:
      "A dynasty that rose in Malwa and Rajasthan in the 8th century and secured the throne of Kannauj in 816, which became the centre of its state. It reached its peak under Mihira Bhoja and his successor Mahendrapala I, across much of northern India, before shrinking back to a small state around Kannauj by the end of the 10th century.",
    accentColor: "#3f4f86",
    heroImageKey: "pratihara-bateshwar",
    rulerIds: ["mihira-bhoja"],
    provenance: [{ sourceId: "wikipedia-check-pratihara", note: "Written here; each statement was checked against this article." }],
  },
  {
    id: "delhi-sultanate",
    slug: "delhi-sultanate",
    name: "Delhi Sultanate",
    nativeName: "سلطنت دهلی",
    alternativeNames: ["Sultanate of Delhi"],
    polityType: "Sultanate",
    region: "Northern India",
    language: "Persian",
    religion: "Islam",
    notableFor: "Five dynasties in turn on one throne; the Qutb Minar; Persian as the language of government",
    quote: "Five dynasties of sultans, one after another, ruling mostly from Delhi.",
    period: { startYear: 1206, endYear: 1526, startQualifier: "exact", endQualifier: "exact", confidence: "probable" },
    capitals: ["Delhi"],
    summary:
      "The state that began in 1206, when Qutb ud-Din Aibak, a general of Muhammad of Ghor, became ruler of his master's conquests in India. Five dynasties followed one another on its throne; under the Khaljis and Tughlaqs its armies reached far into the south, before it shrank back to the north and ended at Panipat in 1526.",
    accentColor: "#2f5d3a",
    heroImageKey: "delhi-qutb",
    rulerIds: ["iltutmish"],
    provenance: [{ sourceId: "wikipedia-check-delhi-sultanate", note: "Written here; each statement was checked against this article." }],
  },
  {
    id: "bahmani",
    slug: "bahmani",
    name: "Bahmani",
    nativeName: "سلطان‌نشین بهمنی",
    alternativeNames: ["Bahmani Sultanate"],
    polityType: "Sultanate",
    region: "Northern Deccan",
    language: "Persian",
    religion: "Islam",
    notableFor: "The first independent sultanate of the Deccan, and long rival of Vijayanagara",
    quote: "The first independent sultanate of the Deccan, and Vijayanagara's long rival.",
    period: { startYear: 1347, endYear: 1527, startQualifier: "exact", endQualifier: "circa", confidence: "probable" },
    capitals: ["Gulbarga", "Bidar"],
    summary:
      "Founded in 1347 when Deccan nobles revolted against Delhi and made Alauddin Hasan Bahman Shah their king at Gulbarga. The capital moved to Bidar in 1429. After 1518 the sultanate broke up into five states: Ahmadnagar, Berar, Bidar, Bijapur and Golconda.",
    accentColor: "#1f7083",
    heroImageKey: "bahmani-gawan",
    rulerIds: ["alauddin-hasan-bahman-shah"],
    provenance: [{ sourceId: "wikipedia-check-bahmani", note: "Written here; each statement was checked against this article." }],
  },
];

/**
 * Where each kingdom's borders and dates come from. Most kingdoms' borders
 * and dates are from Cliopatria (Seshat Global History Databank, CC BY 4.0):
 * one researched version of each polity's territory, in dated snapshots.
 * The hand-written records above keep their own text, but take their
 * period from the same dataset so the page and the map agree.
 */
export const CLIOPATRIA_SOURCE: Source = {
  id: "cliopatria",
  title: "Cliopatria",
  sourceType: "cartographic",
  citation:
    "Bennett, J. S., Mutch, E., Tollefson, A., Chalstrey, E., Benam, M. et al. (2025). Cliopatria: a geospatial database of world-wide political entities from 3400 BCE to 2024 CE. Scientific Data 12, 247. Seshat Global History Databank, CC BY 4.0. Borders are one researched version of each territory and are not exact frontiers.",
  url: "https://doi.org/10.1038/s41597-025-04516-9",
};
export const WIKIDATA_SOURCE: Source = {
  id: "wikidata",
  title: "Wikidata",
  sourceType: "digital",
  citation: "Wikidata, wikidata.org (CC0). Capital cities and their coordinates.",
};

// Native-script names and aliases from Wikidata (see scripts/import-names.py). Keyed by record id.
type NameRecord = { native?: { lang: string; text: string }; aliases?: string[] };
const names = importedNames as { polities: Record<string, NameRecord>; people: Record<string, NameRecord>; places: Record<string, NameRecord> };

type ImportedPolity = (typeof importedPolities)[number];
const importedById = new Map<string, ImportedPolity>(importedPolities.map((p) => [p.id, p]));

function polityKind(name: string): string {
  if (/Emirate/.test(name)) return "Emirate";
  if (/Sultanate/.test(name)) return "Sultanate";
  if (/Empire/.test(name)) return "Empire";
  return "Kingdom";
}

// The Wikipedia article each hand-written kingdom summary was checked against.
const CHECKED_ARTICLES: Record<string, string> = {"chola": "Chola dynasty", "pandya": "Pandya dynasty", "vijayanagara": "Vijayanagara Empire", "chera": "Chera Perumals of Makotai", "rashtrakuta": "Rashtrakuta dynasty", "chalukya-kalyani": "Western Chalukya Empire", "hoysala": "Hoysala Empire", "pala": "Pala Empire", "pratihara": "Gurjara-Pratihara dynasty", "delhi-sultanate": "Delhi Sultanate", "bahmani": "Bahmani Sultanate"};

// The Wikipedia article each hand-written ruler record was checked against.
const CHECKED_PEOPLE: Record<string, string> = {"rajaraja-i": "Rajaraja I", "rajendra-i": "Rajendra Chola I", "jatavarman-sundara-pandyan-i": "Jatavarman Sundara Pandyan", "krishnadevaraya": "Krishnadevaraya", "amoghavarsha-i": "Amoghavarsha", "vikramaditya-vi": "Vikramaditya VI", "vishnuvardhana": "Vishnuvardhana", "dharmapala": "Dharmapala of Bengal", "mihira-bhoja": "Mihira Bhoja", "iltutmish": "Iltutmish", "alauddin-hasan-bahman-shah": "Alauddin Bahman Shah"};

// Wikipedia articles the hand-written turning points were checked against.
const CHECKED_EVENT_ARTICLES = ["Bahmani Sultanate", "Battle of Talikota", "Chennakeshava Temple, Belur", "Gangaikonda Cholapuram", "Kailasa temple, Ellora", "Qutb al-Din Aibak", "Rajaraja I", "Tripartite Struggle", "Vijayabahu I"];

export const sources: Source[] = [
  ...baseSources,
  ...CHECKED_EVENT_ARTICLES.map(
    (article): Source => ({
      id: `wikipedia-article-${article.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
      title: `Wikipedia: ${article}`,
      sourceType: "digital",
      citation: `English Wikipedia, "${article}", en.wikipedia.org/wiki/${article.replace(/ /g, "_")} (CC BY-SA 4.0). The text here is written in our own words; the date and each statement in it were checked against this article.`,
      url: `https://en.wikipedia.org/wiki/${article.replace(/ /g, "_")}`,
    }),
  ),
  ...Object.entries(CHECKED_PEOPLE).map(
    ([id, article]): Source => ({
      id: `wikipedia-check-person-${id}`,
      title: `Wikipedia: ${article}`,
      sourceType: "digital",
      citation: `English Wikipedia, "${article}", en.wikipedia.org/wiki/${article.replace(/ /g, "_")} (CC BY-SA 4.0). The summary here is written in our own words; the reign dates and each statement in it were checked against this article.`,
      url: `https://en.wikipedia.org/wiki/${article.replace(/ /g, "_")}`,
    }),
  ),
  ...Object.entries(CHECKED_ARTICLES).map(
    ([id, article]): Source => ({
      id: `wikipedia-check-${id}`,
      title: `Wikipedia: ${article}`,
      sourceType: "digital",
      citation: `English Wikipedia, "${article}", en.wikipedia.org/wiki/${article.replace(/ /g, "_")} (CC BY-SA 4.0). The summary here is written in our own words; each statement in it was checked against this article.`,
      url: `https://en.wikipedia.org/wiki/${article.replace(/ /g, "_")}`,
    }),
  ),
  CLIOPATRIA_SOURCE,
  WIKIDATA_SOURCE,
  ...importedPeople
    .filter((p) => p.summary && p.wikipedia)
    .map(
      (p): Source => ({
        id: `wikipedia-ruler-${p.q}`,
        title: `Wikipedia: ${p.wikipedia?.replace(/_/g, " ")}`,
        sourceType: "digital",
        citation: `English Wikipedia, "${p.wikipedia?.replace(/_/g, " ")}", en.wikipedia.org/wiki/${p.wikipedia} (CC BY-SA 4.0). Opening sentences, trimmed.`,
      }),
    ),
  // One source per Wikipedia list page that rulers were read from (see scripts/import-ruler-lists.py).
  ...[...new Set(importedRulerLists.map((r) => r.list))].map(
    (page): Source => ({
      id: `wikipedia-list-${page.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: `Wikipedia: ${page}`,
      sourceType: "digital",
      citation: `English Wikipedia, "${page}", en.wikipedia.org/wiki/${page.replace(/ /g, "_")} (CC BY-SA 4.0). Names and reign years from the article's list of rulers.`,
      url: `https://en.wikipedia.org/wiki/${page.replace(/ /g, "_")}`,
    }),
  ),
  ...importedBattles
    .filter((b) => b.wikipedia)
    .map(
      (b): Source => ({
        id: `wikipedia-battle-${b.wikidata}`,
        title: `Wikipedia: ${b.wikipedia?.replace(/_/g, " ")}`,
        sourceType: "digital",
        citation: `English Wikipedia, "${b.wikipedia?.replace(/_/g, " ")}", en.wikipedia.org/wiki/${b.wikipedia} (CC BY-SA 4.0). Opening sentences, trimmed.`,
      }),
    ),
  ...importedPolities
    .filter((p) => !p.curated)
    .map(
      (p): Source => ({
        id: `wikipedia-${p.id}`,
        title: `Wikipedia: ${p.title}`,
        sourceType: "digital",
        citation: `English Wikipedia, "${p.title}", en.wikipedia.org/wiki/${p.wikipedia} (CC BY-SA 4.0). Opening paragraph, lightly trimmed.`,
      }),
    ),
];

export const polities: Polity[] = [
  ...curatedPolities.map((p) => {
    const imp = importedById.get(p.id);
    if (!imp) return p;
    return {
      ...p,
      period: { ...p.period, startYear: imp.from, endYear: imp.to, startQualifier: "circa" as const, endQualifier: "circa" as const },
      provenance: [...p.provenance, { sourceId: CLIOPATRIA_SOURCE.id, note: "Borders and dates." }],
    };
  }),
  ...importedPolities
    .filter((p) => !p.curated)
    .map(
      (p): Polity => ({
        id: p.id,
        slug: p.id,
        name: p.name,
        nativeName: names.polities[p.id]?.native?.text,
        nativeLang: names.polities[p.id]?.native?.lang,
        alternativeNames: names.polities[p.id]?.aliases ?? [],
        polityType: polityKind(p.name),
        region: p.region,
        capitals: p.capitals,
        summary: p.summary,
        period: { startYear: p.from, endYear: p.to, startQualifier: "circa", endQualifier: "circa", confidence: "probable" },
        accentColor: p.accentColor,
        // Kingdoms the first photo pass missed got a hand-picked one later (scripts/import-photos.py), keyed "kp-<id>".
        heroImageKey: p.imageKey ?? (`kp-${p.id}` in images ? `kp-${p.id}` : undefined),
        rulerIds: [],
        provenance: [
          { sourceId: CLIOPATRIA_SOURCE.id, note: "Borders and dates." },
          { sourceId: `wikipedia-${p.id}`, note: "Summary." },
        ],
      }),
    ),
];


const curatedPeople: Person[] = [
  {
    id: "rajaraja-i",
    slug: "rajaraja-i",
    name: "Rajaraja I",
    nativeName: "முதலாம் இராஜராஜ சோழன்",
    role: "Chola emperor",
    polityId: "chola",
    period: { startYear: 985, endYear: 1014, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary:
      "Built the Brihadisvara Temple at Thanjavur. His armies and fleets took northern Sri Lanka and the Maldives.",
    imageKey: "ruler-rajaraja-mural",
    provenance: [{ sourceId: "wikipedia-check-person-rajaraja-i", note: "Written here; the dates and each statement were checked against this article." }],
  },
  {
    id: "rajendra-i",
    slug: "rajendra-i",
    name: "Rajendra I",
    nativeName: "இராசேந்திர சோழன்",
    role: "Chola emperor",
    polityId: "chola",
    period: { startYear: 1014, endYear: 1044, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary:
      "Built the new capital of Gangaikonda Cholapuram, named after his army's expedition to the Ganges, and sent a fleet against Srivijaya in Southeast Asia.",
    provenance: [{ sourceId: "wikipedia-check-person-rajendra-i", note: "Written here; the dates and each statement were checked against this article." }],
  },
  {
    id: "jatavarman-sundara-pandyan-i",
    slug: "jatavarman-sundara-pandyan-i",
    name: "Jatavarman Sundara Pandyan I",
    role: "Pandya emperor",
    polityId: "pandya",
    period: { startYear: 1251, endYear: 1268, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary: "Forced the Chola king Rajendra III to accept Pandya overlordship, defeated the Cheras and the Hoysalas, and took Kanchipuram in 1258. Local rulers in Sri Lanka also submitted to him.",
    provenance: [{ sourceId: "wikipedia-check-person-jatavarman-sundara-pandyan-i", note: "Written here; the dates and each statement were checked against this article." }],
  },
  {
    id: "krishnadevaraya",
    slug: "krishnadevaraya",
    name: "Krishnadevaraya",
    nativeName: "ಕೃಷ್ಣದೇವರಾಯ",
    role: "Vijayanagara emperor",
    polityId: "vijayanagara",
    period: { startYear: 1509, endYear: 1529, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary:
      "Widely regarded as Vijayanagara's greatest ruler; expanded the empire's territory and was a noted patron of Telugu and Sanskrit literature.",
    imageKey: "ruler-krishnadevaraya",
    provenance: [{ sourceId: "wikipedia-check-person-krishnadevaraya", note: "Written here; the dates and each statement were checked against this article." }],
  },
  {
    id: "amoghavarsha-i",
    slug: "amoghavarsha-i",
    name: "Amoghavarsha I",
    role: "Rashtrakuta emperor",
    polityId: "rashtrakuta",
    period: { startYear: 814, endYear: 878, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary: "A Rashtrakuta emperor whose reign of about 64 years is one of the longest precisely dated on record. He is credited, with the Jain teacher Jinasena, with the Kavirajamarga, the earliest surviving work on Kannada poetry.",
    provenance: [{ sourceId: "wikipedia-check-person-amoghavarsha-i", note: "Written here; the dates and each statement were checked against this article." }],
  },
  {
    id: "vikramaditya-vi",
    slug: "vikramaditya-vi",
    name: "Vikramaditya VI",
    role: "Chalukya emperor",
    polityId: "chalukya-kalyani",
    period: { startYear: 1076, endYear: 1126, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary: "Called the greatest of the Western Chalukya kings, and on the throne for fifty years. He began a new era, the Chalukya-Vikrama era, counted from his accession in 1076.",
    provenance: [{ sourceId: "wikipedia-check-person-vikramaditya-vi", note: "Written here; the dates and each statement were checked against this article." }],
  },
  {
    id: "vishnuvardhana",
    slug: "vishnuvardhana",
    name: "Vishnuvardhana",
    role: "Hoysala king",
    polityId: "hoysala",
    period: { startYear: 1108, endYear: 1152, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary: "Built the Chennakeshava Temple at Belur to celebrate his success. His campaigns against the Cholas earned him the title Talakadugonda, “taker of Talakad”.",
    provenance: [{ sourceId: "wikipedia-check-person-vishnuvardhana", note: "Written here; the dates and each statement were checked against this article." }],
  },
  {
    id: "dharmapala",
    slug: "dharmapala",
    name: "Dharmapala",
    nativeName: "धर्मपाल",
    role: "Pala emperor",
    polityId: "pala",
    period: { startYear: 783, endYear: 815, startQualifier: "circa", endQualifier: "circa", confidence: "disputed" },
    summary:
      "Ruled Bengal and Bihar directly, and fought the Pratiharas and Rashtrakutas over Kannauj. Founded the Vikramashila monastery and built the great Somapura Mahavihara at Paharpur. Historians date his reign differently, between 770–810 and 783–820.",
    provenance: [{ sourceId: "wikipedia-check-person-dharmapala", note: "Written here; the dates and each statement were checked against this article." }],
  },
  {
    id: "mihira-bhoja",
    slug: "mihira-bhoja",
    name: "Mihira Bhoja",
    nativeName: "मिहिर भोज",
    role: "Pratihara emperor",
    polityId: "pratihara",
    period: { startYear: 836, endYear: 885, startQualifier: "circa", endQualifier: "circa", confidence: "probable" },
    summary: "Ruled from Kannauj. At its height his empire reached the Narmada in the south, the Sutlej in the north-west and Bengal in the east.",
    provenance: [{ sourceId: "wikipedia-check-person-mihira-bhoja", note: "Written here; the dates and each statement were checked against this article." }],
  },
  {
    id: "iltutmish",
    slug: "iltutmish",
    name: "Iltutmish",
    role: "Sultan of Delhi",
    polityId: "delhi-sultanate",
    period: { startYear: 1211, endYear: 1236, startQualifier: "exact", endQualifier: "exact", confidence: "probable" },
    summary: "Held the young Sultanate together after Aibak's death, made Delhi its capital, and completed the Qutb Minar.",
    provenance: [{ sourceId: "wikipedia-check-person-iltutmish", note: "Written here; the dates and each statement were checked against this article." }],
  },
  {
    id: "alauddin-hasan-bahman-shah",
    slug: "alauddin-hasan-bahman-shah",
    name: "Alauddin Hasan Bahman Shah",
    role: "Founder of the Bahmani Sultanate",
    polityId: "bahmani",
    period: { startYear: 1347, endYear: 1358, startQualifier: "exact", endQualifier: "exact", confidence: "probable" },
    summary: "Rose to power in the Deccan rebellion of 1347 and was crowned at Gulbarga on 3 August 1347, founding the Bahmani Sultanate.",
    provenance: [{ sourceId: "wikipedia-check-person-alauddin-hasan-bahman-shah", note: "Written here; the dates and each statement were checked against this article." }],
  },
];

/**
 * Rulers from Wikidata (dates, role) and Wikipedia (summary). An imported
 * ruler is dropped when a hand-written record already covers the same person
 * (same kingdom, overlapping years, similar name).
 */
const sameName = (a: string, b: string) => {
  const n = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");
  const [x, y] = [n(a), n(b)];
  return x === y || x.startsWith(y.slice(0, 7)) || y.startsWith(x.slice(0, 7));
};
// A lifetime-only record is dropped where a list gives the same ruler's actual reign.
const supersededRulerIds = new Set(importedRulerLists.flatMap((r) => r.supersedes));
const importedPeopleRecords: Person[] = importedPeople
  .filter((p) => !supersededRulerIds.has(p.id))
  .filter((p) => !curatedPeople.some((c) => c.polityId === p.polityId && sameName(c.name, p.name) && c.period.startYear <= (p.end ?? p.start) + 5 && p.start <= (c.period.endYear ?? c.period.startYear) + 5))
  .map((p): Person => ({
    id: p.id,
    slug: p.id,
    name: p.name,
    nativeName: names.people[p.id]?.native?.text,
    nativeLang: names.people[p.id]?.native?.lang,
    role: p.role,
    polityId: p.polityId,
    datesAre: p.datesAre as "reign" | "lifetime",
    imageKey: "imageKey" in p ? (p.imageKey as string) : undefined,
    period: { startYear: p.start, endYear: p.end, startQualifier: "circa", endQualifier: "circa", confidence: "probable" },
    summary: p.summary || undefined,
    provenance: [
      p.datesFromText
        ? { sourceId: WIKIDATA_SOURCE.id, note: "Role. Reign dates were read from the Wikipedia summary, not from Wikidata." }
        : { sourceId: WIKIDATA_SOURCE.id, note: p.datesAre === "reign" ? "Role and reign dates." : "Role and life dates." },
      ...(p.summary ? [{ sourceId: `wikipedia-ruler-${p.q}`, note: "Summary." }] : []),
    ],
  }));
// Rulers of kingdoms Wikidata has no monarch records for, read from Wikipedia's own lists.
const listedRulerRecords: Person[] = importedRulerLists.map(
  (r): Person => ({
    id: r.id,
    slug: r.id,
    name: r.name,
    role: r.role,
    polityId: r.polityId,
    datesAre: "reign",
    period: { startYear: r.start, endYear: r.end ?? null, startQualifier: "circa", endQualifier: r.end == null ? "unknown" : "circa", confidence: "probable" },
    provenance: [
      {
        sourceId: `wikipedia-list-${r.list.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        note: r.endFromNext ? "Name and start of reign. The list gives only the year each ruler took the throne, so the reign is shown as ending where the next one begins." : "Name and reign years.",
      },
    ],
  }),
);
export const people: Person[] = [...curatedPeople, ...importedPeopleRecords, ...listedRulerRecords];

const curatedPlaces: Place[] = [
  { id: "thanjavur", slug: "thanjavur", name: "Thanjavur", placeType: "capital", coordinates: [79.1378, 10.787], region: "Tamil Nadu", imageKey: "chola-brihadisvara", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "gangaikondacholapuram", slug: "gangaikondacholapuram", name: "Gangaikonda Cholapuram", placeType: "capital", coordinates: [79.4486, 11.2075], region: "Tamil Nadu", imageKey: "place-gangaikondacholapuram", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "madurai", slug: "madurai", name: "Madurai", placeType: "capital", coordinates: [78.1198, 9.9252], region: "Tamil Nadu", imageKey: "pandya-meenakshi", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "hampi", slug: "hampi", name: "Hampi", placeType: "capital", coordinates: [76.4600, 15.3350], region: "Karnataka", imageKey: "vijayanagara-virupaksha", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "kanchipuram", slug: "kanchipuram", name: "Kanchipuram", placeType: "settlement", coordinates: [79.7036, 12.8342], region: "Tamil Nadu", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "nagapattinam", slug: "nagapattinam", name: "Nagapattinam", placeType: "port", coordinates: [79.8428, 10.7657], region: "Tamil Nadu", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "kodungallur", slug: "kodungallur", name: "Kodungallur", placeType: "capital", coordinates: [76.195, 10.2297], region: "Kerala", imageKey: "chera-vadakkunnathan", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "manyakheta", slug: "manyakheta", name: "Manyakheta", placeType: "capital", coordinates: [77.2058, 17.1964], region: "Karnataka", imageKey: "rashtrakuta-kailasa", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "basavakalyan", slug: "basavakalyan", name: "Basavakalyan", placeType: "capital", coordinates: [76.94, 17.8697], region: "Karnataka", imageKey: "chalukya-itagi", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "dorasamudra", slug: "dorasamudra", name: "Dorasamudra (Halebidu)", placeType: "capital", coordinates: [76.2437, 13.2132], region: "Karnataka", imageKey: "hoysala-chennakeshava", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "belur", slug: "belur", name: "Belur", placeType: "capital", coordinates: [75.8648, 13.1629], region: "Karnataka", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "ellora", slug: "ellora", name: "Ellora", placeType: "monument", coordinates: [75.1791, 20.0268], region: "Maharashtra", imageKey: "rashtrakuta-kailasa", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "pataliputra", slug: "pataliputra", name: "Pataliputra (Patna)", placeType: "capital", coordinates: [85.1376, 25.5941], region: "Bihar", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "gauda", slug: "gauda", name: "Gauda", placeType: "capital", coordinates: [88.1361, 24.8713], region: "West Bengal", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "somapura", slug: "somapura", name: "Somapura Mahavihara", placeType: "monument", coordinates: [88.977, 25.0311], region: "Rajshahi, Bangladesh", imageKey: "pala-somapura", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "kannauj", slug: "kannauj", name: "Kannauj", placeType: "capital", coordinates: [79.918, 27.0514], region: "Uttar Pradesh", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "bateshwar", slug: "bateshwar", name: "Bateshwar temples", placeType: "monument", coordinates: [78.1966, 26.4286], region: "Madhya Pradesh", imageKey: "pratihara-bateshwar", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "delhi", slug: "delhi", name: "Delhi", placeType: "capital", coordinates: [77.209, 28.6139], region: "Delhi", imageKey: "delhi-qutb", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "gulbarga", slug: "gulbarga", name: "Gulbarga (Kalaburagi)", placeType: "capital", coordinates: [76.8343, 17.3297], region: "Karnataka", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "bidar", slug: "bidar", name: "Bidar", placeType: "capital", coordinates: [77.5199, 17.9104], region: "Karnataka", imageKey: "bahmani-gawan", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "anuradhapura", slug: "anuradhapura", name: "Anuradhapura", placeType: "settlement", coordinates: [80.4037, 8.3114], region: "Sri Lanka", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
  { id: "polonnaruwa", slug: "polonnaruwa", name: "Polonnaruwa", placeType: "settlement", coordinates: [81.0006, 7.9403], region: "Sri Lanka", provenance: [{ sourceId: PROTOTYPE_SOURCE.id }] },
];

// Each hand-written place takes its coordinates from the Wikidata item it was matched to (scripts/check-places.py).
const wikidataPlaces = placeWikidata as unknown as Record<string, { q: string; coordinates: [number, number] }>;
const checkedPlaces: Place[] = curatedPlaces.map((p) => {
  const wd = wikidataPlaces[p.id];
  return wd ? { ...p, coordinates: wd.coordinates, provenance: [{ sourceId: WIKIDATA_SOURCE.id, note: `Name and location (Wikidata ${wd.q}).` }] } : p;
});

/** Capitals from Wikidata, except where a hand-written place already covers the same city. */
const importedPlaceRecords: Place[] = importedPlaces
  .filter((pl) => !curatedPlaces.some((c) => c.name.includes(pl.name) || pl.name.startsWith(c.name.split(" ")[0])))
  .map((pl) => ({
    id: pl.id,
    slug: pl.id,
    name: pl.name,
    nativeName: names.places[pl.id]?.native?.text,
    nativeLang: names.places[pl.id]?.native?.lang,
    placeType: "capital",
    coordinates: pl.coordinates as [number, number],
    region: pl.region,
    provenance: [{ sourceId: WIKIDATA_SOURCE.id, note: "Name and location." }],
  }));
export const places: Place[] = [...checkedPlaces, ...importedPlaceRecords];

/**
 * Borders. Almost all come from Cliopatria — dated snapshots of one
 * researched version of each state's territory (see CLIOPATRIA_SOURCE).
 * The exception is Chera, which has no Cliopatria entry: its shape is
 * still the union of modern Kerala districts, kept as a placeholder.
 */
const cliopatriaBoundaryRecords: HistoricalBoundary[] = cliopatriaBoundaries.map((b) => ({
  polityId: b.polityId,
  validFrom: b.validFrom,
  validTo: b.validTo,
  confidence: "medium",
  provenance: [{ sourceId: CLIOPATRIA_SOURCE.id, note: `Cliopatria entry "${b.source}".` }],
  geometry: b.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon,
}));

export const boundaries: HistoricalBoundary[] = [
  {
    polityId: "chera",
    validFrom: 800,
    validTo: 1124,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern Kerala districts — not a reconstructed frontier." }],
    geometry: boundaryGeometry("chera-800"),
  },
  ...cliopatriaBoundaryRecords,
];

/**
 * Hand-drawn illustrative paths — not reconstructed historical trade or
 * campaign routes. They exist to demonstrate the map engine's animated
 * route rendering; see the module-level notice above.
 */
export const routes: HistoricalRoute[] = [
  {
    id: "chola-sri-lanka-naval",
    label: "Naval campaign route (illustrative)",
    routeType: "maritime",
    polityIds: ["chola"],
    validFrom: 985,
    validTo: 1044,
    confidence: "illustrative",
    provenance: [
      { sourceId: PROTOTYPE_SOURCE.id, note: "Hand-drawn approximation, kept at sea: Palk Bay to the port of Mantai." },
    ],
    path: {
      type: "LineString",
      coordinates: [
        [79.8428, 10.7657],
        [79.8, 10.2],
        [79.65, 9.6],
        [79.85, 9.2],
        [79.95, 8.98],
      ],
    },
  },
  {
    id: "vijayanagara-west-coast-trade",
    label: "West coast trade route (illustrative)",
    routeType: "trade",
    polityIds: ["vijayanagara"],
    validFrom: 1336,
    validTo: 1565,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Hand-drawn approximation." }],
    path: {
      type: "LineString",
      coordinates: [
        [76.46, 15.335],
        [75.6, 14.9],
        [74.7, 14.6],
        [74.12, 14.78],
      ],
    },
  },
];

const curatedEvents: HistoricalEvent[] = [
  {
    id: "rajaraja-conquests",
    slug: "rajaraja-conquests",
    title: "Rajaraja I's southern and Sri Lankan campaigns",
    period: { startYear: 985, endYear: 1014, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary:
      "Rajaraja I's armies conquer the Pandya and Kerala lands and northern Sri Lanka, and in 1004 defeat a Chalukya army in the Gangavadi region of the Deccan.",
    polityIds: ["chola"],
    placeIds: ["thanjavur"],
    provenance: [{ sourceId: "wikipedia-article-rajaraja-i", note: "Written here; the date and each statement were checked against this article." }],
  },
  {
    id: "gangaikondacholapuram-founding",
    slug: "gangaikondacholapuram-founding",
    title: "Founding of Gangaikonda Cholapuram",
    period: { startYear: 1025, endYear: null, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary:
      "Rajendra I founds a new Chola capital, c. 1025, to celebrate his victory in the north. The name means “the city of the Chola who took the Ganges”.",
    polityIds: ["chola"],
    placeIds: ["gangaikondacholapuram"],
    provenance: [{ sourceId: "wikipedia-article-gangaikonda-cholapuram", note: "Written here; the date and each statement were checked against this article." }],
  },
  {
    id: "talikota",
    slug: "talikota",
    title: "Battle of Talikota",
    period: { startYear: 1565, endYear: null, confidence: "probable", startQualifier: "exact", endQualifier: "exact" },
    summary:
      "An alliance of five Deccan sultanates defeats Vijayanagara's army on 23 January 1565. Hampi's royal centre is plundered and never rebuilt, and the rulers move south to Penukonda. Historians now doubt the older accounts that the whole city was destroyed.",
    polityIds: ["vijayanagara"],
    placeIds: ["hampi"],
    provenance: [{ sourceId: "wikipedia-article-battle-of-talikota", note: "Written here; the date and each statement were checked against this article." }],
  },
  {
    id: "kailasa-temple-construction",
    slug: "kailasa-temple-construction",
    title: "Construction of the Kailasa Temple at Ellora",
    period: { startYear: 756, endYear: 773, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary:
      "Under Krishna I, the Kailasa Temple at Ellora is cut downward out of a single rock face — one of the largest rock-cut buildings in the world.",
    polityIds: ["rashtrakuta"],
    placeIds: ["ellora"],
    provenance: [{ sourceId: "wikipedia-article-kailasa-temple-ellora", note: "Written here; the date and each statement were checked against this article." }],
  },
  {
    id: "chennakeshava-temple-consecration",
    slug: "chennakeshava-temple-consecration",
    title: "The Chennakeshava Temple at Belur is dedicated",
    period: { startYear: 1117, endYear: null, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary:
      "Vishnuvardhana commissions the Chennakeshava Temple at Belur, dedicated to Vishnu, in 1117.",
    polityIds: ["hoysala"],
    placeIds: ["belur"],
    provenance: [{ sourceId: "wikipedia-article-chennakeshava-temple-belur", note: "Written here; the date and each statement were checked against this article." }],
  },
  {
    id: "rajaraja-anuradhapura",
    slug: "rajaraja-anuradhapura",
    title: "Rajaraja I takes Anuradhapura",
    period: { startYear: 993, endYear: null, startQualifier: "circa", endQualifier: "circa", confidence: "probable" },
    summary:
      "Chola forces take the old Sri Lankan capital (Wikipedia's articles give 992 or 993). The Cholas hold the north of the island until Vijayabahu I drives them out in 1070.",
    polityIds: ["chola"],
    placeIds: ["anuradhapura"],
    provenance: [{ sourceId: "wikipedia-article-rajaraja-i", note: "Written here; the date and each statement were checked against this article." }, { sourceId: "wikipedia-article-vijayabahu-i", note: "Written here; the date and each statement were checked against this article." }],
  },
  {
    id: "kannauj-taken",
    slug: "kannauj-taken",
    title: "Nagabhata II takes Kannauj",
    period: { startYear: 816, endYear: null, startQualifier: "circa", endQualifier: "circa", confidence: "probable" },
    summary:
      "The Pratihara king Nagabhata II defeats Chakrayudha and proclaims himself king of Kannauj. The Pratiharas, Palas and Rashtrakutas had been fighting over the throne of Kannauj since 785.",
    polityIds: ["pratihara", "pala", "rashtrakuta"],
    placeIds: ["kannauj"],
    provenance: [{ sourceId: "wikipedia-article-tripartite-struggle", note: "Written here; the date and each statement were checked against this article." }],
  },
  {
    id: "delhi-sultanate-founded",
    slug: "delhi-sultanate-founded",
    title: "Aibak becomes the first Sultan of Delhi",
    period: { startYear: 1206, endYear: null, startQualifier: "exact", endQualifier: "circa", confidence: "probable" },
    summary:
      "After Muhammad of Ghor is assassinated in 1206, his general Qutb ud-Din Aibak takes power on 25 June and rules independently from Lahore. Formal recognition came in 1208–09. This is counted as the start of the Delhi Sultanate.",
    polityIds: ["delhi-sultanate"],
    placeIds: ["delhi"],
    provenance: [{ sourceId: "wikipedia-article-qutb-al-din-aibak", note: "Written here; the date and each statement were checked against this article." }],
  },
  {
    id: "bahmani-founded",
    slug: "bahmani-founded",
    title: "Founding of the Bahmani Sultanate",
    period: { startYear: 1347, endYear: null, startQualifier: "exact", endQualifier: "circa", confidence: "probable" },
    summary:
      "Deccan nobles in rebellion crown Alauddin Hasan Bahman Shah at Gulbarga (Hasanabad) on 3 August 1347, founding the first independent Muslim sultanate of the Deccan.",
    polityIds: ["bahmani"],
    placeIds: ["gulbarga"],
    provenance: [{ sourceId: "wikipedia-article-bahmani-sultanate", note: "Written here; the date and each statement were checked against this article." }],
  },
];

/** First two sentences of a Wikipedia lead, kept short. */
function shortSummary(text: string | null): string {
  if (!text) return "";
  const cleaned = text.replace(/\s*\([^)]*\)/g, "").replace(/\[\d+\]/g, "");
  const sentences = cleaned.split(/(?<=[.!?])\s+(?=[A-Z])/);
  let out = "";
  for (const s of sentences) {
    if (out && out.length + s.length > 320) break;
    out += (out ? " " : "") + s;
  }
  return out;
}

const polityNameById = new Map(polities.map((p) => [p.id, p.name]));

/**
 * Battles imported from Wikidata (dates, places) and Wikipedia (summaries).
 * Wikidata rarely records who fought, so each battle is linked to the
 * kingdoms whose Cliopatria borders contained the site in that year, and the
 * summary says so rather than implying they were the combatants.
 */
const battleEvents: HistoricalEvent[] = importedBattles.map((b) => {
  const names = b.polityIds.map((id) => polityNameById.get(id)).filter((n): n is string => Boolean(n));
  const where = names.length
    ? `The site lay within the borders of ${names.join(" and ")} that year (per Cliopatria).`
    : "The site lay outside every kingdom mapped in the atlas that year.";
  return {
    id: b.id,
    slug: b.id,
    title: b.name,
    period: { startYear: b.year, endYear: null, startQualifier: "exact", endQualifier: "exact", confidence: "probable" },
    summary: [shortSummary(b.extract), where].filter(Boolean).join(" "),
    polityIds: b.polityIds,
    placeIds: [],
    category: "battle",
    location: b.location as [number, number],
    provenance: [
      { sourceId: "wikidata", note: "Date and place." },
      ...(b.wikipedia ? [{ sourceId: `wikipedia-battle-${b.wikidata}`, note: "Summary." }] : []),
      { sourceId: "cliopatria", note: "Which kingdom's borders contained the site." },
    ],
  };
});

export const events: HistoricalEvent[] = [...curatedEvents, ...battleEvents];
/** Hand-picked turning points: what playback pauses on and the timeline marks. */
export const milestones: HistoricalEvent[] = events.filter((e) => e.category !== "battle");
export const battles: HistoricalEvent[] = events.filter((e) => e.category === "battle");

/**
 * The photograph here is a real, credited 10th-century Tamil temple
 * inscription (see lib/data/images.ts). The claim/interpretation text
 * below is explicitly illustrative demo content for the claim → evidence
 * → interpretation → uncertainty UI pattern — it is NOT a transcription
 * or scholarly reading of the pictured stone. Flagged via
 * `imageIsIllustrative`/`claimIsIllustrative` rather than asserted as
 * fact, per the module-level policy note above.
 */
export const evidence: Evidence[] = [
  {
    id: "sii-ii-85",
    slug: "sii-ii-85",
    title: "Rajaraja I's inventory of temple images at Thanjavur",
    evidenceType: "inscription",
    period: { startYear: 1014, endYear: null, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    material: "Stone (pillar of the west enclosure)",
    script: "Tamil",
    language: "Tamil",
    placeId: "thanjavur",
    catalogueId: "SII vol. II, no. 85",
    imageKey: "evidence-stone-inscription",
    imageIsIllustrative: true,
    textIsIllustrative: false,
    transcription: [],
    transliteration: [],
    translation: [
      "Hail! Prosperity! The (following) copper images which the lord Sri-Rajarajadeva had set up until the twenty-ninth year (of his reign) in the temple of the lord Sri-Rajarajesvara-mudaiyar were measured by the cubit measure (preserved) in the temple of the lord and engraved (i.e. recorded) on stone:",
      "2. One solid image of Pillaiyar Ganapatiyar in the dancing posture, with four divine arms, (and measuring) fourteen viral in height from the feet to the hair.",
      "6. One solid image of Pillaiyar Ganapatiyar, in the standing posture, with four divine arms, (and measuring) fifteen viral in height from the feet to the hair.",
      "10. One solid image of Pillaiyar Ganapatiyar, comfortably seated, with four divine arms, (and measuring) nine viral in height from the feet to the hair.",
    ],
    lineRegions: [],
    claim:
      "By the 29th year of his reign, Rajaraja I had installed a large set of copper images in the Thanjavur temple — several of Ganapati among them — and had them measured and recorded on its walls.",
    claimIsIllustrative: false,
    interpretation:
      "The inscription says the images were measured against the cubit rule kept in the temple, then cut in stone. That makes it an official inventory of the temple's treasure. The length units (viral and others) are the editors' transliterations of Tamil measures.",
    uncertainty: { dating: "medium", interpretation: "high", geographic: "high" },
    sourceIds: ["sii-vol-2"],
    polityIds: ["chola"],
    provenance: [
      { sourceId: "sii-vol-2", note: "No. 85, printed pp. 406-407: introduction and items 2, 6 and 10 of the translation." },
    ],
  },
  {
    id: "sii-ii-88",
    slug: "sii-ii-88",
    title: "A bell-metal dish for the Ganapati shrine, given by a tax official",
    evidenceType: "inscription",
    period: { startYear: 1014, endYear: null, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    material: "Stone (pillar of the west enclosure)",
    script: "Tamil",
    language: "Tamil",
    placeId: "thanjavur",
    catalogueId: "SII vol. II, no. 88",
    imageKey: "evidence-stone-inscription",
    imageIsIllustrative: true,
    textIsIllustrative: false,
    transcription: [],
    transliteration: [],
    translation: [
      "Hail! Prosperity! One bell-metal dish (taligai), weighing twenty-nine palam, was presented, until the twenty-ninth year (of the reign) of the lord Sri-Rajarajadeva, to (the shrine of) Pillaiyar Ganapatiyar in the parivaralaya of the temple of the lord Sri-Rajarajesvaramudaiyar by Kanjan Kondaiyan, a native of Kamadamangalam in Purakkiliyur-nadu, (a subdivision) of Pandyakulasani-valanadu, a servant (panimagan) of the lord Sri-Rajarajadeva and the master of the rent roll in the department (tinaikkalam) of taxes (levied from) endowments.",
    ],
    lineRegions: [],
    claim:
      "By the 29th year of Rajaraja I's reign, a servant of the king named Kanjan Kondaiyan, from Kamadamangalam, had given a bell-metal dish weighing 29 palam to the Ganapati shrine in the Thanjavur temple, and the gift was recorded on a pillar.",
    claimIsIllustrative: false,
    interpretation:
      "Gifts to the temple were cut in stone beside the shrine they went to, with the donor's name, home village and post. This donor is called a servant of the king and master of the rent roll in the department of taxes on endowments. The editors say he was \"apparently\" employed in the department that regulated those taxes, so the job is their reading of the text. The palam is a unit of weight.",
    uncertainty: { dating: "medium", interpretation: "medium", geographic: "high" },
    sourceIds: ["sii-vol-2"],
    polityIds: ["chola"],
    provenance: [
      { sourceId: "sii-vol-2", note: "No. 88, printed p. 412: the editors' introduction and the whole translation, read from the scan." },
    ],
  },
];

export function getPolityBySlug(slug: string): Polity | undefined {
  return polities.find((p) => p.slug === slug);
}

export function getPersonBySlug(slug: string): Person | undefined {
  return people.find((p) => p.slug === slug);
}

export function getEvidenceBySlug(slug: string): Evidence | undefined {
  return evidence.find((e) => e.slug === slug);
}

export function getSourceById(id: string): Source | undefined {
  return sources.find((s) => s.id === id);
}

export function getBoundariesForPolity(polityId: string): HistoricalBoundary[] {
  return boundaries.filter((b) => b.polityId === polityId);
}

export function getRulersForPolity(polityId: string): Person[] {
  return people.filter((p) => p.polityId === polityId);
}

export function getPlaceById(id: string): Place | undefined {
  return places.find((p) => p.id === id);
}
