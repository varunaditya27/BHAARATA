/**
 * A broad area for a place, worked out from its coordinates only, so the
 * places index can group consistently. A finding aid, not a historical
 * region: the rules are checked in order and listed north to south.
 */
const AREAS: { label: string; test: (lng: number, lat: number) => boolean }[] = [
  { label: "Afghanistan, Kashmir and Punjab", test: (_, lat) => lat >= 30 },
  { label: "Sindh and Gujarat", test: (lng, lat) => lng < 73 && lat >= 20 },
  { label: "The Ganges plain", test: (lng, lat) => lng < 85 && lat >= 23 },
  { label: "Bengal, Bihar and Assam", test: (lng, lat) => lng >= 85 && lat >= 20 },
  { label: "The Deccan", test: (_, lat) => lat >= 15 },
  { label: "Sri Lanka", test: (lng, lat) => lat < 10 && lng > 79.6 },
  { label: "The south", test: () => true },
];

/** Display order, north to south (Sri Lanka's rule must run before the catch-all, but it is shown last). */
export const AREA_ORDER = [...AREAS.map((a) => a.label).filter((l) => l !== "Sri Lanka"), "Sri Lanka"];

export function broadArea([lng, lat]: [number, number]): string {
  return AREAS.find((a) => a.test(lng, lat))!.label;
}
