"use client";

import { useState } from "react";
import { type MapPlace, PlacesMap } from "@/components/map/PlacesMap";

export type PlaceGroup = { label: string; places: { id: string; row: React.ReactNode }[] };

/**
 * The map of every place beside the list, grouped by modern state. Hovering a row lights its marker, and hovering a
 * marker lights its row.
 */
export function PlacesAtlas({ places, groups }: { places: MapPlace[]; groups: PlaceGroup[] }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
      <div className="md:sticky md:top-20 md:self-start">
        <PlacesMap places={places} activeId={active} onActive={setActive} />
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
