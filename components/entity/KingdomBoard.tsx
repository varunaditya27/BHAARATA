"use client";

import { useDeferredValue, useState } from "react";
import { Odometer } from "@/components/primitives/Odometer";
import { fold } from "@/lib/utils/fold";

export type TileSize = "xl" | "l" | "m" | "s";

export type BoardTile = {
  id: string;
  name: string;
  size: TileSize;
  /** Year ranges in which getHistoricalState counts the kingdom as present. */
  alive: [number, number][];
  node: React.ReactNode;
};

// Columns × rows at each width. Widths only divide the grid evenly (3 and 6 of
// 12, 2 and 4 of 6), so grid-flow-dense can always fill a row; size shows in height.
const SIZE: Record<TileSize, string> = {
  xl: "col-span-2 row-span-2 md:col-span-4 md:row-span-3 lg:col-span-6 lg:row-span-4",
  l: "col-span-1 row-span-2 md:col-span-2 md:row-span-3 lg:col-span-3 lg:row-span-4",
  m: "col-span-1 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-3",
  s: "col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-2",
};

/**
 * Tiles are rendered on the server and passed in. This component owns the
 * year dial and the search: kingdoms with no recorded land in the chosen
 * year sink under an ink layer (opacity only), and the search hides tiles.
 */
export function KingdomBoard({
  intro,
  tiles,
  min,
  max,
}: {
  intro: React.ReactNode;
  tiles: BoardTile[];
  min: number;
  max: number;
}) {
  const [year, setYear] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const q = fold(useDeferredValue(query).trim());
  const held = (t: BoardTile) => year === null || t.alive.some(([a, b]) => year >= a && year <= b);
  const heldCount = tiles.filter(held).length;
  const matches = (t: BoardTile) => !q || fold(t.name).includes(q);
  const shownCount = tiles.filter(matches).length;

  return (
    <div className="px-2 pb-2 sm:px-3 sm:pb-3">
      <div className="grid gap-2 lg:grid-cols-12">
        <div className="bg-[#2e281f] p-6 sm:p-8 lg:col-span-7">{intro}</div>

        <div className="flex flex-col bg-territory-selected p-6 text-paper sm:p-8 lg:col-span-5">
          <p className="font-display text-6xl leading-none tabular-nums sm:text-7xl" aria-hidden>
            {year === null ? `${min}–${max}` : <Odometer value={year} suffix="CE" durationMs={260} />}
          </p>
          <p aria-live="polite" className="mt-4 font-sans text-lg text-paper/90">
            {year === null
              ? `All ${tiles.length} kingdoms. Move the slider to see which of them held land in a given year.`
              : `In ${year} CE, ${heldCount} of the ${tiles.length} kingdoms held land.`}
          </p>
          <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={year ?? min}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="Year"
            aria-valuetext={year === null ? "Every year" : `${year} CE`}
            className="bh-timeline-range mt-6 w-full"
            style={{ "--bh-progress": `${(((year ?? min) - min) / (max - min)) * 100}%` } as React.CSSProperties}
          />
          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
            <label className="flex min-w-0 flex-1 flex-col gap-1.5 font-sans text-sm text-paper/80">
              Find a kingdom
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="For example, Pala"
                autoComplete="off"
                spellCheck={false}
                className="w-full max-w-xs border-0 bg-paper/15 px-3 py-2 text-base text-paper placeholder:text-paper/50 focus:outline-2 focus:outline-paper"
              />
            </label>
            {year !== null && (
              <button onClick={() => setYear(null)} className="min-h-11 bg-paper px-4 font-sans text-sm font-medium text-ink hover:bg-paper/90">
                Show every kingdom
              </button>
            )}
          </div>
        </div>
      </div>

      {q && shownCount === 0 && (
        <p className="bg-[#2e281f] p-8 font-sans text-lg text-paper/80">
          No kingdom matches &ldquo;{query.trim()}&rdquo;. Check the spelling, or type only part of the name.
        </p>
      )}

      <ul className="mt-2 grid grid-flow-dense auto-rows-[120px] grid-cols-2 gap-2 md:auto-rows-[100px] md:grid-cols-6 lg:auto-rows-[88px] lg:grid-cols-12">
        {tiles.map((t) => {
          const dim = !held(t);
          return (
            <li key={t.id} hidden={!matches(t)} className={`relative ${SIZE[t.size]}`}>
              {t.node}
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-0 bg-ink transition-opacity duration-300 motion-reduce:transition-none ${dim ? "opacity-80" : "opacity-0"}`}
              />
              {dim && <span className="sr-only">No recorded land in {year} CE.</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
