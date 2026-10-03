import Link from "next/link";
import { polities } from "@/lib/data/prototype";
import { formatDateRange } from "@/lib/domain/time";
import type { Polity } from "@/lib/domain/types";
import { PROTOTYPE_YEAR_RANGE } from "@/lib/geo/historical-state";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

const TICKS = [700, 900, 1100, 1300, 1500];

/** Kingdoms whose recorded span overlaps this one's, with the shared years. */
export function contemporariesOf(polity: Polity) {
  const start = polity.period.startYear;
  const end = polity.period.endYear ?? PROTOTYPE_YEAR_RANGE.max;
  return polities
    .filter((p) => p.id !== polity.id)
    .map((p) => {
      const from = Math.max(start, p.period.startYear);
      const to = Math.min(end, p.period.endYear ?? PROTOTYPE_YEAR_RANGE.max);
      return { polity: p, from, to };
    })
    .filter((c) => c.from <= c.to)
    .sort((a, b) => a.from - b.from);
}

/**
 * This kingdom's span across the atlas's whole timeline, with every
 * kingdom that overlapped it stacked beneath and the shared years marked.
 * Answers "who else was around?" at a glance.
 */
export function KingdomLifespan({ polity }: { polity: Polity }) {
  const { min, max } = PROTOTYPE_YEAR_RANGE;
  const pct = (y: number) => ((Math.min(max, Math.max(min, y)) - min) / (max - min)) * 100;
  const end = polity.period.endYear ?? max;
  const others = contemporariesOf(polity);

  return (
    <div>
      <div className="relative h-5 font-sans text-[0.65rem] text-ink-muted">
        {TICKS.map((t) => (
          <span key={t} className="absolute -translate-x-1/2" style={{ left: `${pct(t)}%` }}>
            {t}
          </span>
        ))}
      </div>
      <div className="relative border-t border-border pt-3">
        <div
          className="absolute bottom-0 top-0 border-x border-dashed"
          style={{ left: `${pct(polity.period.startYear)}%`, width: `${pct(end) - pct(polity.period.startYear)}%`, borderColor: "var(--bh-accent)" }}
          aria-hidden
        />
        <div className="relative flex items-center">
          <div
            className="bh-grow-x h-3"
            style={{ marginLeft: `${pct(polity.period.startYear)}%`, width: `${pct(end) - pct(polity.period.startYear)}%`, backgroundColor: polity.accentColor }}
          />
        </div>
        <p className="relative mt-1 font-sans text-xs text-ink" style={{ marginLeft: `${pct(polity.period.startYear)}%` }}>
          {polity.name} · {formatDateRange(polity.period)}
        </p>

        <ul className="relative mt-4 space-y-2.5">
          {others.map(({ polity: p, from, to }) => (
            <li key={p.id} className="relative">
              <div className="relative h-1.5">
                <div
                  className="absolute h-full opacity-30"
                  style={{
                    left: `${pct(p.period.startYear)}%`,
                    width: `${pct(p.period.endYear ?? max) - pct(p.period.startYear)}%`,
                    backgroundColor: p.accentColor,
                  }}
                />
                <div
                  className="absolute h-full"
                  style={{ left: `${pct(from)}%`, width: `${Math.max(0.6, pct(to) - pct(from))}%`, backgroundColor: p.accentColor }}
                />
              </div>
              <Link
                href={`/polities/${p.slug}`}
                transitionTypes={NAV_FORWARD}
                className="relative mt-0.5 inline-block font-sans text-[0.7rem] text-ink-muted hover:text-ink"
                style={{ marginLeft: `${Math.min(pct(from), 78)}%` }}
              >
                {p.name} <span className="text-ink-muted/70">· both existed {from}–{to}</span>
              </Link>
            </li>
          ))}
          {others.length === 0 && (
            <li className="font-sans text-xs text-ink-muted">No other kingdom in the atlas existed at the same time.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
