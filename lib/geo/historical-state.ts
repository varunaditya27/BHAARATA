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
  const activePolities = polities.filter((p) => yearInRange(year, p.period));
  const activeBoundaries = boundaries.filter(
    (b) => year >= b.validFrom && year <= b.validTo,
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

export const PROTOTYPE_YEAR_RANGE = { min: 700, max: 1650 } as const;

export const PROTOTYPE_PERIOD_MARKERS = [
  { year: 750, label: "Early medieval" },
  { year: 1000, label: "Classical medieval" },
  { year: 1200, label: "Late medieval" },
  { year: 1450, label: "Early modern" },
] as const;

export const PROTOTYPE_ERAS = [
  { name: "Early medieval", start: 700, end: 999 },
  { name: "Classical medieval", start: 1000, end: 1199 },
  { name: "Late medieval", start: 1200, end: 1449 },
  { name: "Early modern", start: 1450, end: 1650 },
] as const;

export function getEraForYear(year: number): string {
  const era = PROTOTYPE_ERAS.find((e) => year >= e.start && year <= e.end);
  return era?.name ?? PROTOTYPE_ERAS[PROTOTYPE_ERAS.length - 1].name;
}
