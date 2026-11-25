"use client";

import Link from "next/link";
import { useState } from "react";

export type PlaceDot = { id: string; name: string; x: number; y: number; color: string; href: string };
export type PlaceGroup = { label: string; places: { id: string; row: React.ReactNode }[] };
export type Land = { d: string; color: string };

/**
 * A chart of every place beside the list. Each kingdom is laid in its own colour, large empires beneath small kingdoms; each capital is a dot in its kingdom's colour. Hovering a row lights its dot,
 * hovering a dot lights its row, and a dot opens its page. The chart repeats what the rows say, so the
 * decoration is hidden from screen readers while the dots stay reachable as links.
 */
export function PlacesAtlas({ land, dots, groups }: { land: Land[]; dots: PlaceDot[]; groups: PlaceGroup[] }) {
  const [active, setActive] = useState<string | null>(null);
  const current = dots.find((d) => d.id === active);

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:gap-14">
      <div className="md:sticky md:top-24 md:self-start">
        <svg viewBox="0 0 100 100" className="w-full" role="group" aria-label="Map of the places in the list">
          <rect width="100" height="100" fill="var(--bh-water)" />
          <g aria-hidden>
            {land.map((l, i) => (
              <path
                key={i}
                d={l.d}
                fill={l.color}
                fillOpacity={0.9}
                stroke="var(--bh-paper)"
                strokeOpacity={0.85}
                strokeWidth={0.3}
                strokeLinejoin="round"
                className="bh-land"
                style={{ "--i": i } as React.CSSProperties}
              />
            ))}
          </g>
          {dots.map((d, i) => (
            <Link key={d.id} href={d.href} aria-label={d.name} onMouseEnter={() => setActive(d.id)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(d.id)} onBlur={() => setActive(null)}>
              <circle
                cx={d.x}
                cy={d.y}
                r={active === d.id ? 1.9 : 1.25}
                fill={d.color}
                stroke="var(--bh-paper)"
                strokeWidth={0.45}
                opacity={active && active !== d.id ? 0.4 : 1}
                className="bh-dot"
                style={{ "--i": i } as React.CSSProperties}
              />
            </Link>
          ))}
          {current && (
            <g aria-hidden pointerEvents="none">
              <circle cx={current.x} cy={current.y} r={1.9} fill="none" stroke={current.color} strokeWidth={0.5} className="bh-ping" />
              <rect
                x={current.x + (current.x > 62 ? -(current.name.length * 1.75 + 5.2) : 3)}
                y={current.y - 2.5}
                width={current.name.length * 1.75 + 2.4}
                height={5}
                fill="var(--bh-ink)"
              />
              <text
                x={current.x + (current.x > 62 ? -(current.name.length * 1.75 + 5.2) + 1.2 : 4.2)}
                y={current.y + 1.2}
                fontSize={3.1}
                className="fill-paper font-sans"
              >
                {current.name}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div>
        {groups.map((g) => (
          <section key={g.label} className="bh-reveal mb-12" aria-labelledby={`state-${g.label}`}>
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
                  className={active === p.id ? "bg-ink/[0.04]" : undefined}
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
