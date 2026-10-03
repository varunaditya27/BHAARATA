import { evidence, events, people, places, polities } from "@/lib/data/prototype";

export type SearchEntryType = "kingdom" | "person" | "place" | "event" | "evidence";

export type SearchEntry = {
  type: SearchEntryType;
  title: string;
  subtitle: string;
  href: string;
};

const TYPE_LABEL: Record<SearchEntryType, string> = {
  kingdom: "Kingdoms",
  person: "People",
  place: "Places",
  event: "Events",
  evidence: "Evidence",
};

export function searchEntryGroupLabel(type: SearchEntryType): string {
  return TYPE_LABEL[type];
}

/**
 * One flat index built from the same prototype data everything else
 * reads — no separate search backend to keep in sync. Swap this for a
 * real query (Postgres FTS, per GUIDANCE.md §13) once there's a database;
 * the shape callers use (SearchEntry[]) shouldn't need to change.
 */
export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const p of polities) {
    entries.push({
      type: "kingdom",
      title: p.name,
      subtitle: `${p.polityType} · ${p.region}`,
      href: `/polities/${p.slug}`,
    });
  }
  for (const p of people) {
    entries.push({
      type: "person",
      title: p.name,
      subtitle: p.role,
      href: `/people/${p.slug}`,
    });
  }
  for (const p of places) {
    entries.push({
      type: "place",
      title: p.name,
      subtitle: `${p.placeType} · ${p.region}`,
      href: `/places/${p.slug}`,
    });
  }
  for (const e of events) {
    entries.push({
      type: "event",
      title: e.title,
      subtitle: e.summary,
      href: `/chronology#${e.slug}`,
    });
  }
  for (const e of evidence) {
    entries.push({
      type: "evidence",
      title: e.title,
      subtitle: e.evidenceType,
      href: `/evidence/${e.slug}`,
    });
  }

  return entries;
}
