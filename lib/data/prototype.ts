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
    accentColor: "#46637a",
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
    geometry: {
      type: "Polygon",
      coordinates: [[[79.2271, 10.1362], [79.266, 10.0393], [79.0694, 9.8501], [78.9879, 9.9503], [79.0099, 9.9899], [78.9301, 10.0218], [78.9869, 10.0894], [78.9666, 10.1277], [78.8478, 10.1262], [78.8098, 10.2131], [78.6775, 10.1473], [78.6516, 10.2544], [78.5778, 10.2873], [78.4845, 10.1924], [78.4856, 10.2525], [78.4477, 10.2455], [78.5145, 10.2677], [78.5077, 10.389], [78.4474, 10.4091], [78.3332, 10.3005], [78.2771, 10.3833], [78.315, 10.4395], [78.2065, 10.4741], [78.1999, 10.5468], [78.1326, 10.5752], [78.176, 10.8352], [78.098, 10.767], [77.9392, 10.7685], [78.0151, 10.7197], [77.9777, 10.6399], [77.8306, 10.6329], [77.7887, 10.6853], [77.7205, 10.6313], [77.6954, 10.7354], [77.5428, 10.6098], [77.4177, 10.6256], [77.3855, 10.4494], [77.3235, 10.4482], [77.3497, 10.2644], [77.2882, 10.2323], [77.2353, 10.3529], [77.176, 10.3586], [76.9836, 10.2197], [76.9119, 10.2343], [76.8284, 10.3071], [76.8101, 10.6238], [76.8821, 10.639], [76.901, 10.8079], [76.6558, 10.9391], [76.7158, 11.0405], [76.7666, 11.0292], [76.8008, 11.054], [76.7465, 11.0568], [76.7481, 11.1355], [76.7002, 11.1536], [76.7345, 11.2181], [76.4386, 11.199], [76.5478, 11.359], [76.2472, 11.468], [76.2338, 11.5707], [76.3546, 11.5894], [76.5111, 11.7051], [76.5767, 11.6146], [76.8469, 11.5946], [76.908, 11.7954], [77.0129, 11.8147], [77.1177, 11.7212], [77.1107, 11.7736], [77.2498, 11.8131], [77.4272, 11.761], [77.4948, 11.944], [77.6757, 11.9521], [77.7755, 12.1185], [77.7277, 12.1816], [77.4927, 12.1974], [77.472, 12.2499], [77.6168, 12.3683], [77.5989, 12.6672], [77.7399, 12.673], [77.836, 12.8704], [77.9293, 12.891], [77.9186, 12.8306], [77.9523, 12.8572], [77.9952, 12.8059], [78.0535, 12.8538], [78.2309, 12.7607], [78.2106, 12.6861], [78.4649, 12.6241], [78.52, 12.7121], [78.4891, 12.742], [78.5558, 12.7002], [78.657, 12.9322], [78.6209, 12.9913], [78.7052, 13.0153], [78.7145, 13.0687], [78.8912, 13.0972], [78.8916, 13.0331], [78.9371, 13.0305], [78.9239, 13.0808], [78.995, 13.0866], [79.1631, 13.0203], [79.2349, 13.1709], [79.3072, 13.1056], [79.374, 13.1893], [79.4384, 13.1882], [79.4454, 13.3013], [79.3819, 13.3075], [79.4354, 13.3517], [79.5373, 13.3387], [79.5792, 13.2578], [79.6826, 13.2959], [79.7598, 13.2075], [79.7947, 13.2421], [79.7337, 13.2888], [79.938, 13.3555], [79.9724, 13.4691], [80.0466, 13.4937], [79.9997, 13.5423], [80.2418, 13.4707], [80.2688, 13.5653], [80.3458, 13.2847], [80.1502, 12.4365], [79.8498, 12.0518], [79.8406, 11.9558], [79.7502, 11.9199], [79.7464, 12.0077], [79.6916, 11.9514], [79.7406, 11.9055], [79.6738, 11.8917], [79.8081, 11.8453], [79.7123, 11.7916], [79.7958, 11.7855], [79.7572, 11.5575], [79.8431, 11.3512], [79.8544, 10.9833], [79.7471, 11.003], [79.7639, 10.9598], [79.7303, 10.9705], [79.7187, 10.956], [79.8285, 10.8838], [79.8527, 10.8269], [79.881, 10.3043], [79.7685, 10.2719], [79.3811, 10.3164], [79.2271, 10.1362]], [[79.6759, 11.8143], [79.6813, 11.7963], [79.6905, 11.8085], [79.6759, 11.8143]], [[79.8099, 10.8784], [79.806, 10.8797], [79.8069, 10.8777], [79.8099, 10.8784]], [[79.6972, 11.874], [79.6991, 11.8613], [79.6994, 11.8743], [79.6972, 11.874]], [[79.7003, 11.8217], [79.692, 11.8142], [79.7026, 11.8135], [79.7003, 11.8217]], [[79.7048, 12.032], [79.6569, 11.9916], [79.7179, 11.9904], [79.7048, 12.032]], [[79.7883, 12.0192], [79.8051, 12.0247], [79.7893, 12.0277], [79.7883, 12.0192]], [[79.6427, 11.9421], [79.6514, 12.0223], [79.6253, 12.0316], [79.6321, 11.9013], [79.6705, 11.9298], [79.6427, 11.9421]], [[79.6846, 11.9534], [79.6622, 11.9691], [79.6547, 11.9535], [79.6846, 11.9534]], [[79.6348, 11.8888], [79.602, 11.8578], [79.6634, 11.8613], [79.6348, 11.8888]], [[79.6617, 11.8393], [79.6463, 11.8163], [79.6712, 11.8149], [79.6617, 11.8393]]],
    },
  },
  {
    polityId: "pandya",
    validFrom: 1190,
    validTo: 1345,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier." }],
    geometry: {
      type: "Polygon",
      coordinates: [[[77.2677, 10.1222], [77.2961, 10.2506], [77.3497, 10.2644], [77.3214, 10.4341], [77.3855, 10.4494], [77.4016, 10.6135], [77.4825, 10.6501], [77.5428, 10.6098], [77.6935, 10.7353], [77.7205, 10.6313], [77.7887, 10.6853], [77.8306, 10.6329], [77.9777, 10.6399], [78.0151, 10.7197], [77.9392, 10.7685], [78.098, 10.767], [78.1858, 10.8338], [78.1326, 10.5752], [78.1999, 10.5468], [78.2065, 10.4741], [78.315, 10.4395], [78.2771, 10.3833], [78.3332, 10.3005], [78.4627, 10.408], [78.5213, 10.3264], [78.5145, 10.2677], [78.4527, 10.2671], [78.4877, 10.1906], [78.5778, 10.2873], [78.6516, 10.2544], [78.6775, 10.1473], [78.8098, 10.2131], [78.8478, 10.1262], [78.9666, 10.1277], [78.9301, 10.0218], [79.0099, 9.9899], [79.0429, 9.8613], [79.1168, 9.8505], [78.9304, 9.5953], [78.9336, 9.412], [79.0728, 9.2962], [79.3219, 9.3245], [79.4328, 9.1609], [79.2086, 9.2817], [78.9648, 9.2741], [78.4117, 9.1125], [78.1903, 8.9284], [78.1606, 8.7747], [78.202, 8.756], [78.0664, 8.3738], [77.8411, 8.2517], [77.7937, 8.1623], [77.6045, 8.1472], [77.5559, 8.0766], [77.3155, 8.1221], [77.0977, 8.2936], [77.1803, 8.3234], [77.1507, 8.3845], [77.227, 8.4467], [77.2013, 8.501], [77.2838, 8.5468], [77.17, 8.7419], [77.2583, 8.875], [77.147, 9.0214], [77.2678, 9.1534], [77.283, 9.3014], [77.4123, 9.5091], [77.3611, 9.6024], [77.1658, 9.6129], [77.2728, 9.9643], [77.2012, 10.1072], [77.2677, 10.1222]], [[78.4533, 10.3024], [78.4271, 10.3162], [78.4262, 10.2866], [78.4533, 10.3024]]],
    },
  },
  {
    polityId: "vijayanagara",
    validFrom: 1336,
    validTo: 1646,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern districts over the historical heartland — not a reconstructed frontier." }],
    geometry: {
      type: "Polygon",
      coordinates: [[[79.5928, 13.9229], [80.0511, 13.5584], [79.7304, 13.2828], [79.7946, 13.2264], [79.4352, 13.3519], [79.4384, 13.1881], [79.2348, 13.1709], [79.1633, 13.0203], [78.7147, 13.0688], [78.465, 12.6241], [78.1995, 12.6928], [78.2409, 12.7302], [78.2545, 12.8605], [78.2308, 12.7606], [77.836, 12.8703], [77.7391, 12.6728], [77.5988, 12.6673], [77.6176, 12.3744], [77.479, 12.2713], [77.7764, 12.1122], [77.6755, 11.9521], [77.4949, 11.944], [77.4274, 11.7608], [76.9079, 11.7953], [76.847, 11.5946], [76.4168, 11.6717], [76.12, 11.8503], [76.1137, 11.9801], [75.8702, 11.9521], [75.4142, 12.2895], [75.3252, 12.5921], [74.8649, 12.7603], [74.6102, 13.8668], [74.263, 14.7192], [74.093, 14.8042], [74.3362, 15.2948], [74.2521, 15.6543], [74.0883, 15.6699], [74.362, 15.7812], [74.4632, 16.0392], [74.3613, 16.0538], [74.5049, 16.196], [74.3249, 16.2718], [74.2707, 16.548], [74.4689, 16.6639], [74.5704, 16.5545], [74.6872, 16.6086], [74.6886, 16.7127], [74.9195, 16.7725], [74.9367, 16.9443], [75.2144, 16.8418], [75.2795, 16.9567], [75.675, 16.9661], [75.6329, 17.4772], [75.9307, 17.3227], [76.3831, 17.3146], [76.3314, 17.5963], [76.5234, 17.7596], [76.6908, 17.6809], [76.7401, 17.8995], [76.9191, 17.9161], [76.9519, 18.1881], [77.1107, 18.1553], [77.3658, 18.4507], [77.3658, 18.3072], [77.6054, 18.2815], [77.5478, 18.056], [77.656, 17.9688], [77.4432, 17.584], [77.6884, 17.4753], [77.3804, 17.2225], [77.4968, 17.0426], [77.476, 16.6502], [77.2417, 16.4732], [77.5978, 16.2933], [77.4902, 16.2552], [77.5134, 15.9279], [77.249, 15.9647], [77.073, 15.9105], [78.1339, 15.8364], [78.2623, 16.0266], [78.7411, 16.0086], [78.9228, 16.1266], [78.737, 15.1998], [79.0831, 15.1734], [79.1888, 14.6164], [79.4352, 14.243], [79.4489, 13.8952], [79.5928, 13.9229]], [[78.3886, 12.907], [78.3885, 12.9067], [78.4306, 12.9106], [78.3886, 12.907]], [[78.4646, 12.8667], [78.4646, 12.8669], [78.4455, 12.9119], [78.4646, 12.8667]], [[78.4111, 12.9454], [78.4113, 12.9455], [78.4353, 12.9812], [78.4111, 12.9454]], [[78.4623, 13.0432], [78.5353, 13.1033], [78.4667, 12.9835], [78.4623, 13.0432]], [[78.5171, 13.1316], [78.517, 13.1315], [78.5265, 13.1201], [78.5171, 13.1316]], [[78.5798, 13.1674], [78.5556, 13.1945], [78.5497, 13.1898], [78.5798, 13.1674]], [[78.5785, 13.2133], [78.5657, 13.3123], [78.5321, 13.267], [78.5785, 13.2133]], [[78.3773, 13.332], [78.377, 13.332], [78.4238, 13.3272], [78.3773, 13.332]], [[78.3651, 13.3619], [78.3651, 13.3619], [78.367, 13.3611], [78.3651, 13.3619]], [[78.4013, 13.5879], [78.2359, 13.5993], [78.193, 13.5649], [78.2374, 13.5984], [78.4013, 13.5879]], [[78.1562, 13.6588], [78.1061, 13.6473], [78.1905, 13.637], [78.1562, 13.6588]], [[78.0657, 13.6762], [78.0656, 13.6762], [78.07, 13.6695], [78.0657, 13.6762]], [[78.0915, 13.7422], [78.0915, 13.7424], [78.1199, 13.8322], [78.0915, 13.7422]], [[78.1148, 13.8631], [78.0496, 13.8961], [78.1179, 13.8443], [78.1148, 13.8631]], [[78.046, 13.8623], [78.0461, 13.8623], [78.0475, 13.8765], [78.046, 13.8623]], [[78.0004, 13.8732], [77.9824, 13.8558], [78.026, 13.867], [78.0004, 13.8732]], [[77.9532, 13.8278], [77.9875, 13.9553], [77.9528, 13.8275], [77.9532, 13.8278]], [[77.9267, 13.9052], [77.8957, 13.941], [77.8956, 13.941], [77.9267, 13.9052]], [[77.8264, 13.945], [77.8369, 13.8697], [77.8663, 13.9427], [77.8264, 13.945]], [[77.7172, 13.7418], [77.7034, 13.7697], [77.7172, 13.7412], [77.7172, 13.7418]], [[77.6716, 13.7605], [77.6802, 13.7869], [77.6651, 13.7822], [77.6716, 13.7605]], [[77.6278, 13.7348], [77.6279, 13.7347], [77.6237, 13.7553], [77.6278, 13.7348]], [[77.6001, 13.7508], [77.5604, 13.7226], [77.6073, 13.7466], [77.6001, 13.7508]], [[77.5272, 13.7539], [77.5272, 13.7531], [77.5597, 13.7233], [77.5272, 13.7539]], [[77.4922, 13.6898], [77.4921, 13.69], [77.4737, 13.6861], [77.4922, 13.6898]], [[77.4648, 13.8063], [77.4635, 13.806], [77.4643, 13.8003], [77.4648, 13.8063]], [[77.4323, 13.8426], [77.4161, 13.8066], [77.4241, 13.8066], [77.4323, 13.8426]], [[77.2566, 13.8467], [77.2566, 13.8468], [77.2526, 13.8578], [77.2566, 13.8467]], [[77.1902, 13.9036], [77.2004, 13.8629], [77.2006, 13.8632], [77.1902, 13.9036]], [[77.1847, 13.9251], [77.1763, 13.8932], [77.1847, 13.9248], [77.1847, 13.9251]], [[77.1282, 13.8565], [77.1686, 13.8297], [77.1358, 13.8579], [77.1282, 13.8565]], [[77.1271, 13.7544], [77.1729, 13.7621], [77.1729, 13.7622], [77.1271, 13.7544]], [[77.0243, 13.7794], [76.9985, 13.7455], [77.0647, 13.7439], [77.0243, 13.7794]], [[77.0416, 13.9335], [76.9311, 14.0302], [77.0213, 13.8995], [77.0416, 13.9335]], [[76.9774, 14.0713], [76.9706, 14.08], [76.9318, 14.0311], [76.9774, 14.0713]], [[76.925, 14.1374], [76.886, 14.1382], [76.9622, 14.0905], [76.925, 14.1374]], [[76.8979, 14.1697], [77.0234, 14.1765], [77.0255, 14.1235], [77.026, 14.1749], [77.0214, 14.1889], [76.8979, 14.1697]], [[77.028, 14.0621], [77.1273, 14.0471], [77.1496, 14.0014], [77.1276, 14.0471], [77.028, 14.0621]], [[77.3222, 14.0299], [77.3462, 13.9923], [77.23, 14.0147], [77.3222, 14.0299]], [[77.3714, 13.9528], [77.3987, 13.8882], [77.4352, 13.915], [77.3714, 13.9528]], [[77.4377, 13.9755], [77.3817, 13.9762], [77.3817, 13.9761], [77.4377, 13.9755]], [[77.401, 14.1189], [77.37, 14.11], [77.4008, 14.1186], [77.401, 14.1189]], [[77.3518, 14.1312], [77.3937, 14.1743], [77.35, 14.12], [77.3518, 14.1312]], [[77.51, 14.171], [77.4985, 14.2787], [77.4982, 14.2787], [77.51, 14.171]], [[77.4502, 14.2809], [77.4465, 14.2858], [77.4948, 14.2789], [77.4502, 14.2809]], [[77.4081, 14.3355], [77.3769, 14.3078], [77.379, 14.3035], [77.4081, 14.3355]], [[77.3711, 14.2565], [77.3926, 14.199], [77.3928, 14.1992], [77.3711, 14.2565]], [[77.3637, 14.2761], [77.2835, 14.2827], [77.2854, 14.3175], [77.2834, 14.2826], [77.3637, 14.2761]], [[77.2867, 14.3403], [77.2635, 14.3293], [77.2867, 14.3402], [77.2867, 14.3403]], [[77.1391, 14.3399], [77.1383, 14.3372], [77.2382, 14.3175], [77.1391, 14.3399]], [[77.0526, 14.2457], [76.9402, 14.2448], [77.1004, 14.2173], [77.0526, 14.2457]], [[76.9569, 14.2945], [76.9097, 14.3292], [76.9567, 14.2944], [76.9569, 14.2945]], [[76.8849, 14.3958], [76.9004, 14.4083], [76.8849, 14.3475], [76.8849, 14.3958]], [[76.9428, 14.3998], [76.9428, 14.3998], [76.938, 14.4035], [76.9428, 14.3998]], [[76.9747, 14.4852], [76.9746, 14.4852], [76.9701, 14.4729], [76.9747, 14.4852]], [[76.8681, 14.4742], [76.7651, 14.6023], [76.8029, 14.7419], [76.7649, 14.6021], [76.8681, 14.4742]], [[76.7829, 14.7859], [76.7978, 14.7909], [76.7949, 14.7595], [76.7829, 14.7859]], [[76.854, 14.8097], [76.8676, 14.9699], [76.7666, 14.9757], [76.8675, 14.9698], [76.854, 14.8097]], [[76.8362, 15.0791], [76.8531, 15.0589], [76.7768, 15.0783], [76.8362, 15.0791]], [[76.8772, 15.0303], [77.0482, 15.0277], [77.0495, 15.0332], [76.8772, 15.0303]], [[77.0826, 15.0061], [77.0835, 15.0077], [77.0684, 15.0075], [77.0826, 15.0061]], [[77.1616, 15.1576], [77.1408, 15.1585], [77.1483, 15.1321], [77.1616, 15.1576]], [[77.1692, 15.172], [77.1259, 15.226], [77.1623, 15.1588], [77.1692, 15.172]], [[77.1669, 15.2685], [77.1635, 15.2703], [77.1653, 15.2669], [77.1669, 15.2685]], [[77.1183, 15.2948], [77.1131, 15.3336], [77.113, 15.3336], [77.1183, 15.2948]], [[77.0321, 15.4358], [76.9757, 15.4923], [77.0639, 15.328], [77.0321, 15.4358]], [[77.0302, 15.5027], [77.0302, 15.5599], [77.0237, 15.5015], [77.0302, 15.5027]], [[77.0831, 15.659], [77.1213, 15.6313], [77.0508, 15.6439], [77.0831, 15.659]], [[77.1291, 15.666], [77.0972, 15.6916], [77.126, 15.6523], [77.1291, 15.666]], [[77.0653, 15.8281], [77.0363, 15.8348], [77.0652, 15.8274], [77.0653, 15.8281]], [[78.7715, 13.8275], [78.7292, 13.8855], [78.7711, 13.8274], [78.7715, 13.8275]], [[78.998, 13.9102], [78.9893, 13.9119], [79.0235, 13.8917], [78.998, 13.9102]], [[79.4193, 13.7842], [79.4184, 13.7842], [79.4179, 13.7652], [79.4193, 13.7842]], [[79.4676, 13.7953], [79.4328, 13.7836], [79.4457, 13.7825], [79.4676, 13.7953]], [[79.4339, 13.8727], [79.4566, 13.8019], [79.4346, 13.8748], [79.4339, 13.8727]], [[78.4272, 13.9793], [78.4755, 13.9837], [78.4655, 13.9938], [78.4272, 13.9793]], [[78.6582, 13.9084], [78.6568, 13.908], [78.6581, 13.9083], [78.6582, 13.9084]], [[77.2051, 15.1582], [77.2298, 15.1439], [77.2917, 15.1311], [77.2051, 15.1582]], [[77.1994, 15.1592], [77.201, 15.1595], [77.2001, 15.1597], [77.1994, 15.1592]], [[77.178, 15.1433], [77.1801, 15.143], [77.1818, 15.1461], [77.178, 15.1433]], [[78.4613, 14.1067], [78.4546, 14.0841], [78.4614, 14.1065], [78.4613, 14.1067]], [[78.1224, 14.6257], [78.0884, 14.6305], [78.1221, 14.6239], [78.1224, 14.6257]], [[78.0666, 14.718], [78.066, 14.7159], [78.0938, 14.7137], [78.0666, 14.718]], [[78.047, 14.7736], [78.046, 14.7718], [78.0765, 14.7524], [78.047, 14.7736]], [[78.0899, 14.8609], [78.0893, 14.8577], [78.1134, 14.8506], [78.0899, 14.8609]], [[78.1129, 14.9316], [78.0943, 14.8841], [78.0908, 14.8658], [78.1129, 14.9316]], [[78.1312, 14.9343], [78.1518, 14.9556], [78.1129, 14.9316], [78.1312, 14.9343]], [[78.7616, 15.0536], [78.7615, 15.0544], [78.7156, 15.0012], [78.7616, 15.0536]], [[78.6604, 14.9299], [78.6615, 14.9303], [78.6299, 14.9255], [78.6604, 14.9299]], [[78.4908, 15.0706], [78.4869, 15.0721], [78.4853, 15.0709], [78.4908, 15.0706]], [[78.3922, 14.9682], [78.4095, 14.9726], [78.3898, 14.9699], [78.3922, 14.9682]], [[78.3252, 15.0734], [78.2929, 15.0734], [78.2902, 15.0711], [78.3252, 15.0734]], [[78.2788, 15.0612], [78.2751, 15.058], [78.2757, 15.0562], [78.2788, 15.0612]], [[78.2204, 14.955], [78.1676, 14.9638], [78.1638, 14.9618], [78.2204, 14.955]]],
    },
  },
  {
    polityId: "chera",
    validFrom: 800,
    validTo: 1124,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern Kerala districts over the historical heartland — not a reconstructed frontier." }],
    geometry: {
      type: "Polygon",
      coordinates: [[[76.4867, 9.0869], [76.3202, 9.4826], [76.2407, 9.9822], [76.1678, 10.1817], [76.2138, 10.1933], [76.163, 10.1836], [75.91, 10.7934], [75.7318, 11.3562], [75.6641, 11.4627], [75.6181, 11.4772], [75.5533, 11.7026], [75.3563, 11.8602], [75.2517, 12.0086], [75.2012, 12.0063], [74.9546, 12.5493], [74.9501, 12.6363], [74.928, 12.6117], [74.8691, 12.7589], [75.0035, 12.791], [74.9825, 12.7384], [75.0503, 12.7193], [75.0466, 12.6666], [75.0853, 12.6737], [75.0853, 12.7055], [75.1526, 12.6823], [75.1376, 12.6446], [75.2016, 12.6289], [75.2204, 12.5683], [75.2734, 12.6169], [75.3253, 12.5923], [75.2697, 12.5497], [75.3364, 12.4641], [75.4159, 12.4996], [75.4225, 12.4727], [75.3658, 12.4577], [75.3658, 12.4121], [75.4214, 12.3729], [75.4141, 12.2896], [75.4848, 12.29], [75.5326, 12.2007], [75.5923, 12.1468], [75.6361, 12.1483], [75.6615, 12.0986], [75.7031, 12.1084], [75.7149, 12.0706], [75.8029, 12.0796], [75.8011, 12.037], [75.8699, 11.9522], [76.0032, 11.9316], [76.1137, 11.9798], [76.1199, 11.8505], [76.1902, 11.8715], [76.2238, 11.8083], [76.2801, 11.8124], [76.3184, 11.7515], [76.4137, 11.7586], [76.4274, 11.7261], [76.4034, 11.7112], [76.4439, 11.6473], [76.3022, 11.5714], [76.279, 11.6009], [76.2333, 11.568], [76.2473, 11.4679], [76.2845, 11.4828], [76.4185, 11.4417], [76.508, 11.3543], [76.5478, 11.3588], [76.5456, 11.3005], [76.4531, 11.2396], [76.4583, 11.1876], [76.4992, 11.2116], [76.5338, 11.1858], [76.6288, 11.1944], [76.6973, 11.2392], [76.7356, 11.2157], [76.6951, 11.1667], [76.7481, 11.1353], [76.7466, 11.0569], [76.8007, 11.0539], [76.7157, 11.0404], [76.6557, 10.9392], [76.8283, 10.8726], [76.9068, 10.7822], [76.8659, 10.6847], [76.8821, 10.6391], [76.8103, 10.6238], [76.8431, 10.5367], [76.8283, 10.3073], [76.8733, 10.2976], [76.9119, 10.2344], [76.9819, 10.2195], [77.1807, 10.3577], [77.2352, 10.3529], [77.2591, 10.2303], [77.2952, 10.2184], [77.2672, 10.1223], [77.2069, 10.1182], [77.2728, 9.9643], [77.2183, 9.9049], [77.2466, 9.7984], [77.1675, 9.6126], [77.2698, 9.573], [77.3177, 9.6026], [77.3394, 9.5734], [77.3611, 9.6022], [77.3501, 9.5671], [77.4123, 9.5091], [77.282, 9.2988], [77.268, 9.1534], [77.1973, 9.0465], [77.1468, 9.0215], [77.1929, 8.9262], [77.2573, 8.8758], [77.2293, 8.7839], [77.17, 8.742], [77.2838, 8.547], [77.2617, 8.5062], [77.2013, 8.501], [77.2271, 8.4468], [77.1505, 8.3844], [77.1796, 8.3228], [77.0979, 8.2925], [76.9863, 8.3758], [76.6818, 8.776], [76.5478, 8.9027], [76.4774, 9.1224], [76.4867, 9.0869]]],
    },
  },
  {
    polityId: "rashtrakuta",
    validFrom: 753,
    validTo: 982,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern Karnataka and western Maharashtra districts over the historical heartland — not a reconstructed frontier." }],
    geometry: {
      type: "Polygon",
      coordinates: [[[76.9757, 15.4923], [77.163, 15.1575], [77.0826, 15.0062], [76.7768, 15.0784], [76.7666, 14.9756], [76.8675, 14.9698], [76.7649, 14.6021], [76.9747, 14.4853], [76.8847, 14.3958], [76.9396, 14.2449], [77.2867, 14.3402], [77.3926, 14.199], [77.4092, 14.3366], [77.517, 14.186], [77.3516, 14.131], [77.4379, 13.9755], [77.3989, 13.8883], [77.3221, 14.0302], [77.1497, 14.0012], [77.0214, 14.1889], [76.8946, 14.1678], [77.0415, 13.9335], [76.9985, 13.7455], [77.1729, 13.7621], [77.1848, 13.9251], [77.4327, 13.8434], [77.5253, 13.6911], [77.7172, 13.7412], [77.8267, 13.9449], [77.9876, 13.9557], [77.9528, 13.8275], [78.1226, 13.8408], [78.0872, 13.643], [78.4018, 13.5874], [78.377, 13.332], [78.5656, 13.3121], [78.5799, 13.1673], [78.4111, 12.9454], [78.4667, 12.9054], [78.4647, 12.8667], [78.3558, 12.9409], [78.2308, 12.7606], [77.836, 12.8703], [77.7391, 12.6728], [77.5988, 12.6673], [77.6176, 12.3744], [77.472, 12.2079], [77.7314, 12.1802], [77.6755, 11.9521], [77.4949, 11.944], [77.4274, 11.7608], [77.2497, 11.8132], [77.1176, 11.7211], [76.982, 11.8116], [76.847, 11.5946], [76.614, 11.6076], [76.12, 11.8503], [76.1137, 11.9801], [75.8702, 11.9521], [75.4142, 12.2895], [75.3252, 12.5921], [74.8236, 12.8469], [74.6102, 13.8668], [74.263, 14.7192], [74.093, 14.8042], [74.2965, 15.0413], [74.2515, 15.2587], [74.3362, 15.2948], [74.2521, 15.6543], [74.0883, 15.6699], [74.2284, 15.7883], [74.0344, 15.8027], [74.0945, 16.0071], [73.8332, 16.094], [73.9509, 16.2017], [73.8317, 16.3451], [73.8632, 16.6697], [73.7096, 16.8293], [73.8303, 17.0582], [73.6882, 17.1412], [73.6413, 17.391], [73.7451, 17.5559], [73.5342, 17.8981], [73.6656, 18.16], [73.4204, 18.3037], [73.323, 18.5577], [73.3889, 18.8529], [73.5514, 19.0103], [73.5342, 19.1785], [73.7948, 19.3303], [73.6162, 19.5857], [73.84, 19.7411], [74.1196, 19.6412], [74.3734, 19.8018], [74.286, 19.987], [74.6705, 19.9468], [74.7206, 20.1937], [74.8184, 20.2502], [74.9272, 20.1542], [74.9054, 20.2462], [75.1255, 20.3504], [75.2577, 20.5764], [75.456, 20.514], [75.6622, 20.6629], [75.8247, 20.5555], [76.0062, 20.6482], [75.9228, 20.3125], [76.1935, 20.2998], [75.9633, 19.9984], [76.1351, 19.8469], [76.3667, 19.9285], [76.5368, 19.8485], [76.2135, 19.2601], [76.3642, 19.2327], [76.322, 19.1069], [76.7219, 18.7497], [77.0201, 18.8434], [76.9295, 18.9009], [77.1579, 19.0841], [77.241, 19.3225], [77.4869, 19.4586], [77.4583, 19.6823], [77.7454, 19.5252], [77.6971, 19.4384], [77.9072, 19.5341], [78.0694, 19.4583], [78.1797, 19.6497], [77.8496, 19.7966], [77.9531, 19.9086], [78.3061, 19.9112], [78.3046, 19.4563], [78.1761, 19.4123], [78.1754, 19.2376], [77.8636, 19.3042], [77.7619, 19.0332], [77.9484, 18.8294], [77.5278, 18.4421], [77.6054, 18.2815], [77.5478, 18.056], [77.656, 17.9688], [77.4432, 17.584], [77.5938, 17.5644], [77.6888, 17.5111], [77.6884, 17.4753], [77.5131, 17.4307], [77.3804, 17.2225], [77.4968, 17.0426], [77.476, 16.6502], [77.4168, 16.5175], [77.2417, 16.4732], [77.5948, 16.3431], [77.4902, 16.2552], [77.5134, 15.9279], [77.1524, 15.9491], [77.0257, 15.8375], [77.1289, 15.666], [76.9757, 15.4923]], [[76.4198, 17.6038], [76.4294, 17.6448], [76.4449, 17.6409], [76.4506, 17.6545], [76.3804, 17.6594], [76.3929, 17.6015], [76.4198, 17.6038]], [[76.3309, 17.5961], [76.3406, 17.5425], [76.3517, 17.5401], [76.3309, 17.5961]], [[76.3755, 17.4903], [76.3704, 17.4906], [76.333, 17.4393], [76.3755, 17.4903]], [[76.3715, 17.4366], [76.3483, 17.435], [76.4116, 17.3548], [76.3715, 17.4366]], [[76.4122, 17.3511], [76.3965, 17.3472], [76.3966, 17.3471], [76.4122, 17.3511]], [[76.3831, 17.3146], [76.3542, 17.3143], [76.3539, 17.3142], [76.3831, 17.3146]], [[76.3176, 17.3325], [76.3179, 17.3325], [76.3159, 17.341], [76.3176, 17.3325]], [[76.2749, 17.3443], [76.2722, 17.3606], [76.2722, 17.3604], [76.2749, 17.3443]], [[76.2021, 17.3594], [76.1702, 17.3528], [76.1703, 17.3526], [76.2021, 17.3594]], [[76.0997, 17.3649], [76.0791, 17.3318], [76.119, 17.3707], [76.0997, 17.3649]], [[76.0708, 17.3422], [76.0607, 17.3554], [76.0608, 17.3549], [76.0708, 17.3422]], [[75.8918, 17.3711], [75.8942, 17.4011], [75.894, 17.4011], [75.8918, 17.3711]], [[75.8609, 17.3855], [75.8712, 17.3998], [75.8419, 17.4139], [75.8609, 17.3855]], [[75.8137, 17.3729], [75.8139, 17.3735], [75.8213, 17.4199], [75.8137, 17.3729]], [[75.7669, 17.4025], [75.766, 17.4054], [75.7653, 17.4057], [75.7669, 17.4025]], [[75.676, 17.4561], [75.6908, 17.4096], [75.7123, 17.4079], [75.7201, 17.4123], [75.6762, 17.456], [75.676, 17.4561]], [[75.6332, 17.4772], [75.6332, 17.4771], [75.6675, 17.4602], [75.6332, 17.4772]], [[75.5806, 17.3511], [75.6101, 17.345], [75.5744, 17.3832], [75.6137, 17.392], [75.6147, 17.4375], [75.5741, 17.3835], [75.5806, 17.3511]], [[75.6278, 17.2744], [75.6279, 17.2744], [75.626, 17.2814], [75.6278, 17.2744]], [[75.6542, 17.2738], [75.6541, 17.2739], [75.6434, 17.274], [75.6542, 17.2738]], [[75.6594, 17.2447], [75.6618, 17.2147], [75.6621, 17.2147], [75.6594, 17.2447]], [[75.6358, 17.1889], [75.6285, 17.1889], [75.6286, 17.1887], [75.6358, 17.1889]], [[75.6429, 17.1452], [75.6493, 17.1343], [75.6495, 17.1343], [75.6429, 17.1452]], [[75.6507, 17.1158], [75.6507, 17.1157], [75.6723, 17.1161], [75.6507, 17.1158]], [[75.6412, 17.0377], [75.6769, 17.0653], [75.6761, 17.0751], [75.6411, 17.0377], [75.6412, 17.0377]], [[75.6691, 17.0283], [75.6658, 16.9799], [75.666, 16.9798], [75.6691, 17.0283]], [[75.6422, 16.9544], [75.6536, 16.9585], [75.6078, 16.9711], [75.6422, 16.9544]], [[75.6078, 16.9718], [75.6071, 17.0047], [75.6068, 17.0045], [75.6078, 16.9718]], [[75.4417, 16.9825], [75.3921, 16.9801], [75.4281, 16.9668], [75.4417, 16.9825]], [[75.2889, 16.9566], [75.3418, 16.956], [75.3456, 16.9579], [75.2889, 16.9566]], [[74.2278, 15.7608], [74.2279, 15.7658], [74.2276, 15.761], [74.2278, 15.7608]], [[74.308, 15.7487], [74.308, 15.7486], [74.3181, 15.7646], [74.308, 15.7487]], [[74.3698, 15.8001], [74.3694, 15.7936], [74.3696, 15.7939], [74.3698, 15.8001]], [[74.3605, 15.8167], [74.3616, 15.816], [74.361, 15.8175], [74.3605, 15.8167]], [[74.3383, 15.8549], [74.3823, 15.848], [74.3384, 15.855], [74.3383, 15.8549]], [[74.3638, 15.8774], [74.3673, 15.8895], [74.3648, 15.8938], [74.3638, 15.8774]], [[74.3884, 15.8544], [74.3871, 15.8566], [74.3881, 15.8544], [74.3884, 15.8544]], [[74.4632, 16.0394], [74.4484, 16.0014], [74.4632, 16.0392], [74.4632, 16.0394]], [[74.3773, 16.0551], [74.3734, 16.0365], [74.4299, 16.059], [74.3773, 16.0551]], [[74.3904, 16.0869], [74.3909, 16.0805], [74.3911, 16.0805], [74.3904, 16.0869]], [[74.4968, 16.2135], [74.4967, 16.2139], [74.4962, 16.2141], [74.4968, 16.2135]], [[74.4966, 16.2327], [74.5028, 16.2258], [74.5029, 16.2259], [74.4966, 16.2327]], [[74.4743, 16.2448], [74.4806, 16.2499], [74.4804, 16.25], [74.4743, 16.2448]], [[74.4686, 16.2403], [74.4687, 16.2404], [74.459, 16.2494], [74.4686, 16.2403]], [[74.4178, 16.2579], [74.4474, 16.2543], [74.4177, 16.2581], [74.4178, 16.2579]], [[74.3827, 16.2772], [74.3984, 16.2799], [74.3828, 16.2773], [74.3827, 16.2772]], [[74.373, 16.2615], [74.3732, 16.2618], [74.3602, 16.2888], [74.373, 16.2615]], [[74.3545, 16.2917], [74.3594, 16.2906], [74.3593, 16.2907], [74.3545, 16.2917]], [[74.3458, 16.2936], [74.3504, 16.2755], [74.3508, 16.2755], [74.3458, 16.2936]], [[74.343, 16.2744], [74.3249, 16.2718], [74.3428, 16.2982], [74.3295, 16.31], [74.3247, 16.2716], [74.343, 16.2744]], [[74.3168, 16.3268], [74.3169, 16.3268], [74.321, 16.3356], [74.3168, 16.3268]], [[74.3173, 16.3811], [74.3249, 16.3782], [74.3303, 16.3859], [74.3172, 16.3813], [74.3238, 16.3558], [74.3173, 16.3811]], [[74.3272, 16.3424], [74.3272, 16.3425], [74.3154, 16.3402], [74.3272, 16.3424]], [[74.3362, 16.3937], [74.336, 16.3936], [74.3566, 16.3785], [74.3362, 16.3937]], [[74.3333, 16.4389], [74.3351, 16.4012], [74.3352, 16.4013], [74.3333, 16.4389]], [[74.2893, 16.4633], [74.2895, 16.4632], [74.2903, 16.487], [74.2893, 16.4633]], [[74.261, 16.4799], [74.2702, 16.4838], [74.2609, 16.4801], [74.261, 16.4799]], [[74.2474, 16.4969], [74.254, 16.4887], [74.2475, 16.497], [74.2474, 16.4969]], [[74.2668, 16.5335], [74.2644, 16.5399], [74.2642, 16.54], [74.2668, 16.5335]], [[74.2724, 16.5475], [74.2714, 16.5466], [74.283, 16.5251], [74.2724, 16.5475]], [[74.2873, 16.5291], [74.2832, 16.5247], [74.2832, 16.5246], [74.2873, 16.5291]], [[74.2992, 16.5303], [74.3014, 16.5292], [74.3014, 16.5293], [74.2992, 16.5303]], [[74.3064, 16.5038], [74.3037, 16.5175], [74.3061, 16.5038], [74.3064, 16.5038]], [[74.3155, 16.5245], [74.315, 16.5047], [74.3153, 16.5048], [74.3155, 16.5245]], [[74.3161, 16.5547], [74.3161, 16.5544], [74.3303, 16.5504], [74.3161, 16.5547]], [[74.3967, 16.5831], [74.3798, 16.5286], [74.3799, 16.5285], [74.3967, 16.5831]], [[74.4, 16.5833], [74.4668, 16.607], [74.4561, 16.6434], [74.4, 16.5833]], [[74.4718, 16.6641], [74.4699, 16.6622], [74.5085, 16.632], [74.4718, 16.6641]], [[74.5442, 16.6176], [74.5436, 16.5952], [74.5438, 16.5952], [74.5442, 16.6176]], [[74.5563, 16.5636], [74.564, 16.5792], [74.5562, 16.5637], [74.5563, 16.5636]], [[74.5705, 16.5546], [74.569, 16.5554], [74.5704, 16.5545], [74.5705, 16.5546]], [[74.639, 16.6075], [74.6399, 16.6102], [74.6394, 16.6102], [74.639, 16.6075]], [[74.6482, 16.6099], [74.6475, 16.6099], [74.6524, 16.6097], [74.6482, 16.6099]], [[74.6875, 16.6168], [74.6876, 16.618], [74.6537, 16.6387], [74.6875, 16.6168]], [[74.6894, 16.6771], [74.6712, 16.6686], [74.6896, 16.6769], [74.6894, 16.6771]], [[74.6896, 16.6863], [74.6896, 16.6866], [74.6809, 16.686], [74.681, 16.686], [74.6896, 16.6863]], [[74.7324, 16.7183], [74.7206, 16.7174], [74.7322, 16.7182], [74.7324, 16.7183]], [[74.8499, 16.7728], [74.8372, 16.7596], [74.85, 16.7728], [74.8499, 16.7728]], [[74.9606, 16.8809], [74.9614, 16.8885], [74.9014, 16.8626], [74.9017, 16.8627], [74.9606, 16.8809]], [[74.9609, 16.9081], [74.9556, 16.9053], [74.9555, 16.9051], [74.9609, 16.9081]], [[74.931, 16.9229], [74.9308, 16.9235], [74.9218, 16.9296], [74.931, 16.9229]], [[74.9319, 16.9446], [74.93, 16.9418], [74.9343, 16.9433], [74.9319, 16.9446]], [[74.9645, 16.9267], [74.9645, 16.9476], [74.9644, 16.9475], [74.9645, 16.9267]], [[74.9914, 16.9519], [74.9917, 16.9518], [74.9931, 16.9521], [74.9914, 16.9519]], [[75.0965, 16.9137], [75.0893, 16.9515], [75.0355, 16.9317], [75.0965, 16.9137]], [[75.1057, 16.9136], [75.1174, 16.9134], [75.1177, 16.9136], [75.1057, 16.9136]], [[75.1838, 16.8721], [75.1764, 16.8679], [75.1766, 16.8679], [75.1838, 16.8721]], [[75.2277, 16.8434], [75.218, 16.8422], [75.2276, 16.8431], [75.2277, 16.8434]], [[75.2379, 16.8678], [75.2647, 16.8627], [75.238, 16.8679], [75.2379, 16.8678]], [[75.2716, 16.8696], [75.2901, 16.904], [75.2795, 16.9564], [75.2899, 16.9041], [75.2716, 16.8696]], [[77.2358, 18.3946], [77.2415, 18.4119], [77.2349, 18.3967], [77.2358, 18.3946]], [[77.2462, 18.3706], [77.246, 18.3716], [77.2395, 18.3862], [77.2462, 18.3706]], [[77.2259, 18.3651], [77.2338, 18.3673], [77.226, 18.3654], [77.2259, 18.3651]], [[77.2202, 18.3491], [77.2294, 18.3481], [77.2203, 18.3492], [77.2202, 18.3491]], [[77.2247, 18.3378], [77.2192, 18.3259], [77.2192, 18.3258], [77.2247, 18.3378]], [[77.2129, 18.2802], [77.2128, 18.2805], [77.1759, 18.2846], [77.2129, 18.2802]], [[77.1626, 18.2534], [77.1699, 18.261], [77.1718, 18.2701], [77.1626, 18.2534]], [[77.1517, 18.2171], [77.1503, 18.2275], [77.0974, 18.1966], [77.0978, 18.1966], [77.1517, 18.2171]], [[77.0589, 18.1604], [77.064, 18.1507], [77.0829, 18.1526], [77.0589, 18.1604]], [[77.0002, 18.1634], [77.0012, 18.1608], [77.012, 18.1597], [77.0002, 18.1634]], [[76.9423, 18.1564], [76.9317, 18.1597], [76.9317, 18.1595], [76.9423, 18.1564]], [[76.9453, 18.0831], [76.9623, 18.0954], [76.9453, 18.0832], [76.9453, 18.0831]], [[76.9522, 18.0401], [76.9145, 18.0352], [76.9079, 18.0166], [76.9522, 18.0401]], [[76.9114, 17.9692], [76.9056, 18.0096], [76.9055, 18.0095], [76.9114, 17.9692]], [[76.9191, 17.9161], [76.9012, 17.9171], [76.8925, 17.9053], [76.9191, 17.9161]], [[76.8397, 17.8989], [76.875, 17.8953], [76.84, 17.8994], [76.8397, 17.8989]], [[76.7384, 17.8566], [76.7401, 17.8995], [76.7682, 17.9012], [76.7752, 17.8777], [76.8043, 17.8706], [76.8046, 17.8709], [76.7684, 17.9014], [76.7358, 17.9043], [76.7384, 17.8566]], [[76.7619, 17.787], [76.762, 17.7871], [76.7647, 17.7908], [76.7619, 17.787]], [[76.7282, 17.7375], [76.7281, 17.7377], [76.7134, 17.7322], [76.7282, 17.7375]], [[76.6948, 17.7017], [76.6887, 17.6814], [76.6931, 17.6926], [76.6948, 17.7017]], [[76.6643, 17.6875], [76.6643, 17.6874], [76.6646, 17.6874], [76.6643, 17.6875]], [[76.6332, 17.7283], [76.6332, 17.7281], [76.6441, 17.7232], [76.6332, 17.7283]], [[76.6319, 17.7545], [76.6326, 17.7409], [76.632, 17.7544], [76.6319, 17.7545]], [[76.6144, 17.7704], [76.6138, 17.7711], [76.602, 17.7306], [76.6144, 17.7704]], [[76.5661, 17.7358], [76.5704, 17.7053], [76.5705, 17.7054], [76.5661, 17.7358]], [[76.5724, 17.7603], [76.5645, 17.7514], [76.573, 17.7603], [76.5724, 17.7603]], [[76.5247, 17.7597], [76.5234, 17.7596], [76.524, 17.7151], [76.5247, 17.7597]], [[77.4816, 18.2723], [77.463, 18.2635], [77.4876, 18.2696], [77.4816, 18.2723]], [[77.4383, 18.2867], [77.4383, 18.2864], [77.4445, 18.2805], [77.4383, 18.2867]], [[77.3869, 18.3044], [77.4092, 18.3014], [77.4089, 18.3017], [77.3869, 18.3044]], [[77.3579, 18.317], [77.3607, 18.3134], [77.3585, 18.3176], [77.3579, 18.317]], [[77.4056, 18.382], [77.4125, 18.3934], [77.3739, 18.401], [77.4056, 18.382]], [[77.3728, 18.4012], [77.3731, 18.4012], [77.3658, 18.45], [77.3728, 18.4012]], [[77.3656, 18.4516], [77.3201, 18.4581], [77.3453, 18.4334], [77.3656, 18.4516]]],
    },
  },
  {
    polityId: "chalukya-kalyani",
    validFrom: 973,
    validTo: 1189,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern Karnataka and western Maharashtra districts over the historical heartland — not a reconstructed frontier." }],
    geometry: {
      type: "Polygon",
      coordinates: [[[77.1289, 15.666], [77.0306, 15.6345], [76.9757, 15.4923], [77.1517, 15.2925], [77.163, 15.1575], [77.0826, 15.0062], [76.7768, 15.0784], [76.7666, 14.9756], [76.8675, 14.9698], [76.7649, 14.6021], [76.8678, 14.4739], [76.9747, 14.4853], [76.8847, 14.3958], [76.9396, 14.2449], [77.1008, 14.2172], [77.1378, 14.3373], [77.2867, 14.3402], [77.3926, 14.199], [77.4092, 14.3366], [77.517, 14.186], [77.3516, 14.131], [77.4009, 14.1187], [77.3324, 14.0308], [77.4379, 13.9755], [77.3989, 13.8883], [77.3221, 14.0302], [77.1497, 14.0012], [77.0283, 14.062], [77.0147, 14.1004], [77.0263, 14.1252], [77.026, 14.1749], [77.0214, 14.1889], [76.8946, 14.1678], [77.0415, 13.9335], [76.9985, 13.7455], [77.1729, 13.7621], [77.1282, 13.8564], [77.1848, 13.9251], [77.2004, 13.8629], [77.4327, 13.8434], [77.4555, 13.6824], [77.5253, 13.6911], [77.527, 13.7533], [77.7172, 13.7412], [77.8267, 13.9449], [77.9876, 13.9557], [77.9528, 13.8275], [78.0494, 13.8958], [78.1226, 13.8408], [78.0872, 13.643], [78.2043, 13.6283], [78.193, 13.5649], [78.4018, 13.5874], [78.377, 13.332], [78.5656, 13.3121], [78.5799, 13.1673], [78.4111, 12.9454], [78.4667, 12.9054], [78.4647, 12.8667], [78.3558, 12.9409], [78.2308, 12.7606], [77.836, 12.8703], [77.7391, 12.6728], [77.5988, 12.6673], [77.6176, 12.3744], [77.472, 12.2079], [77.7314, 12.1802], [77.7764, 12.1122], [77.6755, 11.9521], [77.4949, 11.944], [77.4274, 11.7608], [77.2497, 11.8132], [77.1176, 11.7211], [76.982, 11.8116], [76.9079, 11.7953], [76.847, 11.5946], [76.614, 11.6076], [76.12, 11.8503], [76.1137, 11.9801], [75.8702, 11.9521], [75.8027, 12.0794], [75.6617, 12.0986], [75.4142, 12.2895], [75.4162, 12.4997], [75.3365, 12.4642], [75.2696, 12.5495], [75.3252, 12.5921], [75.2203, 12.5684], [75.1525, 12.6822], [75.0466, 12.6666], [75.0026, 12.7912], [74.8649, 12.7603], [74.6102, 13.8668], [74.263, 14.7192], [74.093, 14.8042], [74.0857, 14.9008], [74.2965, 15.0413], [74.2515, 15.2587], [74.3362, 15.2948], [74.2521, 15.6543], [74.0883, 15.6699], [74.221, 15.7861], [74.362, 15.7812], [74.4632, 16.0392], [74.3613, 16.0538], [74.4834, 16.0919], [74.5049, 16.196], [74.3249, 16.2718], [74.3636, 16.4052], [74.2644, 16.5399], [74.3799, 16.5285], [74.4689, 16.6639], [74.5704, 16.5545], [74.6872, 16.6086], [74.6886, 16.7127], [74.9195, 16.7725], [74.9367, 16.9443], [75.0893, 16.9515], [75.2144, 16.8418], [75.2795, 16.9567], [75.675, 16.9661], [75.6045, 17.3051], [75.4213, 17.2656], [75.4059, 17.1853], [75.287, 17.2156], [75.296, 17.1461], [75.204, 17.2708], [74.9333, 17.1686], [74.8485, 17.2039], [75.0386, 17.4765], [74.9369, 17.5098], [74.9852, 17.5448], [74.8692, 17.7263], [74.6086, 17.8579], [74.7088, 18.0297], [75.0529, 17.905], [75.1352, 17.9716], [75.0389, 17.95], [75.0497, 18.0219], [75.1646, 18.1123], [75.0923, 18.1218], [75.1066, 18.2191], [75.0221, 18.1887], [75.0418, 18.2622], [74.8374, 18.2478], [74.8323, 18.3347], [75.2136, 18.5535], [75.4148, 18.5309], [75.5842, 18.6971], [76.3904, 18.5414], [76.4681, 18.6322], [76.6711, 18.6325], [76.7427, 18.7762], [76.9109, 18.8366], [77.0534, 18.7693], [77.0459, 18.6831], [77.1415, 18.7131], [77.2675, 18.6119], [77.2657, 18.4224], [77.4138, 18.3924], [77.3658, 18.3072], [77.6054, 18.2815], [77.5478, 18.056], [77.656, 17.9688], [77.4432, 17.584], [77.5938, 17.5644], [77.6888, 17.5111], [77.6884, 17.4753], [77.5131, 17.4307], [77.3804, 17.2225], [77.4968, 17.0426], [77.4188, 16.6687], [77.476, 16.6502], [77.4168, 16.5175], [77.2417, 16.4732], [77.5948, 16.3431], [77.4902, 16.2552], [77.5134, 15.9279], [77.1524, 15.9491], [77.0257, 15.8375], [77.1289, 15.666]], [[76.7401, 17.8995], [76.7752, 17.8777], [76.8043, 17.8706], [76.8085, 17.8822], [76.7358, 17.9043], [76.7401, 17.8995]], [[76.7647, 17.7908], [76.7619, 17.787], [76.762, 17.7871], [76.7647, 17.7908]], [[76.7281, 17.7377], [76.7134, 17.7322], [76.7282, 17.7375], [76.7281, 17.7377]], [[76.6908, 17.6809], [76.6948, 17.7017], [76.6907, 17.681], [76.6908, 17.6809]], [[76.6646, 17.6874], [76.6643, 17.6875], [76.6643, 17.6874], [76.6646, 17.6874]], [[76.6441, 17.7232], [76.6332, 17.7283], [76.6332, 17.7281], [76.6441, 17.7232]], [[76.6326, 17.7409], [76.632, 17.7544], [76.6319, 17.7545], [76.6326, 17.7409]], [[76.6144, 17.7704], [76.6138, 17.7711], [76.602, 17.7306], [76.6144, 17.7704]], [[76.5704, 17.7053], [76.5819, 17.7056], [76.5705, 17.7054], [76.5704, 17.7053]], [[76.5645, 17.7514], [76.573, 17.7603], [76.5724, 17.7603], [76.5645, 17.7514]], [[76.5234, 17.7596], [76.5247, 17.7597], [76.5232, 17.7596], [76.5234, 17.7596]], [[76.3804, 17.6594], [76.3929, 17.6015], [76.4448, 17.6411], [76.3804, 17.6594]], [[76.3517, 17.5401], [76.3309, 17.5961], [76.3406, 17.5425], [76.3517, 17.5401]], [[76.333, 17.4393], [76.3755, 17.4903], [76.3704, 17.4906], [76.333, 17.4393]], [[76.4116, 17.3548], [76.3715, 17.4366], [76.3483, 17.435], [76.4116, 17.3548]], [[76.3966, 17.3471], [76.4122, 17.3511], [76.3965, 17.3472], [76.3966, 17.3471]], [[76.3539, 17.3142], [76.3831, 17.3146], [76.3542, 17.3143], [76.3539, 17.3142]], [[76.3159, 17.341], [76.3176, 17.3325], [76.3179, 17.3325], [76.3159, 17.341]], [[76.2722, 17.3604], [76.2749, 17.3443], [76.2722, 17.3606], [76.2722, 17.3604]], [[76.1703, 17.3526], [76.2021, 17.3594], [76.1702, 17.3528], [76.1703, 17.3526]], [[76.119, 17.3707], [76.0997, 17.3649], [76.0791, 17.3318], [76.1627, 17.3453], [76.119, 17.3707]], [[76.0608, 17.3549], [76.0708, 17.3422], [76.0607, 17.3554], [76.0608, 17.3549]], [[75.9982, 17.338], [75.9983, 17.3381], [75.9291, 17.3241], [75.9982, 17.338]], [[75.8942, 17.4011], [75.8865, 17.4144], [75.894, 17.4011], [75.8942, 17.4011]], [[75.851, 17.4105], [75.8609, 17.3855], [75.8712, 17.3998], [75.8609, 17.3858], [75.8512, 17.4106], [75.851, 17.4105]], [[75.8139, 17.3735], [75.8213, 17.4199], [75.8137, 17.3729], [75.8139, 17.3735]], [[75.7336, 17.4199], [75.7669, 17.4025], [75.7653, 17.4057], [75.7336, 17.4199]], [[75.6762, 17.456], [75.676, 17.4561], [75.6908, 17.4096], [75.7123, 17.4079], [75.7201, 17.4123], [75.6762, 17.456]], [[75.6675, 17.4602], [75.6332, 17.4772], [75.6332, 17.4771], [75.6675, 17.4602]], [[75.5741, 17.3835], [75.5806, 17.3511], [75.6101, 17.345], [75.6147, 17.4375], [75.5741, 17.3835]], [[77.2349, 18.3967], [77.2358, 18.3946], [77.2415, 18.4119], [77.2349, 18.3967]], [[77.2462, 18.3706], [77.2464, 18.3707], [77.246, 18.3716], [77.2462, 18.3706]], [[77.226, 18.3654], [77.2259, 18.3651], [77.2338, 18.3673], [77.226, 18.3654]], [[77.2294, 18.3481], [77.2295, 18.3482], [77.2203, 18.3492], [77.2294, 18.3481]], [[77.2192, 18.3259], [77.1998, 18.3159], [77.2192, 18.3258], [77.2192, 18.3259]], [[77.2128, 18.2805], [77.1759, 18.2846], [77.2129, 18.2802], [77.2128, 18.2805]], [[77.1718, 18.2701], [77.1626, 18.2534], [77.1697, 18.2609], [77.1718, 18.2701]], [[77.0974, 18.1966], [77.1133, 18.1614], [77.0978, 18.1966], [77.1515, 18.2171], [77.0974, 18.1966]], [[77.0829, 18.1526], [77.0589, 18.1604], [77.0641, 18.1508], [77.0829, 18.1526]], [[77.012, 18.1597], [77.0002, 18.1634], [77.0011, 18.161], [77.012, 18.1597]], [[76.9317, 18.1595], [76.9423, 18.1564], [76.9317, 18.1597], [76.9317, 18.1595]], [[76.9453, 18.0832], [76.9453, 18.0831], [76.9623, 18.0954], [76.9453, 18.0832]], [[76.9141, 18.0352], [76.9079, 18.0166], [76.9145, 18.0352], [76.9141, 18.0352]], [[76.9055, 18.0095], [76.9114, 17.9692], [76.9056, 18.0096], [76.9055, 18.0095]], [[76.9012, 17.9174], [76.8925, 17.9053], [76.9012, 17.9171], [76.9012, 17.9174]], [[76.84, 17.8994], [76.8397, 17.8989], [76.875, 17.8953], [76.84, 17.8994]]],
    },
  },
  {
    polityId: "hoysala",
    validFrom: 1026,
    validTo: 1343,
    confidence: "illustrative",
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Approximated as the union of modern southern Karnataka districts over the historical heartland — not a reconstructed frontier." }],
    geometry: {
      type: "MultiPolygon",
      coordinates: [[[[76.3523, 11.7384], [76.2802, 11.8126], [76.2236, 11.8083], [76.1905, 11.8711], [76.12, 11.8503], [76.1137, 11.9801], [76.0032, 11.9313], [75.8702, 11.9521], [75.801, 12.0371], [75.8027, 12.0794], [75.7147, 12.0706], [75.7034, 12.1083], [75.6617, 12.0986], [75.6359, 12.1483], [75.5926, 12.147], [75.5327, 12.2004], [75.485, 12.2899], [75.4142, 12.2895], [75.4215, 12.3728], [75.3659, 12.4119], [75.3659, 12.4577], [75.4225, 12.4727], [75.4165, 12.5153], [75.4344, 12.5303], [75.49, 12.46], [75.529, 12.4994], [75.5658, 12.486], [75.5909, 12.5401], [75.6147, 12.5101], [75.6707, 12.5511], [75.6214, 12.8553], [75.5638, 12.8664], [75.5562, 12.9428], [75.5141, 12.9789], [75.5151, 13.0661], [75.4073, 13.1117], [75.3801, 13.179], [75.2524, 13.1289], [75.1667, 13.2028], [75.1399, 13.288], [75.1124, 13.2825], [75.0787, 13.343], [75.1465, 13.3928], [75.1545, 13.4533], [75.0595, 13.5194], [75.0214, 13.6983], [74.9281, 13.7689], [74.908, 13.8577], [74.8653, 13.8574], [74.8196, 13.9078], [74.7117, 13.9052], [74.6254, 14.1626], [74.6654, 14.1844], [74.7478, 14.1427], [74.7299, 14.2638], [74.8534, 14.2114], [74.8732, 14.2413], [74.8778, 14.2159], [74.9354, 14.2433], [74.9175, 14.3093], [74.9768, 14.3197], [74.9394, 14.3584], [74.9487, 14.3991], [74.8788, 14.4355], [74.9209, 14.4593], [74.8894, 14.4795], [74.901, 14.5292], [74.9768, 14.5488], [74.9897, 14.4726], [75.0406, 14.5003], [75.0615, 14.5436], [75.0231, 14.5673], [75.0261, 14.6109], [75.0727, 14.6552], [75.1601, 14.6174], [75.2054, 14.6376], [75.1842, 14.5859], [75.2405, 14.5549], [75.2653, 14.5797], [75.2971, 14.5406], [75.2676, 14.5149], [75.3196, 14.5136], [75.3401, 14.4359], [75.3821, 14.4336], [75.3487, 14.388], [75.4774, 14.3174], [75.5009, 14.3444], [75.533, 14.2774], [75.5823, 14.2784], [75.6333, 14.3171], [75.6369, 14.4655], [75.7974, 14.511], [75.8186, 14.565], [75.7977, 14.6812], [75.7378, 14.6913], [75.7729, 14.7918], [75.8262, 14.7817], [75.8159, 14.8998], [75.8692, 14.8543], [76.0452, 14.9307], [76.0846, 14.9135], [76.0727, 14.8689], [76.1908, 14.8465], [76.1428, 14.7931], [76.1925, 14.7684], [76.1839, 14.7004], [76.2305, 14.6493], [76.255, 14.6971], [76.3334, 14.6877], [76.432, 14.6184], [76.4238, 14.5816], [76.5326, 14.5419], [76.4615, 14.5061], [76.4598, 14.4518], [76.3834, 14.4203], [76.2812, 14.4043], [76.2613, 14.4443], [76.1733, 14.4606], [76.1362, 14.4271], [76.1567, 14.32], [76.1064, 14.3103], [76.1349, 14.2559], [76.0611, 14.2224], [76.0634, 14.1596], [76.025, 14.1131], [76.0545, 14.089], [76.0432, 13.9872], [76.0724, 13.9823], [76.0284, 13.8987], [76.0985, 13.8639], [76.1488, 13.7325], [76.2196, 13.7133], [76.2216, 13.682], [76.2864, 13.6466], [76.2732, 13.6049], [76.3414, 13.5763], [76.4552, 13.5909], [76.621, 13.7341], [76.6852, 13.6905], [76.6981, 13.7715], [76.7689, 13.7953], [76.7229, 13.8984], [76.8155, 13.916], [76.85, 13.9635], [76.8374, 14.0181], [76.8728, 14.0093], [76.9482, 14.0946], [76.9727, 14.0604], [76.931, 14.0302], [76.9995, 13.9905], [77.0472, 13.9065], [76.978, 13.8268], [76.9985, 13.7455], [77.0243, 13.7793], [77.0647, 13.7438], [77.1729, 13.7621], [77.1686, 13.8297], [77.1282, 13.8564], [77.1686, 13.8646], [77.1848, 13.9251], [77.2004, 13.8629], [77.2358, 13.9042], [77.2566, 13.8467], [77.3115, 13.8665], [77.3254, 13.8333], [77.4327, 13.8434], [77.4161, 13.8066], [77.4634, 13.8063], [77.4651, 13.711], [77.3645, 13.6287], [77.3827, 13.5005], [77.5514, 13.4198], [77.6031, 13.4413], [77.6024, 13.3983], [77.6209, 13.3756], [77.6577, 13.398], [77.6669, 13.3479], [77.7903, 13.3511], [77.8271, 13.3271], [77.8076, 13.2431], [77.8499, 13.2197], [77.8909, 13.2574], [77.8909, 13.2347], [77.9651, 13.2441], [77.9558, 13.1299], [77.9012, 13.1026], [77.9416, 13.0687], [77.8923, 13.0522], [77.8708, 12.9373], [77.8396, 12.922], [77.8665, 12.87], [77.7923, 12.8423], [77.8085, 12.7968], [77.7391, 12.6728], [77.5988, 12.6673], [77.5802, 12.5518], [77.6163, 12.5091], [77.5835, 12.4789], [77.6345, 12.488], [77.6156, 12.3673], [77.471, 12.2437], [77.472, 12.2079], [77.5051, 12.1984], [77.7314, 12.1802], [77.7764, 12.1122], [77.6755, 11.9521], [77.4949, 11.944], [77.4274, 11.7608], [77.2497, 11.8132], [77.1107, 11.7735], [77.1176, 11.7211], [77.0128, 11.8148], [76.9697, 11.7771], [76.9079, 11.7953], [76.8351, 11.6554], [76.847, 11.5946], [76.5766, 11.6148], [76.5118, 11.7052], [76.4582, 11.6645], [76.4168, 11.6717], [76.4138, 11.7589], [76.3523, 11.7384]]], [[[76.9992, 14.2293], [77.1167, 14.2263], [77.1157, 14.2817], [77.1617, 14.3418], [77.2381, 14.3174], [77.2867, 14.3402], [77.2834, 14.2826], [77.3638, 14.2758], [77.3926, 14.199], [77.4184, 14.2091], [77.389, 14.3331], [77.4982, 14.2787], [77.5035, 14.157], [77.3936, 14.1743], [77.3476, 14.1037], [77.4009, 14.1187], [77.3324, 14.0308], [77.3903, 14.0168], [77.3817, 13.9761], [77.4379, 13.9755], [77.4121, 13.9456], [77.435, 13.915], [77.3989, 13.8883], [77.3569, 13.9042], [77.3612, 13.9908], [77.3221, 14.0302], [77.1497, 14.0012], [77.1276, 14.0471], [77.0283, 14.062], [76.9992, 14.2293]]]],
    },
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
    provenance: [{ sourceId: PROTOTYPE_SOURCE.id, note: "Hand-drawn approximation." }],
    path: {
      type: "LineString",
      coordinates: [
        [79.8428, 10.7657],
        [80.5, 9.0],
        [80.9, 7.5],
        [81.0, 6.5],
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
    placeIds: [],
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
