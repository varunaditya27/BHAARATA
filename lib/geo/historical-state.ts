import { boundaries, events, polities, routes } from "@/lib/data/prototype";
import { yearInRange } from "@/lib/domain/time";
import type { HistoricalBoundary, HistoricalEvent, HistoricalRoute, Polity } from "@/lib/domain/types";

export type HistoricalState = {
  year: number;
  activePolities: Polity[];
  activeBoundaries: HistoricalBoundary[];
  activeEvents: HistoricalEvent[];
};

/**
 * The single function the timeline, map, and entity panel all call to
 * answer "what does the world look like in year Y". Everything downstream
 * (map filters, panel content, active-polity list) derives from this —
 * don't duplicate the "is this polity active this year" logic elsewhere.
 */
export function getHistoricalState(year: number): HistoricalState {
  const activeBoundaries = boundaries.filter(
    (b) => year >= b.validFrom && year <= b.validTo,
  );
  // A kingdom with mapped borders counts as present only in years its borders
  // cover — the Pandya, for one, have no shape between 922 and 1215.
  const mapped = new Set(boundaries.map((b) => b.polityId));
  const withBorders = new Set(activeBoundaries.map((b) => b.polityId));
  const activePolities = polities.filter(
    (p) => yearInRange(year, p.period) && (!mapped.has(p.id) || withBorders.has(p.id)),
  );
  const activeEvents = events.filter((e) => yearInRange(year, e.period));

  return { year, activePolities, activeBoundaries, activeEvents };
}

export function getBoundariesAtYear(year: number): HistoricalBoundary[] {
  return boundaries.filter((b) => year >= b.validFrom && year <= b.validTo);
}

export function getRoutesAtYear(year: number): HistoricalRoute[] {
  return routes.filter((r) => year >= r.validFrom && year <= r.validTo);
}

export const PROTOTYPE_YEAR_RANGE = { min: 600, max: 1700 } as const;

/** The usual periods of Indian history: early medieval to about 1200, late
 * medieval to the start of the Mughal era in 1526, early modern after. */
export const PROTOTYPE_ERAS = [
  { name: "Early medieval", start: 600, end: 1199 },
  { name: "Late medieval", start: 1200, end: 1525 },
  { name: "Early modern", start: 1526, end: 1700 },
] as const;

/** Where each era's name sits on the timeline: the middle of its span. */
export const PROTOTYPE_PERIOD_MARKERS = PROTOTYPE_ERAS.map((e) => ({
  year: Math.round((e.start + e.end) / 2),
  label: e.name,
}));

export function getEraForYear(year: number): string {
  const era = PROTOTYPE_ERAS.find((e) => year >= e.start && year <= e.end);
  return era?.name ?? PROTOTYPE_ERAS[PROTOTYPE_ERAS.length - 1].name;
}
