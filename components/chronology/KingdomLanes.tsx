import Link from "next/link";
import { events, polities } from "@/lib/data/prototype";
import { PROTOTYPE_ERAS, PROTOTYPE_YEAR_RANGE } from "@/lib/geo/historical-state";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

const TICKS = [700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600];

/**
 * One row per kingdom across the whole timeline, with each event placed
 * on the row of the kingdom it belongs to. Era bands sit behind. Clicking
 * a marker jumps to that event in the list below. Scrolls sideways on
 * narrow screens rather than squashing the years together.
 */
export function KingdomLanes() {
  const { min, max } = PROTOTYPE_YEAR_RANGE;
  const pct = (y: number) => ((Math.min(max, Math.max(min, y)) - min) / (max - min)) * 100;
  const rows = [...polities].sort((a, b) => a.period.startYear - b.period.startYear);

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

        <ul className="relative space-y-1 border-t border-border pb-3 pt-7">
          {rows.map((p) => {
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
          })}
        </ul>
      </div>
    </div>
  );
}
