import type { Person, Place, Polity } from "@/lib/domain/types";

/**
 * A plain-words description of where a record's data comes from, for the
 * badge on its page. "sourced" records are shown in a neutral tone;
 * anything still hand-written and unchecked is flagged.
 */
export type DataStatus = { label: string; sourced: boolean };

export function polityStatus(p: Polity): DataStatus {
  const ids = p.provenance.map((x) => x.sourceId);
  const borders = ids.includes("cliopatria");
  const summary = ids.some((id) => id.startsWith("wikipedia-"));
  if (borders && summary) return { label: "Borders: Cliopatria · Summary: Wikipedia", sourced: true };
  if (borders) return { label: "Borders: Cliopatria · Text not yet checked", sourced: false };
  return { label: "Placeholder data, not yet checked", sourced: false };
}

export function personStatus(p: Person): DataStatus {
  const ids = p.provenance.map((x) => x.sourceId);
  if (ids.some((id) => id.startsWith("wikipedia-list-"))) return { label: "Name and dates: Wikipedia's list of rulers", sourced: true };
  if (ids.includes("wikidata")) {
    return { label: ids.some((id) => id.startsWith("wikipedia-")) ? "Dates: Wikidata · Summary: Wikipedia" : "Dates and role: Wikidata", sourced: true };
  }
  return { label: "Placeholder data, not yet checked", sourced: false };
}

export function placeStatus(p: Place): DataStatus {
  return p.provenance.some((x) => x.sourceId === "wikidata")
    ? { label: "Name and location: Wikidata", sourced: true }
    : { label: "Placeholder data, not yet checked", sourced: false };
}
