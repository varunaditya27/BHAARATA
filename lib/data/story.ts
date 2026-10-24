import type { ImageKey } from "./images";

/**
 * The homepage's four chapters — one moment each, in order. Text sticks to
 * what each kingdom's Wikipedia article states; every claim was checked
 * against it (see docs/DATA.md). The camera and year are the only choices made here.
 */
export type StoryChapter = {
  id: string;
  year: number;
  polityId: string;
  title: string;
  body: string;
  imageKey: ImageKey;
  camera: { center: [number, number]; zoom: number };
};

export const storyChapters: StoryChapter[] = [
  {
    id: "deccan-powers",
    year: 760,
    polityId: "rashtrakuta",
    title: "The Rashtrakutas take the Deccan",
    body:
      "In the mid-700s the Rashtrakutas take over the Deccan from the Chalukyas of Badami. Under their king Krishna I, the Kailasa Temple at Ellora is cut downward out of a single hill of rock.",
    imageKey: "rashtrakuta-kailasa",
    camera: { center: [76.2, 17.6], zoom: 5.1 },
  },
  {
    id: "chola-sea",
    year: 1014,
    polityId: "chola",
    title: "The Cholas cross the sea",
    body:
      "Rajendra I inherits a Chola kingdom that already rules northern Sri Lanka. He sends armies north as far as the Ganges, and a fleet across the Bay of Bengal to Southeast Asia.",
    imageKey: "chola-brihadisvara",
    camera: { center: [80.2, 10.4], zoom: 5.4 },
  },
  {
    id: "pandya-revival",
    year: 1255,
    polityId: "pandya",
    title: "The Pandyas return",
    body:
      "As the Cholas weaken, the Pandya kings of Madurai rise again. Under Jatavarman Sundara Pandyan I they make the last Chola king accept their overlordship, and push north to Kanchipuram and as far as Nellore.",
    imageKey: "pandya-meenakshi",
    camera: { center: [78.3, 9.7], zoom: 6 },
  },
  {
    id: "vijayanagara",
    year: 1520,
    polityId: "vijayanagara",
    title: "Vijayanagara at its height",
    body:
      "Under Krishnadevaraya, Vijayanagara is at its largest, ruled from a city of temples and markets on the Tungabhadra river. Forty-five years later, after its defeat at Talikota, the royal centre is plundered and never rebuilt.",
    imageKey: "vijayanagara-virupaksha",
    camera: { center: [76.6, 15.0], zoom: 5.5 },
  },
];

/** Where the opening descent lands before the first chapter. */
export const STORY_OVERVIEW = { center: [78.8, 15.5] as [number, number], zoom: 4.15, year: 1050 };
