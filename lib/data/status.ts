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
  if (ids.some((id) => id.startsWith("wikipedia-check-"))) {
    return borders
      ? { label: "Borders from the Cliopatria dataset. Text checked against Wikipedia.", sourced: true }
      : { label: "Text checked against Wikipedia. The outline is a rough placeholder.", sourced: false };
  }
  const summary = ids.some((id) => id.startsWith("wikipedia-"));
  if (borders && summary) return { label: "Borders from the Cliopatria dataset. Summary from Wikipedia.", sourced: true };
  if (borders) return { label: "Borders from the Cliopatria dataset. Text not checked yet.", sourced: false };
  return { label: "Placeholder, not checked yet.", sourced: false };
}

export function personStatus(p: Person): DataStatus {
  const ids = p.provenance.map((x) => x.sourceId);
  if (ids.some((id) => id.startsWith("wikipedia-check-person-"))) return { label: "Dates and text checked against Wikipedia.", sourced: true };
  if (ids.some((id) => id.startsWith("wikipedia-list-"))) return { label: "Name and dates from Wikipedia's list of rulers.", sourced: true };
  if (ids.includes("wikidata")) {
    return {
      label: ids.some((id) => id.startsWith("wikipedia-"))
        ? "Dates from Wikidata, Wikipedia's open database. Summary from Wikipedia."
        : "Dates and title from Wikidata, Wikipedia's open database.",
      sourced: true,
    };
  }
  return { label: "Placeholder, not checked yet.", sourced: false };
}

export function placeStatus(p: Place): DataStatus {
  return p.provenance.some((x) => x.sourceId === "wikidata")
    ? { label: "Name and location from Wikidata, Wikipedia's open database.", sourced: true }
    : { label: "Placeholder, not checked yet.", sourced: false };
}
