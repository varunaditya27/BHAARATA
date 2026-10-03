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
  title: "No published source yet",
  sourceType: "digital",
  citation:
    "Written as a placeholder for this early version of the site. It does not come from a published source.",
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
    notableFor: "Its navy, its great temples, and well-organised village government",
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
      "A Tamil dynasty from the Kaveri delta. Under Rajaraja I and his son Rajendra I it ruled most of southern India and northern Sri Lanka, and its fleets crossed the Bay of Bengal. It is remembered for its great temples and its well-organised village government.",
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
    notableFor: "Its return to power in the 1250s, and sea trade through its ports",
    quote: "The kings of Madurai, who came back to rule the far south in the 1200s.",
    period: {
      startYear: 1190,
      endYear: 1345,
      startQualifier: "circa",
      endQualifier: "circa",
      confidence: "probable",
    },
    capitals: ["Madurai"],
    summary:
      "One of the oldest Tamil dynasties, ruling from Madurai. In the 1250s, under Jatavarman Sundara Pandyan I, it overtook the weakened Cholas and became the strongest power in the far south, until the Delhi Sultanate's raids of 1311.",
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
    notableFor: "The Malabar spice trade with West Asia and China",
    quote: "Kings of the Kerala coast, rich from the pepper and spice trade.",
    period: {
      startYear: 800,
      endYear: 1124,
      startQualifier: "circa",
      endQualifier: "circa",
      confidence: "probable",
    },
    capitals: ["Kodungallur"],
    summary:
      "Kings of the Kerala coast, known in this period as the Chera Perumals, who ruled from Kodungallur. Their ports shipped pepper and other spices to West Asia and China, and drew Jewish, Christian and Muslim merchant communities.",
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
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder record." }],
  },
  {
    id: "pala",
    slug: "pala",
    name: "Pala",
    nativeName: "पाल",
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
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder record." }],
  },
  {
    id: "pratihara",
    slug: "pratihara",
    name: "Gurjara-Pratihara",
    nativeName: "प्रतिहार",
    alternativeNames: ["Pratiharas", "Imperial Pratiharas"],
    polityType: "Empire",
    region: "Northern and western India",
    language: "Sanskrit",
    religion: "Vaishnavism, Shaivism",
    notableFor: "Ruling northern India from Kannauj, and holding back Arab armies from Sindh",
    quote: "Rulers of northern India from Kannauj for about two centuries.",
    period: { startYear: 730, endYear: 1036, startQualifier: "circa", endQualifier: "circa", confidence: "probable" },
    capitals: ["Kannauj"],
    summary:
      "A dynasty that rose in Malwa and Rajasthan in the 8th century and, from about 816, ruled from Kannauj. At its height under Mihira Bhoja it stretched across much of northern India, before shrinking back to the Kannauj region in the 10th century.",
    accentColor: "#3f4f86",
    heroImageKey: "pratihara-bateshwar",
    rulerIds: ["mihira-bhoja"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder record." }],
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
    quote: "Five dynasties of sultans, one after another, all ruling from Delhi.",
    period: { startYear: 1206, endYear: 1526, startQualifier: "exact", endQualifier: "exact", confidence: "probable" },
    capitals: ["Delhi"],
    summary:
      "The state that began in 1206, when Qutb ud-Din Aibak, a general of Muhammad of Ghor, became ruler of his master's conquests in India. Five dynasties followed one another on its throne; under the Khaljis and Tughlaqs its armies reached far into the south, before it shrank back to the north and ended at Panipat in 1526.",
    accentColor: "#2f5d3a",
    heroImageKey: "delhi-qutb",
    rulerIds: ["iltutmish"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder record." }],
  },
  {
    id: "bahmani",
    slug: "bahmani",
    name: "Bahmani",
    nativeName: "سلطنت بهمنی",
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
      "Founded in 1347 when Deccan nobles revolted against Delhi and made Alauddin Hasan Bahman Shah their king at Gulbarga. The capital later moved to Bidar; by the end of the 15th century the sultanate had broken up into five successor states.",
    accentColor: "#1f7083",
    heroImageKey: "bahmani-gawan",
    rulerIds: ["alauddin-hasan-bahman-shah"],
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
      "Built the Brihadisvara Temple at Thanjavur. His armies and fleets took northern Sri Lanka and the Maldives.",
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
      "Built the new capital of Gangaikonda Cholapuram, named after his army's expedition to the Ganges, and sent a fleet against Srivijaya in Southeast Asia.",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "jatavarman-sundara-pandyan-i",
    slug: "jatavarman-sundara-pandyan-i",
    name: "Jatavarman Sundara Pandyan I",
    role: "Pandya emperor",
    polityId: "pandya",
    period: { startYear: 1251, endYear: 1268, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary: "Led the Pandya return to power in the 1250s, taking over most of the weakened Chola kingdom.",
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
    summary: "One of the first Chera Perumal kings. The Kollam era, the calendar still used in Kerala, is traditionally said to start in his reign, in 825.",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "amoghavarsha-i",
    slug: "amoghavarsha-i",
    name: "Amoghavarsha I",
    role: "Rashtrakuta emperor",
    polityId: "rashtrakuta",
    period: { startYear: 814, endYear: 878, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary: "A Rashtrakuta emperor who reigned for over sixty years. The Kavirajamarga, the oldest surviving book on Kannada poetry, is credited to him or to a poet at his court.",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "vikramaditya-vi",
    slug: "vikramaditya-vi",
    name: "Vikramaditya VI",
    role: "Chalukya emperor",
    polityId: "chalukya-kalyani",
    period: { startYear: 1076, endYear: 1126, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary: "The best-known Kalyani Chalukya king, who reigned for about fifty years. Inscriptions of the time counted the years from his accession in 1076.",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "vishnuvardhana",
    slug: "vishnuvardhana",
    name: "Vishnuvardhana",
    role: "Hoysala king",
    polityId: "hoysala",
    period: { startYear: 1108, endYear: 1152, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary: "Built the Chennakeshava Temple at Belur — by the usual account, to mark his victory over the Cholas at Talakad in 1116.",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "dharmapala",
    slug: "dharmapala",
    name: "Dharmapala",
    nativeName: "धर्मपाल",
    role: "Pala emperor",
    polityId: "pala",
    period: { startYear: 770, endYear: 810, startQualifier: "circa", endQualifier: "circa", confidence: "probable" },
    summary:
      "Extended Pala rule from Bengal across Bihar and fought the Pratiharas and Rashtrakutas over Kannauj. Remembered as the founder of the monastery at Vikramashila.",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder record." }],
  },
  {
    id: "mihira-bhoja",
    slug: "mihira-bhoja",
    name: "Mihira Bhoja",
    nativeName: "मिहिर भोज",
    role: "Pratihara emperor",
    polityId: "pratihara",
    period: { startYear: 836, endYear: 885, startQualifier: "circa", endQualifier: "circa", confidence: "probable" },
    summary: "The longest-reigning Pratihara king, under whom the empire ruled from Kannauj reached its widest extent.",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder record." }],
  },
  {
    id: "iltutmish",
    slug: "iltutmish",
    name: "Iltutmish",
    role: "Sultan of Delhi",
    polityId: "delhi-sultanate",
    period: { startYear: 1211, endYear: 1236, startQualifier: "exact", endQualifier: "exact", confidence: "probable" },
    summary: "Held the young Sultanate together after Aibak's death, made Delhi its capital, and completed the Qutb Minar.",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder record." }],
  },
  {
    id: "alauddin-hasan-bahman-shah",
    slug: "alauddin-hasan-bahman-shah",
    name: "Alauddin Hasan Bahman Shah",
    role: "Founder of the Bahmani Sultanate",
    polityId: "bahmani",
    period: { startYear: 1347, endYear: 1358, startQualifier: "exact", endQualifier: "exact", confidence: "probable" },
    summary: "Led the revolt of the Deccan nobles against Delhi and was crowned at Gulbarga in 1347.",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder record." }],
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

/**
 * Each polygon is the real union of modern districts that roughly cover a
 * kingdom's territory in that period — Indian districts, plus Natural
 * Earth's districts and divisions for Sri Lanka, Bangladesh and Pakistan —
 * simplified for rendering (scripts/build-boundaries.py rebuilds them).
 * That gives real coastlines instead of hand-drawn shapes, and each kingdom
 * changes shape at a few well-known turning points (the Chola hold on
 * northern Sri Lanka, the Pandya revival, Talikota…). But these are still
 * NOT reconstructed historical frontiers: modern district lines did not
 * exist then, and real extents shifted constantly within each period. See
 * the module-level notice above.
 */
export const boundaries: HistoricalBoundary[] = [
  {
    polityId: "chola",
    validFrom: 850,
    validTo: 984,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. Kaveri delta core." }],
    geometry: boundaryGeometry("chola-850"),
  },
  {
    polityId: "chola",
    validFrom: 985,
    validTo: 992,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier." }],
    geometry: boundaryGeometry("chola-985"),
  },
  {
    polityId: "chola",
    validFrom: 993,
    validTo: 1070,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. Includes northern Sri Lanka, held from Rajaraja I's conquest of Anuradhapura until about 1070." }],
    geometry: boundaryGeometry("chola-993"),
  },
  {
    polityId: "chola",
    validFrom: 1071,
    validTo: 1250,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier." }],
    geometry: boundaryGeometry("chola-1071"),
  },
  {
    polityId: "chola",
    validFrom: 1251,
    validTo: 1279,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. Reduced to the delta in the dynasty's last decades." }],
    geometry: boundaryGeometry("chola-1251"),
  },
  {
    polityId: "pandya",
    validFrom: 1190,
    validTo: 1250,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier." }],
    geometry: boundaryGeometry("pandya-1190"),
  },
  {
    polityId: "pandya",
    validFrom: 1251,
    validTo: 1310,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. The 13th-century revival, north to Kanchipuram." }],
    geometry: boundaryGeometry("pandya-1251"),
  },
  {
    polityId: "pandya",
    validFrom: 1311,
    validTo: 1345,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. After the Delhi Sultanate's raids of 1311." }],
    geometry: boundaryGeometry("pandya-1311"),
  },
  {
    polityId: "vijayanagara",
    validFrom: 1336,
    validTo: 1565,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. Without the Bahmani heartland around Gulbarga and Bidar; the Raichur doab was long contested." }],
    geometry: boundaryGeometry("vijayanagara-1336"),
  },
  {
    polityId: "vijayanagara",
    validFrom: 1566,
    validTo: 1646,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. After Talikota: ruled from Penukonda, Chandragiri and Vellore." }],
    geometry: boundaryGeometry("vijayanagara-1566"),
  },
  {
    polityId: "chera",
    validFrom: 800,
    validTo: 1124,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier." }],
    geometry: boundaryGeometry("chera-800"),
  },
  {
    polityId: "rashtrakuta",
    validFrom: 753,
    validTo: 982,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier." }],
    geometry: boundaryGeometry("rashtrakuta-753"),
  },
  {
    polityId: "chalukya-kalyani",
    validFrom: 973,
    validTo: 1189,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier." }],
    geometry: boundaryGeometry("chalukya-kalyani-973"),
  },
  {
    polityId: "hoysala",
    validFrom: 1026,
    validTo: 1116,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. Hill-country core around Belur and Halebidu." }],
    geometry: boundaryGeometry("hoysala-1026"),
  },
  {
    polityId: "hoysala",
    validFrom: 1117,
    validTo: 1343,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier." }],
    geometry: boundaryGeometry("hoysala-1117"),
  },
  {
    polityId: "pala",
    validFrom: 750,
    validTo: 769,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. Northern Bengal." }],
    geometry: boundaryGeometry("pala-750"),
  },
  {
    polityId: "pala",
    validFrom: 770,
    validTo: 1161,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. Bengal and Bihar." }],
    geometry: boundaryGeometry("pala-770"),
  },
  {
    polityId: "pratihara",
    validFrom: 730,
    validTo: 815,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. Malwa and south-western Rajasthan." }],
    geometry: boundaryGeometry("pratihara-730"),
  },
  {
    polityId: "pratihara",
    validFrom: 816,
    validTo: 915,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. At its height, ruled from Kannauj." }],
    geometry: boundaryGeometry("pratihara-816"),
  },
  {
    polityId: "pratihara",
    validFrom: 916,
    validTo: 1036,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. Reduced to the Kannauj region." }],
    geometry: boundaryGeometry("pratihara-916"),
  },
  {
    polityId: "delhi-sultanate",
    validFrom: 1206,
    validTo: 1295,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. Punjab and the Ganga plain." }],
    geometry: boundaryGeometry("delhi-sultanate-1206"),
  },
  {
    polityId: "delhi-sultanate",
    validFrom: 1296,
    validTo: 1335,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. Khalji and Tughlaq expansion into central India and the Deccan." }],
    geometry: boundaryGeometry("delhi-sultanate-1296"),
  },
  {
    polityId: "delhi-sultanate",
    validFrom: 1336,
    validTo: 1526,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. Back to the north after the Deccan broke away." }],
    geometry: boundaryGeometry("delhi-sultanate-1336"),
  },
  {
    polityId: "bahmani",
    validFrom: 1347,
    validTo: 1489,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. The northern Deccan." }],
    geometry: boundaryGeometry("bahmani-1347"),
  },
  {
    polityId: "bahmani",
    validFrom: 1490,
    validTo: 1527,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier. The rump state around Bidar, as the successor sultanates broke away." }],
    geometry: boundaryGeometry("bahmani-1490"),
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
      "Rajaraja I's armies take over the Pandya and Chera lands and northern Sri Lanka, and fight the Chalukyas in the Deccan.",
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
      "Rajendra I builds a new Chola capital and names it after his army's expedition to the Ganges.",
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
      "An alliance of the Deccan sultanates defeats Vijayanagara's army. The capital at Hampi is then sacked and abandoned.",
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
      "Under Krishna I, the Kailasa Temple at Ellora is cut downward out of a single rock face — one of the largest rock-cut buildings in the world.",
    polityIds: ["rashtrakuta"],
    placeIds: ["ellora"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "chennakeshava-temple-consecration",
    slug: "chennakeshava-temple-consecration",
    title: "The Chennakeshava Temple at Belur is dedicated",
    period: { startYear: 1117, endYear: null, confidence: "probable", startQualifier: "circa", endQualifier: "circa" },
    summary:
      "Vishnuvardhana dedicates the Chennakeshava Temple at Belur — by the usual account, to mark his victory over the Cholas at Talakad.",
    polityIds: ["hoysala"],
    placeIds: ["belur"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Illustrative placeholder summary." }],
  },
  {
    id: "rajaraja-anuradhapura",
    slug: "rajaraja-anuradhapura",
    title: "Rajaraja I takes Anuradhapura",
    period: { startYear: 993, endYear: null, startQualifier: "circa", endQualifier: "circa", confidence: "probable" },
    summary:
      "Chola forces take the old Sri Lankan capital. The north of the island is ruled from Polonnaruwa as a Chola province until Vijayabahu I drives them out around 1070.",
    polityIds: ["chola"],
    placeIds: ["anuradhapura"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Placeholder summary of a widely reported event; not yet cited." }],
  },
  {
    id: "kannauj-taken",
    slug: "kannauj-taken",
    title: "Nagabhata II takes Kannauj",
    period: { startYear: 816, endYear: null, startQualifier: "circa", endQualifier: "circa", confidence: "probable" },
    summary:
      "The Pratihara king captures Kannauj, which becomes his dynasty's capital — and the prize the Pratiharas, Palas and Rashtrakutas fought over for a century.",
    polityIds: ["pratihara", "pala", "rashtrakuta"],
    placeIds: ["kannauj"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Placeholder summary of a widely reported event; not yet cited." }],
  },
  {
    id: "delhi-sultanate-founded",
    slug: "delhi-sultanate-founded",
    title: "Aibak becomes the first Sultan of Delhi",
    period: { startYear: 1206, endYear: null, startQualifier: "exact", endQualifier: "circa", confidence: "probable" },
    summary:
      "After the death of Muhammad of Ghor, his general Qutb ud-Din Aibak governs the Indian conquests as their own ruler — the start of the Delhi Sultanate.",
    polityIds: ["delhi-sultanate"],
    placeIds: ["delhi"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Placeholder summary of a widely reported event; not yet cited." }],
  },
  {
    id: "bahmani-founded",
    slug: "bahmani-founded",
    title: "Founding of the Bahmani Sultanate",
    period: { startYear: 1347, endYear: null, startQualifier: "exact", endQualifier: "circa", confidence: "probable" },
    summary:
      "Deccan nobles in revolt against Delhi crown Alauddin Hasan Bahman Shah at Gulbarga, founding the Deccan's first independent sultanate.",
    polityIds: ["bahmani"],
    placeIds: ["gulbarga"],
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Placeholder summary of a widely reported event; not yet cited." }],
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
    title: "Example: a Chola temple inscription",
    evidenceType: "inscription",
    period: { startYear: 985, endYear: 1014, confidence: "illustrative", startQualifier: "circa", endQualifier: "circa" },
    material: "Stone (temple wall)",
    script: "Tamil",
    language: "Tamil",
    placeId: "thanjavur",
    catalogueId: "EXAMPLE-001",
    condition: "Partial, weathered",
    imageKey: "evidence-stone-inscription",
    imageIsIllustrative: true,
    textIsIllustrative: true,
    transcription: [
      "ஸ்வஸ்தி ஸ்ரீ … [placeholder]",
      "இராஜராஜ தேவர் … [placeholder]",
      "தஞ்சாவூர் பெருவுடையார் கோயில் … [placeholder]",
    ],
    transliteration: [
      "svasti śrī … [placeholder]",
      "irājarāja tēvar … [placeholder]",
      "tañcāvūr peruvuṭaiyār kōyil … [placeholder]",
    ],
    translation: [
      "Hail! Prosperity! … [placeholder]",
      "In the reign of the glorious Rajaraja … [placeholder]",
      "At the great temple of Thanjavur … [placeholder]",
    ],
    lineRegions: [
      { x: 0.06, y: 0.12, w: 0.88, h: 0.22 },
      { x: 0.06, y: 0.4, w: 0.88, h: 0.22 },
      { x: 0.06, y: 0.68, w: 0.88, h: 0.22 },
    ],
    claim: "Example only: an inscription from Rajaraja I's reign that names the great temple at Thanjavur.",
    claimIsIllustrative: true,
    interpretation:
      "This page shows how a claim will be linked to the exact lines of an inscription, and to where its reading is published. The lines shown are placeholders, not a reading of the stone in the photo.",
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
