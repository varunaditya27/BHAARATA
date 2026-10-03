import { z } from "zod";

/**
 * Temporal policy (PROJECT_BIBLE.md §7): never assume one integer year is
 * sufficient, and never let a date range imply more precision than the
 * record supports. Every date range carries an explicit confidence and an
 * optional textual qualifier so the UI can render "c. 850–1279 CE" instead
 * of silently rounding to clean numbers.
 */

export const DateConfidence = z.enum(["attested", "probable", "disputed", "illustrative"]);
export type DateConfidence = z.infer<typeof DateConfidence>;

export const DateQualifier = z.enum(["exact", "circa", "before", "after", "unknown"]);
export type DateQualifier = z.infer<typeof DateQualifier>;

export const DateRangeSchema = z.object({
  startYear: z.number().int(),
  endYear: z.number().int().nullable(),
  startQualifier: DateQualifier.default("circa"),
  endQualifier: DateQualifier.default("circa"),
  confidence: DateConfidence,
  note: z.string().optional(),
});
export type DateRange = z.infer<typeof DateRangeSchema>;

const qualifierPrefix: Record<DateQualifier, string> = {
  exact: "",
  circa: "c. ",
  before: "before ",
  after: "after ",
  unknown: "",
};

function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
}

/** Renders a DateRange the way the reader should see it — never fake precision. */
export function formatDateRange(range: DateRange): string {
  const start = `${qualifierPrefix[range.startQualifier]}${formatYear(range.startYear)}`;
  if (range.endYear === null) {
    return range.confidence === "disputed" ? `${start} (disputed)` : start;
  }
  const end = `${qualifierPrefix[range.endQualifier]}${formatYear(range.endYear)}`;
  const joined = `${start} – ${end}`;
  return range.confidence === "disputed" ? `${joined} (disputed)` : joined;
}

/** True when `year` falls inside the range, using endYear=null as "ongoing/unknown end". */
export function yearInRange(year: number, range: DateRange): boolean {
  if (year < range.startYear) return false;
  if (range.endYear !== null && year > range.endYear) return false;
  return true;
}
