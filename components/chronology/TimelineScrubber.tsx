"use client";

import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Odometer } from "@/components/primitives/Odometer";
import { getEraForYear, PROTOTYPE_PERIOD_MARKERS, PROTOTYPE_YEAR_RANGE } from "@/lib/geo/historical-state";

export type TimelineChangeSource = "manual" | "auto";

export type TimelineScrubberProps = {
  year: number;
  onYearChange: (year: number, source: TimelineChangeSource) => void;
  /** Rendered directly above the range track, sharing its width and
   * x-scale — the atlas puts the kingdom lifespan strip here. */
  aboveTrack?: React.ReactNode;
  /** Years playback lands on exactly and lingers at (event dates), so an
   * event isn't skipped over at 2 years a tick. */
  holdYears?: number[];
  /** Controlled play state (the atlas binds Space to it). Uncontrolled if omitted. */
  playing?: boolean;
  onPlayingChange?: (playing: boolean) => void;
};

/** The scrubber's cursor position isn't a historical claim, so it gets its
 * own plain formatter rather than borrowing DateRange's confidence model. */
function formatCursorYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
}

const PLAY_STEP_YEARS = 2;
const PLAY_INTERVAL_MS = 120;
const HOLD_MS = 2400;

/**
 * The only control that changes "when". A native <input type="range">
 * gives keyboard operability (arrow keys, Home/End) for free — don't
 * replace it with a custom drag-only widget (PROJECT_BIBLE.md §17:
 * keyboard interaction must work). Auto-play respects reduced motion by
 * just stepping the year value — no animated transition is skipped,
 * because none is owned by this component (the map handles its own
 * transitions and already resolves prefers-reduced-motion separately).
 */
export function TimelineScrubber({
  year,
  onYearChange,
  aboveTrack,
  holdYears = [],
  playing: playingProp,
  onPlayingChange,
}: TimelineScrubberProps) {
  const { min, max } = PROTOTYPE_YEAR_RANGE;
  const [playingState, setPlayingState] = useState(false);
  const playing = playingProp ?? playingState;
  const onPlayingChangeRef = useRef(onPlayingChange);
  useEffect(() => {
    onPlayingChangeRef.current = onPlayingChange;
  }, [onPlayingChange]);
  const setPlaying = useCallback((next: boolean) => {
    setPlayingState(next);
    onPlayingChangeRef.current?.(next);
  }, []);
  const yearRef = useRef(year);
  const holdUntilRef = useRef(0);
  const holdYearsRef = useRef(holdYears);

  useEffect(() => {
    yearRef.current = year;
  }, [year]);

  useEffect(() => {
    holdYearsRef.current = holdYears;
  }, [holdYears]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      if (performance.now() < holdUntilRef.current) return;
      const current = yearRef.current;
      const next = current + PLAY_STEP_YEARS;
      if (next > max) {
        setPlaying(false);
        return;
      }
      const hold = holdYearsRef.current.find((y) => y > current && y <= next);
      if (hold !== undefined) {
        holdUntilRef.current = performance.now() + HOLD_MS;
        onYearChange(hold, "auto");
        return;
      }
      onYearChange(next, "auto");
    }, PLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [playing, max, onYearChange, setPlaying]);

  return (
    <div className="flex w-full items-center gap-4">
      <button
        onClick={() => setPlaying(!playing)}
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
              className="absolute -translate-x-1/2 whitespace-nowrap"
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
          aria-valuetext={formatCursorYear(year)}
          className="bh-timeline-range w-full"
          style={{ "--bh-progress": `${((year - min) / (max - min)) * 100}%` } as React.CSSProperties}
        />
      </div>

      <div className="w-[4.5rem] shrink-0 text-right font-display text-lg text-paper sm:w-24 sm:text-2xl">
        <Odometer value={year} suffix={year < 0 ? "BCE" : "CE"} durationMs={260} />
      </div>
    </div>
  );
}
