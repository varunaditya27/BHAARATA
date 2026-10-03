import { Eyebrow } from "@/components/primitives/Eyebrow";
import { UncertaintyMeter } from "@/components/evidence/UncertaintyMeter";
import type { Evidence } from "@/lib/domain/types";

/**
 * Claim → Interpretation → Uncertainty, made visually literal with a
 * drawn connecting line (not just column dividers) — the "how do we know
 * this" promise from PROJECT_BIBLE.md §9 shouldn't require reading the
 * layout to infer. The line draws itself in via the same native
 * scroll-driven reveal as the rest of the page (see .bh-reveal /
 * .bh-thread-line in globals.css); it's simply visible already in
 * browsers that don't support the CSS or in reduced-motion.
 */
export function ClaimThread({ record }: { record: Evidence }) {
  return (
    <div className="bh-reveal mt-10">
      <svg
        viewBox="0 0 100 4"
        preserveAspectRatio="none"
        className="hidden h-4 w-full text-border sm:block"
        aria-hidden
      >
        <line
          x1="16.5" y1="2" x2="83.5" y2="2"
          stroke="currentColor"
          strokeWidth="0.5"
          pathLength={100}
          className="bh-thread-line"
        />
        {[16.5, 50, 83.5].map((x) => (
          <circle key={x} cx={x} cy={2} r="1.4" fill="var(--bh-territory)" />
        ))}
      </svg>

      <div className="grid gap-0 sm:grid-cols-3 sm:divide-x sm:divide-border">
        <div className="pb-6 sm:px-6 sm:pb-0 sm:first:pl-0">
          <Eyebrow>Claim</Eyebrow>
          <p className="mt-2 font-sans text-sm leading-relaxed text-ink">{record.claim}</p>
        </div>
        <div className="py-6 sm:px-6">
          <Eyebrow>Interpretation</Eyebrow>
          <p className="mt-2 font-sans text-sm leading-relaxed text-ink">
            {record.interpretation ?? "—"}
          </p>
        </div>
        <div className="pt-6 sm:px-6 sm:pt-0">
          <Eyebrow>Uncertainty</Eyebrow>
          {record.uncertainty ? (
            <div className="mt-3 space-y-2">
              <UncertaintyMeter label="Dating" level={record.uncertainty.dating} />
              <UncertaintyMeter label="Interpretation" level={record.uncertainty.interpretation} />
              <UncertaintyMeter label="Geographic" level={record.uncertainty.geographic} />
            </div>
          ) : (
            <p className="mt-2 font-sans text-sm text-ink-muted">Not assessed.</p>
          )}
        </div>
      </div>
    </div>
  );
}
