import { getEraForYear } from "@/lib/geo/historical-state";

/**
 * A faint colour cast over the map that shifts with the era — golden saffron
 * early medieval, rose-magenta late medieval, cobalt early modern. Multiplied, so it tints rather than veils; the
 * background-color transition is the crossfade between eras.
 */
const ERA_TINT: Record<string, string> = {
  "Early medieval": "rgba(255, 168, 40, 0.16)",
  "Late medieval": "rgba(232, 60, 130, 0.13)",
  "Early modern": "rgba(50, 110, 240, 0.15)",
};

export function EraGrade({ year }: { year: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 mix-blend-multiply transition-colors duration-[1400ms]"
      style={{ backgroundColor: ERA_TINT[getEraForYear(year)] ?? "transparent" }}
      aria-hidden
    />
  );
}
