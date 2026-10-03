"use client";

import { useState } from "react";
import { formatDateRange, yearInRange } from "@/lib/domain/time";
import type { Polity } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";
import { lightenHex } from "@/lib/utils/color";

const BAND = 6;
const GAP = 3;
/** Half the timeline thumb's width, so band x-positions line up with
 * where the native range thumb actually sits for a given year. */
const THUMB_INSET = 6.5;

/**
 * One band per kingdom across the timeline's full span — which kingdoms
 * existed when, and how they overlapped, readable at a glance without
 * scrubbing. Bands for kingdoms present in the current year are lit;
 * clicking a band jumps to that kingdom's first year and selects it.
 */
export function LifespanStrip({
  polities,
  year,
  min,
  max,
  selectedPolityId,
  onJump,
}: {
  polities: Polity[];
  year: number;
  min: number;
  max: number;
  selectedPolityId: string | null;
  onJump: (polity: Polity) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const sorted = [...polities].sort((a, b) => a.period.startYear - b.period.startYear);
  const pct = (y: number) => ((Math.min(max, Math.max(min, y)) - min) / (max - min)) * 100;
  const hoveredPolity = sorted.find((p) => p.id === hovered);
  const hoveredIndex = sorted.findIndex((p) => p.id === hovered);

  return (
    <div className="relative mb-2" style={{ paddingInline: THUMB_INSET }}>
      <div className="relative" style={{ height: sorted.length * (BAND + GAP) - GAP }}>
        {sorted.map((p, i) => {
          const left = pct(p.period.startYear);
          const right = pct(p.period.endYear ?? max);
          const active = yearInRange(year, p.period);
          const selected = selectedPolityId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onJump(p)}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(p.id)}
              onBlur={() => setHovered(null)}
              aria-label={`${p.name}, ${formatDateRange(p.period)}. Jump to its first year.`}
              className={cn(
                "absolute rounded-[1px] transition-[opacity,box-shadow] duration-200 focus-visible:outline-none",
                selected && "ring-1 ring-paper ring-offset-1 ring-offset-ink",
              )}
              style={{
                left: `${left}%`,
                width: `${right - left}%`,
                top: i * (BAND + GAP),
                height: BAND,
                backgroundColor: lightenHex(p.accentColor, 0.25),
                opacity: active || hovered === p.id ? 1 : 0.32,
              }}
            />
          );
        })}

        <div
          className="pointer-events-none absolute -bottom-1 -top-1 w-px bg-paper/80"
          style={{ left: `${pct(year)}%` }}
          aria-hidden
        />

        {hoveredPolity && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap border border-paper/20 bg-ink px-2 py-1 font-sans text-[0.7rem] text-paper shadow-lg"
            style={{
              left: `${(pct(hoveredPolity.period.startYear) + pct(hoveredPolity.period.endYear ?? max)) / 2}%`,
              top: hoveredIndex * (BAND + GAP) - 4,
            }}
          >
            {hoveredPolity.name} · {formatDateRange(hoveredPolity.period)}
          </div>
        )}
      </div>
    </div>
  );
}
