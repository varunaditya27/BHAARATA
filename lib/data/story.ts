import type { ImageKey } from "./images";

/**
 * The homepage's four chapters — one moment each, in order. Text sticks to
 * widely agreed outlines (who held power where, roughly when) rather than
 * specific claims that would need a citation; the atlas records behind
 * them remain illustrative prototype data, and the page says so.
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
    title: "The Deccan powers",
    body:
      "In the mid-700s the Rashtrakutas take the Deccan from the Chalukyas of Badami. Under Krishna I, a temple is cut downward out of a single hill of rock at Ellora.",
    imageKey: "rashtrakuta-kailasa",
    camera: { center: [76.2, 17.6], zoom: 5.1 },
  },
  {
    id: "chola-sea",
    year: 1014,
    polityId: "chola",
    title: "The Chola sea",
    body:
      "Rajendra I inherits a Chola state that already reaches across the strait into Sri Lanka, and pushes it further — north toward the Ganges, and east across the Bay of Bengal.",
    imageKey: "chola-brihadisvara",
    camera: { center: [80.2, 10.4], zoom: 5.4 },
  },
  {
    id: "pandya-revival",
    year: 1255,
    polityId: "pandya",
    title: "The Pandya revival",
    body:
      "As Chola power fades, the Pandyas of Madurai rise again. Under Jatavarman Sundara Pandyan I they become the strongest power in the far south.",
    imageKey: "pandya-meenakshi",
    camera: { center: [78.3, 9.7], zoom: 6 },
  },
  {
    id: "vijayanagara",
    year: 1520,
    polityId: "vijayanagara",
    title: "Vijayanagara",
    body:
      "Krishnadevaraya rules Vijayanagara at its widest, from a capital of temples and markets on the Tungabhadra. Forty-five years later, after the battle of Talikota, the city is sacked.",
    imageKey: "vijayanagara-virupaksha",
    camera: { center: [76.6, 15.0], zoom: 5.5 },
  },
];

/** Where the opening descent lands before the first chapter. */
export const STORY_OVERVIEW = { center: [78.8, 15.5] as [number, number], zoom: 4.15, year: 1050 };
