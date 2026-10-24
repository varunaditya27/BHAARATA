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

/** One end of a range. An "unknown" qualifier means the stored year is only
 * a sorting placeholder, so it is never printed. */
export function formatDatePoint(qualifier: DateQualifier, year: number): string {
  return qualifier === "unknown" ? "unknown" : `${qualifierPrefix[qualifier]}${formatYear(year)}`;
}

/** Renders a DateRange the way the reader should see it — never fake precision. */
export function formatDateRange(range: DateRange): string {
  const startUnknown = range.startQualifier === "unknown";
  const endUnknown = range.endYear === null || range.endQualifier === "unknown";
  let text: string;
  if (startUnknown && endUnknown) text = "date unknown";
  else if (range.endYear === null) text = formatDatePoint(range.startQualifier, range.startYear);
  // A reign that began and ended in the same year reads as one date, not "c. 524 CE – c. 524 CE".
  else if (range.endYear === range.startYear && range.endQualifier === range.startQualifier) text = formatDatePoint(range.startQualifier, range.startYear);
  else text = `${formatDatePoint(range.startQualifier, range.startYear)} – ${formatDatePoint(range.endQualifier, range.endYear)}`;
  return range.confidence === "disputed" ? `${text} (disputed)` : text;
}

/** A person's dates, worded for what they are: a reign, or only a lifetime. */
export function formatPersonDates(person: { period: DateRange; datesAre?: "reign" | "lifetime" }): string {
  const text = formatDateRange(person.period);
  return person.datesAre === "lifetime" ? `Lived ${text}` : text;
}

/** True when `year` falls inside the range, using endYear=null as "ongoing/unknown end". */
export function yearInRange(year: number, range: DateRange): boolean {
  if (year < range.startYear) return false;
  if (range.endYear !== null && year > range.endYear) return false;
  return true;
}
