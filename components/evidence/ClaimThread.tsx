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
      {/* A plain line with three diamonds; a stretched SVG turned the dots into ovals. */}
      <div className="relative hidden h-4 sm:block" aria-hidden>
        <div className="bh-thread-line absolute left-[16.5%] right-[16.5%] top-1/2 h-px origin-left bg-border" />
        {[16.5, 50, 83.5].map((x) => (
          <span key={x} className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-territory" style={{ left: `${x}%` }} />
        ))}
      </div>

      <div className="grid gap-0 sm:grid-cols-3 sm:divide-x sm:divide-border">
        <div className="pb-6 sm:px-6 sm:pb-0 sm:first:pl-0">
          <h3 className="font-sans text-sm font-medium text-ink-muted">What it shows</h3>
          <p className="mt-2 font-sans text-sm leading-relaxed text-ink">{record.claim}</p>
        </div>
        <div className="py-6 sm:px-6">
          <h3 className="font-sans text-sm font-medium text-ink-muted">How it&rsquo;s read</h3>
          <p className="mt-2 font-sans text-sm leading-relaxed text-ink">
            {record.interpretation ?? "Not recorded yet."}
          </p>
        </div>
        <div className="pt-6 sm:px-6 sm:pt-0">
          <h3 className="font-sans text-sm font-medium text-ink-muted">How sure we are</h3>
          {record.uncertainty ? (
            <div className="mt-3 space-y-2">
              <UncertaintyMeter label="The date" level={record.uncertainty.dating} />
              <UncertaintyMeter label="The reading" level={record.uncertainty.interpretation} />
              <UncertaintyMeter label="The place" level={record.uncertainty.geographic} />
            </div>
          ) : (
            <p className="mt-2 font-sans text-sm text-ink-muted">Not assessed.</p>
          )}
        </div>
      </div>
    </div>
  );
}
