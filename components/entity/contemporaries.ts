import type { Polity } from "@/lib/domain/types";
import { PROTOTYPE_YEAR_RANGE } from "@/lib/geo/historical-state";

/** Kingdoms whose recorded span overlaps this one's, with the shared years. */
export function contemporariesOf(polity: Polity, polities: Polity[]) {
  if (
    polity.period.startQualifier === "unknown" ||
    polity.period.endQualifier === "unknown" ||
    polity.period.endYear === null
  ) {
    return [];
  }
  const start = polity.period.startYear;
  const end = polity.period.endYear ?? PROTOTYPE_YEAR_RANGE.max;
  return polities
    .filter(
      (p) =>
        p.id !== polity.id &&
        p.period.startQualifier !== "unknown" &&
        p.period.endQualifier !== "unknown" &&
        p.period.endYear !== null
    )
    .map((p) => {
      const from = Math.max(start, p.period.startYear);
      const to = Math.min(end, p.period.endYear ?? PROTOTYPE_YEAR_RANGE.max);
      return { polity: p, from, to };
    })
    .filter((c) => c.from <= c.to)
    .sort((a, b) => a.from - b.from);
}
