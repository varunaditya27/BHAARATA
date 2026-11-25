import type { Polity } from "@/lib/domain/types";

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
      ? { label: "Borders from Cliopatria. Text checked against Wikipedia.", sourced: true }
      : { label: "Text checked against Wikipedia. The outline is a rough placeholder.", sourced: false };
  }
  const summary = ids.some((id) => id.startsWith("wikipedia-"));
  if (borders && summary) return { label: "Borders from Cliopatria. Summary from Wikipedia.", sourced: true };
  if (borders) return { label: "Borders from Cliopatria. Text not checked yet.", sourced: false };
  return { label: "Placeholder, not checked yet.", sourced: false };
}

