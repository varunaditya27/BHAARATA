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
  title: "BHĀRATA UI prototype placeholder",
  sourceType: "digital",
  citation:
    "Illustrative placeholder authored for frontend development. Not a scholarly source.",
};

export const sources: Source[] = [
  PROTOTYPE_SOURCE,
  {
    id: "sii-vol-3",
    title: "South Indian Inscriptions, Vol. III",
    sourceType: "epigraphic",
    citation:
      "Archaeological Survey of India, South Indian Inscriptions, Volume III: Miscellaneous Inscriptions from the Tamil Country.",
  },
  {
    id: "nilakanta-sastri-cholas",
    title: "The Cōḻas",
    sourceType: "bibliographic",
    citation: "K. A. Nilakanta Sastri, The Cōḻas, University of Madras, 1955.",
  },
];

export const polities: Polity[] = [
  {
    id: "chola",
    slug: "chola",
    name: "Chola",
    nativeName: "சோழர்",
    alternativeNames: ["Cholas", "Chola dynasty"],
    polityType: "Empire",
    region: "Southern India",
    language: "Tamil",
    religion: "Shaivism, Vaishnavism",
    notableFor: "Naval power, temple architecture, decentralised local government",
    quote: "An empire built on rivers, temples, and a fleet that reached across the sea.",
    period: {
      startYear: 850,
      endYear: 1279,
      startQualifier: "circa",
      endQualifier: "circa",
      confidence: "probable",
    },
    capitals: ["Thanjavur", "Gangaikonda Cholapuram"],
    summary:
      "A major polity of southern India, known for its expansive administration, naval power, and monumental temple architecture. At its height under Rajaraja I and Rajendra I, Chola influence extended across the Bay of Bengal.",
    accentColor: "#96341a",
    heroImageKey: "chola-brihadisvara",
    rulerIds: ["rajaraja-i", "rajendra-i"],
    provenance: [{ sourceId: "nilakanta-sastri-cholas", note: "General historical framing." }],
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
    religion: "Shaivism, Vaishnavism, Jainism",
    notableFor: "The 13th-century imperial revival, maritime trade through Madurai",
    quote: "A dynasty that outlasted its neighbours, and then eclipsed them.",
    period: {
      startYear: 1190,
      endYear: 1345,
      startQualifier: "circa",
      endQualifier: "circa",
      confidence: "probable",
    },
    capitals: ["Madurai"],
    summary:
      "A long-lived southern dynasty centred on Madurai, prominent during the 13th-century imperial revival associated with Jatavarman Sundara Pandyan I, which briefly eclipsed the late Cholas.",
    accentColor: "#3a5a78",
    heroImageKey: "pandya-meenakshi",
    rulerIds: ["jatavarman-sundara-pandyan-i"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder record." }],
  },
  {
    id: "vijayanagara",
    slug: "vijayanagara",
    name: "Vijayanagara",
    nativeName: "విజయనగర",
    alternativeNames: ["Vijayanagara Empire"],
    polityType: "Empire",
    region: "Deccan / Southern India",
    language: "Kannada, Telugu, Sanskrit",
    religion: "Vaishnavism, Shaivism",
    notableFor: "Urban scale, Indian Ocean trade, patronage of temple architecture",
    quote: "A cosmopolitan empire built where the Deccan meets the Tamil country.",
    period: {
      startYear: 1336,
      endYear: 1646,
      startQualifier: "circa",
      endQualifier: "circa",
      confidence: "probable",
    },
    capitals: ["Hampi"],
    summary:
      "A Deccan empire centred on the fortified capital of Vijayanagara (Hampi), reaching its height under Krishnadevaraya in the early 16th century, before its capital was sacked after the Battle of Talikota in 1565.",
    accentColor: "#8a6d1f",
    heroImageKey: "vijayanagara-virupaksha",
    rulerIds: ["krishnadevaraya"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder record." }],
  },
  {
    id: "chera",
    slug: "chera",
    name: "Chera",
    nativeName: "சேரர்",
    alternativeNames: ["Cheras", "Chera Perumals"],
    polityType: "Kingdom",
    region: "Southern India",
    language: "Malayalam, Tamil",
    religion: "Hinduism, with early Christian, Jewish, and Muslim trading communities",
    notableFor: "Control of the Malabar spice trade with Rome, West Asia, and China",
    quote: "A coastline kingdom that traded with the world before it was called that.",
    period: {
      startYear: 800,
      endYear: 1124,
      startQualifier: "circa",
      endQualifier: "circa",
      confidence: "probable",
    },
    capitals: ["Kodungallur"],
    summary:
      "A dynasty of the Malabar coast whose wealth rested on the spice trade — pepper, cardamom, and timber moved through its ports to Rome, Persia, and China. Later Chera rule is often called the Chera Perumal period.",
    accentColor: "#2f6b5e",
    heroImageKey: "chera-vadakkunnathan",
    rulerIds: ["rajashekhara-varman"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder record." }],
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
    notableFor: "The rock-cut Kailasa Temple at Ellora, Deccan-wide imperial reach",
    quote: "An empire that carved a temple from a single mountain and called it finished.",
    period: {
      startYear: 753,
      endYear: 982,
      startQualifier: "circa",
      endQualifier: "circa",
      confidence: "probable",
    },
    capitals: ["Manyakheta"],
    summary:
      "A Deccan empire that displaced the Chalukyas and, under Krishna I, commissioned the monolithic Kailasa Temple at Ellora — carved downward from a single rock outcrop rather than built up from a foundation.",
    accentColor: "#5c3a6e",
    heroImageKey: "rashtrakuta-kailasa",
    rulerIds: ["amoghavarsha-i"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder record." }],
  },
  {
    id: "chalukya-kalyani",
    slug: "chalukya-kalyani",
    name: "Chalukya (Kalyani)",
    nativeName: "ಕಲ್ಯಾಣಿ ಚಾಲುಕ್ಯ",
    alternativeNames: ["Western Chalukyas", "Later Chalukyas"],
    polityType: "Empire",
    region: "Deccan",
    language: "Kannada, Sanskrit",
    religion: "Hinduism, Jainism",
    notableFor: "Temple architecture at Lakkundi and Itagi, the Vikrama Era calendar",
    quote: "A Deccan power that measured time in its own name — the Vikrama Era.",
    period: {
      startYear: 973,
      endYear: 1189,
      startQualifier: "circa",
      endQualifier: "circa",
      confidence: "probable",
    },
    capitals: ["Basavakalyan"],
    summary:
      "Revived Chalukya rule in the Deccan after overthrowing the Rashtrakutas, reaching its height under Vikramaditya VI, who introduced the Vikrama Era calendar still referenced in parts of Karnataka today.",
    accentColor: "#b06b2c",
    heroImageKey: "chalukya-itagi",
    rulerIds: ["vikramaditya-vi"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder record." }],
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
    notableFor: "Soapstone temple architecture at Belur and Halebidu",
    quote: "A kingdom remembered less for its armies than for what its sculptors could do to stone.",
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
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder record." }],
  },
];

export const people: Person[] = [
  {
    id: "rajaraja-i",
    slug: "rajaraja-i",
    name: "Rajaraja I",
    nativeName: "இராஜராஜ சோழன்",
    role: "Chola emperor",
    polityId: "chola",
    period: { startYear: 985, endYear: 1014, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary:
      "Commissioned the Brihadisvara Temple at Thanjavur and expanded Chola naval reach into Sri Lanka and the Maldives.",
    imageKey: "ruler-rajaraja-mural",
    provenance: [{ sourceId: "nilakanta-sastri-cholas" }],
  },
  {
    id: "rajendra-i",
    slug: "rajendra-i",
    name: "Rajendra I",
    nativeName: "இராஜேந்திர சோழன்",
    role: "Chola emperor",
    polityId: "chola",
    period: { startYear: 1014, endYear: 1044, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary:
      "Founded the new capital of Gangaikonda Cholapuram and led campaigns traditionally associated with a northern expedition to the Ganges.",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "jatavarman-sundara-pandyan-i",
    slug: "jatavarman-sundara-pandyan-i",
    name: "Jatavarman Sundara Pandyan I",
    role: "Pandya emperor",
    polityId: "pandya",
    period: { startYear: 1251, endYear: 1268, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary: "Presided over the Pandya dynasty's 13th-century resurgence at the expense of the late Cholas.",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
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
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "rajashekhara-varman",
    slug: "rajashekhara-varman",
    name: "Rajashekhara Varman",
    role: "Chera Perumal",
    polityId: "chera",
    period: { startYear: 820, endYear: 844, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary: "An early Chera Perumal ruler, traditionally associated with the Kollam Era calendar's founding.",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "amoghavarsha-i",
    slug: "amoghavarsha-i",
    name: "Amoghavarsha I",
    role: "Rashtrakuta emperor",
    polityId: "rashtrakuta",
    period: { startYear: 814, endYear: 878, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary: "A long-reigning Rashtrakuta emperor and patron of letters, traditionally credited as author of the Kavirajamarga, an early Kannada work on poetics.",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "vikramaditya-vi",
    slug: "vikramaditya-vi",
    name: "Vikramaditya VI",
    role: "Chalukya emperor",
    polityId: "chalukya-kalyani",
    period: { startYear: 1076, endYear: 1126, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary: "The best-known Kalyani Chalukya ruler; his reign was long enough that the Vikrama Era calendar was dated from his accession.",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "vishnuvardhana",
    slug: "vishnuvardhana",
    name: "Vishnuvardhana",
    role: "Hoysala king",
    polityId: "hoysala",
    period: { startYear: 1108, endYear: 1152, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary: "Commissioned the Chennakeshava Temple at Belur, traditionally linked to a military victory over the Western Chalukyas.",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
];

export const places: Place[] = [
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
];

/**
 * Each polygon is the real union of modern Indian districts that roughly
 * cover a kingdom's historical heartland (Tamil Nadu districts for Chola/
 * Pandya; Karnataka + Rayalaseema Andhra Pradesh districts for
 * Vijayanagara), simplified for rendering. That gives an accurate real
 * coastline instead of a hand-drawn shape — but it is still NOT a
 * reconstructed historical frontier: modern district lines did not exist
 * in the 10th–16th centuries, and a kingdom's real extent changed
 * constantly within its reign. See the module-level notice above.
 */
export const boundaries: HistoricalBoundary[] = [
  {
    polityId: "chola",
    validFrom: 850,
    validTo: 1279,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier." }],
    geometry: boundaryGeometry("chola-850"),
  },
  {
    polityId: "pandya",
    validFrom: 1190,
    validTo: 1345,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier." }],
    geometry: boundaryGeometry("pandya-1190"),
  },
  {
    polityId: "vijayanagara",
    validFrom: 1336,
    validTo: 1646,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier." }],
    geometry: boundaryGeometry("vijayanagara-1336"),
  },
  {
    polityId: "chera",
    validFrom: 800,
    validTo: 1124,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern Kerala districts over the historical heartland — not a reconstructed frontier." }],
    geometry: boundaryGeometry("chera-800"),
  },
  {
    polityId: "rashtrakuta",
    validFrom: 753,
    validTo: 982,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern Karnataka and western Maharashtra districts over the historical heartland — not a reconstructed frontier." }],
    geometry: boundaryGeometry("rashtrakuta-753"),
  },
  {
    polityId: "chalukya-kalyani",
    validFrom: 973,
    validTo: 1189,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern Karnataka and western Maharashtra districts over the historical heartland — not a reconstructed frontier." }],
    geometry: boundaryGeometry("chalukya-kalyani-973"),
  },
  {
    polityId: "hoysala",
    validFrom: 1026,
    validTo: 1343,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern southern Karnataka districts over the historical heartland — not a reconstructed frontier." }],
    geometry: boundaryGeometry("hoysala-1026"),
  },
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

export const events: HistoricalEvent[] = [
  {
    id: "rajaraja-conquests",
    slug: "rajaraja-conquests",
    title: "Rajaraja I's southern and Sri Lankan campaigns",
    period: { startYear: 985, endYear: 1014, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary:
      "A period of Chola military expansion under Rajaraja I, traditionally associated with campaigns into Sri Lanka and the Deccan.",
    polityIds: ["chola"],
    placeIds: ["thanjavur"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "gangaikondacholapuram-founding",
    slug: "gangaikondacholapuram-founding",
    title: "Founding of Gangaikonda Cholapuram",
    period: { startYear: 1025, endYear: null, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary:
      "Rajendra I establishes a new Chola capital, traditionally linked to a northern expedition reaching the Ganges.",
    polityIds: ["chola"],
    placeIds: ["gangaikondacholapuram"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "talikota",
    slug: "talikota",
    title: "Battle of Talikota",
    period: { startYear: 1565, endYear: null, confidence: "probable", startQualifier: "exact", endQualifier: "exact" },
    summary:
      "A decisive battle traditionally dated to 1565, after which Vijayanagara's capital was sacked and imperial power receded from the Tungabhadra region.",
    polityIds: ["vijayanagara"],
    placeIds: ["hampi"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "kailasa-temple-construction",
    slug: "kailasa-temple-construction",
    title: "Construction of the Kailasa Temple at Ellora",
    period: { startYear: 756, endYear: 773, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary:
      "Under Krishna I, the Kailasa Temple at Ellora was carved downward from a single basalt outcrop — traditionally regarded as one of the largest rock-cut structures in the world.",
    polityIds: ["rashtrakuta"],
    placeIds: ["ellora"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "chennakeshava-temple-consecration",
    slug: "chennakeshava-temple-consecration",
    title: "Consecration of the Chennakeshava Temple, Belur",
    period: { startYear: 1117, endYear: null, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary:
      "Vishnuvardhana consecrated the Chennakeshava Temple at Belur, traditionally linked to a Hoysala military victory over the Western Chalukyas.",
    polityIds: ["hoysala"],
    placeIds: ["belur"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
];

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
    id: "inscription-014",
    slug: "inscription-014",
    title: "Temple inscription record (illustrative example)",
    evidenceType: "inscription",
    period: { startYear: 985, endYear: 1014, confidence: "illustrative", startQualifier: "circa", endQualifier: "circa" },
    material: "Stone (temple wall)",
    script: "Tamil",
    language: "Tamil",
    placeId: "thanjavur",
    catalogueId: "ILLUSTRATIVE-001",
    condition: "Partial, weathered",
    imageKey: "evidence-stone-inscription",
    imageIsIllustrative: true,
    transcription: [
      "ஸ்வஸ்தி ஸ்ரீ [illustrative placeholder line] …",
      "இராஜராஜ தேவர் [illustrative placeholder line] …",
      "தஞ்சாவூர் பெருவுடையார் கோயில் [illustrative placeholder line] …",
    ],
    translation: [
      "Hail, prosperity. [Illustrative placeholder translation line.]",
      "In the reign of the glorious Rajaraja. [Illustrative placeholder line.]",
      "At the great temple of Thanjavur. [Illustrative placeholder line.]",
    ],
    lineRegions: [
      { x: 0.06, y: 0.12, w: 0.88, h: 0.22 },
      { x: 0.06, y: 0.4, w: 0.88, h: 0.22 },
      { x: 0.06, y: 0.68, w: 0.88, h: 0.22 },
    ],
    claim: "This record demonstrates how a claim traces to a specific inscription line and its source.",
    claimIsIllustrative: true,
    interpretation:
      "This is a worked example of BHĀRATA's evidence model, not a scholarly reading of the pictured inscription.",
    uncertainty: { dating: "medium", interpretation: "medium", geographic: "high" },
    sourceIds: ["sii-vol-3"],
    polityIds: ["chola"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative claim/evidence worked example." }],
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
