import { getEraForYear } from "@/lib/geo/historical-state";

/**
 * A faint colour cast over the map that shifts with the era — warm ochre
 * early medieval, rose-sepia late medieval, cooler slate early modern. Multiplied, so it tints rather than veils; the
 * background-color transition is the crossfade between eras.
 */
const ERA_TINT: Record<string, string> = {
  "Early medieval": "rgba(176, 124, 58, 0.09)",
  "Late medieval": "rgba(150, 86, 72, 0.08)",
  "Early modern": "rgba(72, 96, 118, 0.09)",
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
