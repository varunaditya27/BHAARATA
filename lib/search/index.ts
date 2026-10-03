import { evidence, events, people, places, polities } from "@/lib/data/prototype";
import { formatDateRange, formatPersonDates } from "@/lib/domain/time";
import { getHistoricalState, PROTOTYPE_YEAR_RANGE } from "@/lib/geo/historical-state";

export type SearchEntryType = "kingdom" | "person" | "place" | "event" | "evidence";

export type SearchEntry = {
  type: SearchEntryType;
  title: string;
  subtitle: string;
  href: string;
  /** Shown in its own right-aligned column, so dates line up down the list. */
  dates?: string;
  /** Kingdoms carry their outline into the results list. */
  emblem?: { polityId: string; color: string };
};

const TYPE_LABEL: Record<SearchEntryType, string> = {
  kingdom: "Kingdoms",
  person: "People",
  place: "Places",
  event: "Events",
  evidence: "Evidence",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function searchEntryGroupLabel(type: SearchEntryType): string {
  return TYPE_LABEL[type];
}

/**
 * One flat index built from the same prototype data everything else
 * reads — no separate search backend to keep in sync. Swap this for a
 * real query (Postgres full-text search plus trigram matching) once there's
 * a database;
 * the shape callers use (SearchEntry[]) shouldn't need to change.
 */
export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const p of polities) {
    entries.push({
      type: "kingdom",
      title: p.name,
      subtitle: `${cap(p.polityType)} · ${p.region}`,
      href: `/polities/${p.slug}`,
      dates: formatDateRange(p.period),
      emblem: { polityId: p.id, color: p.accentColor },
    });
  }
  for (const p of people) {
    entries.push({
      type: "person",
      title: p.name,
      subtitle: p.role,
      href: `/people/${p.slug}`,
      dates: formatPersonDates(p),
    });
  }
  for (const p of places) {
    entries.push({
      type: "place",
      title: p.name,
      subtitle: `${cap(p.placeType)} · ${p.region}`,
      href: `/places/${p.slug}`,
    });
  }
  for (const e of events) {
    entries.push({
      type: "event",
      title: e.title,
      subtitle: e.summary,
      href: `/chronology#${e.slug}`,
      dates: formatDateRange(e.period),
    });
  }
  for (const e of evidence) {
    entries.push({
      type: "evidence",
      title: e.title,
      subtitle: cap(e.evidenceType),
      href: `/evidence/${e.slug}`,
      dates: formatDateRange(e.period),
    });
  }

  return entries;
}

/**
 * A typed year ("1014", "1014 ce", "year 1014") as a "go to" command:
 * the atlas at that year, with the kingdoms on the map then. Years
 * outside the atlas's range get a note instead of a dead link.
 */
export function yearCommand(query: string): { year: number; inRange: boolean; kingdoms: string[] } | null {
  const m = query.trim().toLowerCase().match(/^(?:year\s+)?(\d{3,4})(?:\s*(?:ce|ad))?$/);
  if (!m) return null;
  const year = Number(m[1]);
  const inRange = year >= PROTOTYPE_YEAR_RANGE.min && year <= PROTOTYPE_YEAR_RANGE.max;
  return { year, inRange, kingdoms: inRange ? getHistoricalState(year).activePolities.map((p) => p.name) : [] };
}
