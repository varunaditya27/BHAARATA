"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getEraForYear, PROTOTYPE_PERIOD_MARKERS, PROTOTYPE_YEAR_RANGE } from "@/lib/geo/historical-state";

export type TimelineChangeSource = "manual" | "auto";

export type TimelineScrubberProps = {
  year: number;
  onYearChange: (year: number, source: TimelineChangeSource) => void;
  /** Rendered directly above the range track, sharing its width and
   * x-scale — the atlas puts the kingdom lifespan strip here. */
  aboveTrack?: React.ReactNode;
};

/** The scrubber's cursor position isn't a historical claim, so it gets its
 * own plain formatter rather than borrowing DateRange's confidence model. */
function formatCursorYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
}

const PLAY_STEP_YEARS = 2;
const PLAY_INTERVAL_MS = 120;

/**
 * The only control that changes "when". A native <input type="range">
 * gives keyboard operability (arrow keys, Home/End) for free — don't
 * replace it with a custom drag-only widget (PROJECT_BIBLE.md §17:
 * keyboard interaction must work). Auto-play respects reduced motion by
 * just stepping the year value — no animated transition is skipped,
 * because none is owned by this component (the map handles its own
 * transitions and already resolves prefers-reduced-motion separately).
 */
export function TimelineScrubber({ year, onYearChange, aboveTrack }: TimelineScrubberProps) {
  const { min, max } = PROTOTYPE_YEAR_RANGE;
  const [playing, setPlaying] = useState(false);
  const yearRef = useRef(year);

  useEffect(() => {
    yearRef.current = year;
  }, [year]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const next = yearRef.current + PLAY_STEP_YEARS;
      if (next > max) {
        setPlaying(false);
        return;
      }
      onYearChange(next, "auto");
    }, PLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [playing, max, onYearChange]);

  return (
    <div className="flex w-full items-center gap-4">
      <button
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Pause" : "Play through time"}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-paper/30 text-paper hover:bg-paper/10"
      >
        {playing ? <Pause size={14} /> : <Play size={14} className="translate-x-0.5" />}
      </button>

      <div className="flex-1">
        <div className="mb-1 h-4 font-sans text-[0.65rem] uppercase tracking-wide text-paper/60 sm:hidden">
          {getEraForYear(year)}
        </div>
        <div className="relative mb-1 hidden h-4 font-sans text-[0.65rem] uppercase tracking-wide text-paper/50 sm:block">
          {PROTOTYPE_PERIOD_MARKERS.map((marker) => (
            <span
              key={marker.year}
              className="absolute -translate-x-1/2"
              style={{ left: `${((marker.year - min) / (max - min)) * 100}%` }}
            >
              {marker.label}
            </span>
          ))}
        </div>
        {aboveTrack}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={year}
          onChange={(e) => {
            setPlaying(false);
            onYearChange(Number(e.target.value), "manual");
          }}
          aria-label="Year"
          className="bh-timeline-range w-full"
          style={{ "--bh-progress": `${((year - min) / (max - min)) * 100}%` } as React.CSSProperties}
        />
      </div>

      <div className="w-[4.5rem] shrink-0 text-right font-display text-base text-paper sm:w-20 sm:text-lg">
        {formatCursorYear(year)}
      </div>
    </div>
  );
}
