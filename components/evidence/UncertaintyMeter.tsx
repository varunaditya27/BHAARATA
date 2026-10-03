import type { UncertaintyLevel } from "@/lib/domain/types";

const LEVEL_DOTS: Record<UncertaintyLevel, number> = { high: 3, medium: 2, low: 1 };
const LEVEL_WORD: Record<UncertaintyLevel, string> = { high: "Sure", medium: "Fairly sure", low: "Unsure" };

/** Three filled dots = high certainty, one = low. Per-dimension, never a
 * single blended score — see EvidenceSchema.uncertainty. */
export function UncertaintyMeter({ label, level }: { label: string; level: UncertaintyLevel }) {
  const filled = LEVEL_DOTS[level];
  return (
    <div className="flex items-center justify-between font-sans text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="flex items-center gap-1" aria-label={`${label}: ${LEVEL_WORD[level]}`}>
        <span className="mr-1.5 text-xs text-ink-muted" aria-hidden>
          {LEVEL_WORD[level]}
        </span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: i < filled ? "var(--bh-uncertainty)" : "var(--bh-stone)" }}
            aria-hidden
          />
        ))}
      </span>
    </div>
  );
}
