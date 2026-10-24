"use client";

import { useState } from "react";

export type PlaceDot = { id: string; name: string; x: number; y: number };
export type PlaceGroup = { label: string; places: { id: string; row: React.ReactNode }[] };

/**
 * A drawn map of every place beside the list, grouped by modern state.
 * Hovering or focusing a row lights its dot. The map repeats what the
 * rows say, so it is hidden from screen readers.
 */
export function PlacesAtlas({ land, dots, groups }: { land: string[]; dots: PlaceDot[]; groups: PlaceGroup[] }) {
  const [active, setActive] = useState<string | null>(null);
  const current = dots.find((d) => d.id === active);

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16">
      <div className="md:sticky md:top-24 md:self-start">
        <svg viewBox="0 0 100 100" className="mx-auto w-full max-w-xs md:max-w-none" aria-hidden>
          {land.map((d, i) => (
            <path key={i} d={d} fill="var(--bh-stone)" fillOpacity={0.35} stroke="var(--bh-border)" strokeWidth={0.15} />
          ))}
          {dots.map((d) => (
            <circle key={d.id} cx={d.x} cy={d.y} r={0.8} fill="var(--bh-ink)" opacity={active && active !== d.id ? 0.35 : 0.85} />
          ))}
          {current && (
            <g>
              <circle cx={current.x} cy={current.y} r={2.4} fill="none" stroke="var(--bh-territory-selected)" strokeWidth={0.45} />
              <circle cx={current.x} cy={current.y} r={1} fill="var(--bh-territory-selected)" />
              <text
                x={current.x + (current.x > 70 ? -3.4 : 3.4)}
                y={current.y + 1}
                textAnchor={current.x > 70 ? "end" : "start"}
                className="fill-ink font-display"
                fontSize={3.4}
                paintOrder="stroke"
                stroke="var(--bh-paper)"
                strokeWidth={0.8}
              >
                {current.name}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div>
        {groups.map((g) => (
          <section key={g.label} className="mb-12" aria-labelledby={`state-${g.label}`}>
            <h2 id={`state-${g.label}`} className="border-b border-ink/70 pb-2 font-display text-2xl text-ink">
              {g.label}
            </h2>
            <ul>
              {g.places.map((p) => (
                <li
                  key={p.id}
                  onMouseEnter={() => setActive(p.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(p.id)}
                  onBlur={() => setActive(null)}
                >
                  {p.row}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
