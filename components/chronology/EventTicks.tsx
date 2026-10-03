"use client";

import { useState } from "react";
import { formatDateRange } from "@/lib/domain/time";
import type { HistoricalEvent } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";

/** Same inset as LifespanStrip — keeps ticks over the thumb position for
 * their year rather than over the raw track edge. */
const THUMB_INSET = 6.5;

/**
 * A small mark on the timeline at each recorded event's start year.
 * Hover/focus names it; clicking jumps there and plays its caption.
 * Marks for events whose span includes the current year are lit.
 */
export function EventTicks({
  events,
  year,
  min,
  max,
  onJump,
}: {
  events: HistoricalEvent[];
  year: number;
  min: number;
  max: number;
  onJump: (event: HistoricalEvent) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const pct = (y: number) => ((Math.min(max, Math.max(min, y)) - min) / (max - min)) * 100;

  return (
    <div className="relative h-3" style={{ marginInline: THUMB_INSET }}>
      {events.map((e) => {
        const current = year >= e.period.startYear && year <= (e.period.endYear ?? e.period.startYear);
        return (
          <div key={e.id} className="absolute top-0 -translate-x-1/2" style={{ left: `${pct(e.period.startYear)}%` }}>
            <button
              onClick={() => onJump(e)}
              onMouseEnter={() => setHovered(e.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(e.id)}
              onBlur={() => setHovered(null)}
              aria-label={`${e.title}, ${formatDateRange(e.period)}. Jump to it.`}
              className="group flex h-3 w-3 items-start justify-center focus-visible:outline-none"
            >
              <span
                className={cn(
                  "block h-2 w-2 rotate-45 border transition-colors",
                  current ? "border-paper bg-territory" : "border-paper/50 bg-ink group-hover:bg-paper/60",
                  "group-focus-visible:ring-1 group-focus-visible:ring-paper",
                )}
              />
            </button>
            {hovered === e.id && (
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap border border-paper/20 bg-ink px-2 py-1 font-sans text-[0.7rem] text-paper shadow-lg">
                {e.title}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
