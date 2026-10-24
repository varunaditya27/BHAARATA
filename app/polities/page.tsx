import Image from "next/image";
import Link from "next/link";
import { KingdomBoard, type BoardTile, type TileSize } from "@/components/entity/KingdomBoard";
import { KingdomEmblem } from "@/components/entity/KingdomEmblem";
import { PageTransition } from "@/components/primitives/PageTransition";
import { Shared } from "@/components/primitives/Shared";
import { images, type ImageKey } from "@/lib/data/images";
import { polities } from "@/lib/data/prototype";
import { formatDateRange } from "@/lib/domain/time";
import { getHistoricalState, PROTOTYPE_YEAR_RANGE } from "@/lib/geo/historical-state";
import { polityPeakArea } from "@/lib/geo/silhouette";
import { NAV_FORWARD, transitionNames } from "@/lib/utils/view-transition";

export const metadata = {
  title: "Kingdoms — BHĀRATA",
};

const { min, max } = PROTOTYPE_YEAR_RANGE;

/** Year ranges per kingdom, from getHistoricalState for every year, so the board never re-derives "present in year Y". */
function presenceRanges(): Map<string, [number, number][]> {
  const ranges = new Map<string, [number, number][]>();
  for (let year = min; year <= max; year++) {
    for (const p of getHistoricalState(year).activePolities) {
      const list = ranges.get(p.id) ?? [];
      const last = list.at(-1);
      if (last && last[1] === year - 1) last[1] = year;
      else list.push([year, year]);
      ranges.set(p.id, list);
    }
  }
  return ranges;
}

// Rank by peak land: the largest six get the biggest tiles, then 12, then 18, then the rest.
function sizeFor(rank: number): TileSize {
  return rank < 6 ? "xl" : rank < 18 ? "l" : rank < 36 ? "m" : "s";
}

const NAME_SIZE: Record<TileSize, string> = {
  xl: "text-4xl sm:text-5xl lg:text-6xl",
  l: "text-2xl sm:text-3xl",
  m: "text-xl sm:text-2xl",
  s: "text-lg sm:text-xl",
};

export default function PolitiesIndexPage() {
  const presence = presenceRanges();
  const byArea = [...polities].sort((a, b) => polityPeakArea(b.id) - polityPeakArea(a.id));
  const rank = new Map(byArea.map((p, i) => [p.id, i]));
  const pct = (y: number) => ((Math.min(Math.max(y, min), max) - min) / (max - min)) * 100;

  const tiles: BoardTile[] = [...polities]
    .sort((a, b) => a.period.startYear - b.period.startYear)
    .map((polity, index) => {
      const size = sizeFor(rank.get(polity.id) ?? polities.length);
      const hero = polity.heroImageKey ? images[polity.heroImageKey as ImageKey] : undefined;
      const end = polity.period.endYear ?? max;
      return {
        id: polity.id,
        name: polity.name,
        size,
        alive: presence.get(polity.id) ?? [],
        node: (
          <Link
            key={polity.id}
            href={`/polities/${polity.slug}`}
            transitionTypes={NAV_FORWARD}
            className="group absolute inset-0 overflow-hidden bg-[#2e281f] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-paper"
          >
            {hero && (
              <Shared name={transitionNames.polityPhoto(polity.slug)}>
                <div className="absolute inset-0">
                  <Image
                    src={hero.file}
                    alt=""
                    fill
                    loading={index < 6 ? "eager" : "lazy"}
                    sizes={size === "xl" ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                  />
                </div>
              </Shared>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/5" />
            <KingdomEmblem polityId={polity.id} color={polity.accentColor} className="absolute left-3 top-3 h-7 w-7 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] sm:left-4 sm:top-4 sm:h-9 sm:w-9" />
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 lg:p-5">
              <h2 className={`font-display leading-none text-paper ${NAME_SIZE[size]}`}>{polity.name}</h2>
              {polity.nativeName && (size === "xl" || size === "l") && (
                <p lang={polity.nativeLang} className="mt-1 font-indic-display text-base text-paper/75 sm:text-lg">
                  {polity.nativeName}
                </p>
              )}
              <p className="mt-1.5 font-sans text-xs text-paper/75 sm:text-sm">{formatDateRange(polity.period)}</p>
              {size === "xl" && polity.summary && (
                <p className="mt-2 hidden max-w-lg font-sans text-sm leading-snug text-paper/80 line-clamp-2 md:block">{polity.summary}</p>
              )}
              <div className="relative mt-3 h-1 bg-paper/15" aria-hidden>
                <div
                  className="absolute inset-y-0"
                  style={{ left: `${pct(polity.period.startYear)}%`, width: `${Math.max(1, pct(end) - pct(polity.period.startYear))}%`, backgroundColor: polity.accentColor }}
                />
              </div>
            </div>
          </Link>
        ),
      };
    });

  return (
    <PageTransition>
      <div data-dark-page className="bg-ink pt-2 sm:pt-3">
        <KingdomBoard
          min={min}
          max={max}
          tiles={tiles}
          intro={
            <>
              <h1 className="font-display text-6xl leading-none text-paper sm:text-8xl">Kingdoms</h1>
              <p className="mt-6 max-w-xl font-sans text-lg leading-snug text-paper sm:text-2xl">
                {polities.length} kingdoms, empires and sultanates, from {min} to {max} CE. Each tile is sized by the most
                land that kingdom held at one time, measured from its recorded borders.
              </p>
              <p className="mt-4 max-w-xl font-sans text-sm text-paper/70">
                The coloured line on each tile shows when the kingdom existed, on a scale from {min} to {max}. Borders come
                from the Cliopatria dataset and summaries from Wikipedia. Each kingdom&rsquo;s page says what is still
                unchecked.
              </p>
            </>
          }
        />
      </div>
    </PageTransition>
  );
}
