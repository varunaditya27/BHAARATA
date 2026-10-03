import Link from "next/link";
import { milestones as events, polities } from "@/lib/data/prototype";
import { PROTOTYPE_ERAS, PROTOTYPE_YEAR_RANGE } from "@/lib/geo/historical-state";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

const TICKS = [600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700];

/**
 * One row per kingdom across the whole timeline, with each event placed
 * on the row of the kingdom it belongs to. Era bands sit behind. Clicking
 * a marker jumps to that event in the list below. Scrolls sideways on
 * narrow screens rather than squashing the years together.
 */
export function KingdomLanes() {
  const { min, max } = PROTOTYPE_YEAR_RANGE;
  const pct = (y: number) => ((Math.min(max, Math.max(min, y)) - min) / (max - min)) * 100;
  const sorted = [...polities].sort((a, b) => a.period.startYear - b.period.startYear);
  // Kingdoms with recorded events lead; the rest sit behind a native
  // <details> toggle so the chart doesn't run to sixty rows.
  const hasEvents = (id: string) => events.some((e) => e.polityIds[0] === id);
  const withEvents = sorted.filter((p) => hasEvents(p.id));
  const others = sorted.filter((p) => !hasEvents(p.id));

  const renderRow = (p: (typeof sorted)[number]) => {
            const start = pct(p.period.startYear);
            const width = pct(p.period.endYear ?? max) - start;
            const own = events.filter((e) => e.polityIds[0] === p.id);
            return (
              <li key={p.id} className="relative h-7">
                <div className="absolute top-1/2 h-[3px] -translate-y-1/2" style={{ left: `${start}%`, width: `${width}%`, backgroundColor: p.accentColor }} />
                <Link
                  href={`/polities/${p.slug}`}
                  transitionTypes={NAV_FORWARD}
                  className="absolute top-1/2 -translate-y-[130%] whitespace-nowrap font-sans text-[0.7rem] text-ink hover:underline"
                  style={{ left: `${start}%` }}
                >
                  {p.name}
                </Link>
                {own.map((e) => (
                  <a
                    key={e.id}
                    href={`#${e.slug}`}
                    title={`${e.title} (${e.period.startYear})`}
                    aria-label={`${e.title}, ${e.period.startYear}`}
                    className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-paper transition-transform hover:scale-150 focus-visible:scale-150"
                    style={{ left: `${pct(e.period.startYear)}%`, backgroundColor: p.accentColor }}
                  />
                ))}
              </li>
            );
  };

  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="relative mx-3 min-w-[720px]">
        {/* era bands */}
        <div className="absolute inset-0 top-6 flex" aria-hidden>
          {PROTOTYPE_ERAS.map((era, i) => (
            <div
              key={era.name}
              className={i % 2 === 0 ? "bg-stone/35" : ""}
              style={{ width: `${pct(era.end + 1) - pct(era.start)}%` }}
            >
              <span className="block px-2 pt-1 font-sans text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">
                {era.name}
              </span>
            </div>
          ))}
        </div>

        <div className="relative h-6 font-sans text-[0.65rem] text-ink-muted">
          {TICKS.map((t) => (
            <span key={t} className="absolute -translate-x-1/2 tabular-nums" style={{ left: `${pct(t)}%` }}>
              {t}
            </span>
          ))}
        </div>

        <ul className="relative space-y-1 border-t border-border pt-7">{withEvents.map(renderRow)}</ul>
        {others.length > 0 && (
          <details className="group relative pb-3">
            <summary className="relative z-10 mt-2 inline-block cursor-pointer select-none bg-paper/80 px-2 py-1 font-sans text-xs text-ink underline underline-offset-4 hover:text-territory-selected group-open:mb-2">
              <span className="group-open:hidden">Show the other {others.length} kingdoms</span>
              <span className="hidden group-open:inline">Hide the other {others.length} kingdoms</span>
            </summary>
            <ul className="relative space-y-1">{others.map(renderRow)}</ul>
          </details>
        )}
      </div>
    </div>
  );
}
