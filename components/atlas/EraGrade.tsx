import { getEraForYear } from "@/lib/geo/historical-state";

/**
 * A faint colour cast over the map that shifts with the era — golden saffron
 * early medieval, rose-magenta late medieval, cobalt early modern. Multiplied, so it tints rather than veils; the
 * background-color transition is the crossfade between eras.
 */
const ERA_TINT: Record<string, string> = {
  "Early medieval": "rgba(255, 176, 0, 0.2)",
  "Late medieval": "rgba(235, 70, 90, 0.14)",
  "Early modern": "rgba(15, 111, 208, 0.16)",
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
