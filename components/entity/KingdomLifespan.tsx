"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { formatDateRange } from "@/lib/domain/time";
import type { Polity } from "@/lib/domain/types";
import { contemporariesOf } from "./contemporaries";

const DEFAULT_VISIBLE = 8;

function formatYearShort(year: number) {
  return year < 0 ? `${Math.abs(year)} BCE` : `${year}`;
}

/**
 * Structured two-column lifespan comparison: fixed kingdom labels on the left,
 * dynamic unclipped timeline track on the right with shared-era highlighting.
 */
export function KingdomLifespan({
  polity,
  polities,
}: {
  polity: Polity;
  polities: Polity[];
}) {
  const prefersReducedMotion = useReducedMotion();
  const [showAll, setShowAll] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const valid =
    polity.period.startQualifier !== "unknown" &&
    polity.period.endQualifier !== "unknown" &&
    polity.period.endYear !== null;

  const all = useMemo(
    () => (valid ? contemporariesOf(polity, polities) : []),
    [polity, polities, valid]
  );

  const ranked = useMemo(
    () =>
      [...all]
        .sort((a, b) => b.to - b.from - (a.to - a.from))
        .slice(0, showAll ? all.length : DEFAULT_VISIBLE)
        .sort((a, b) => a.from - b.from),
    [all, showAll]
  );

  if (!valid || polity.period.endYear === null) {
    return (
      <p className="text-sm text-ink-muted">
        The full date range is not known.
      </p>
    );
  }

  const focalStart = polity.period.startYear;
  const focalEnd = polity.period.endYear;
  const focalSpan = Math.max(1, focalEnd - focalStart);

  // Anchor the timeline around the focal kingdom with clean breathing room
  const pad = Math.max(40, Math.round(focalSpan * 0.14));
  const minYear = Math.floor((focalStart - pad) / 50) * 50;
  const maxYear = Math.ceil((focalEnd + pad) / 50) * 50;
  const totalSpan = Math.max(1, maxYear - minYear);

  const pct = (y: number) =>
    ((Math.min(maxYear, Math.max(minYear, y)) - minYear) / totalSpan) * 100;

  // Generate 4–6 clean century/half-century ticks inside [minYear, maxYear]
  const step = totalSpan > 700 ? 200 : totalSpan > 300 ? 100 : 50;
  const firstTick = Math.ceil(minYear / step) * step;
  const ticks: number[] = [];
  for (let y = firstTick; y <= maxYear; y += step) {
    ticks.push(y);
  }

  const focalLeft = pct(focalStart);
  const focalWidth = Math.max(1.5, pct(focalEnd) - focalLeft);

  return (
    <div className="border border-border bg-paper-raised p-4 sm:p-5">
      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3 text-[11px] text-ink-muted">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-4"
              style={{ backgroundColor: polity.accentColor }}
            />
            <span>{polity.name}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 bg-ink/70" />
            <span>Years together</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 bg-ink/20" />
            <span>Rest of their span</span>
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
          {all.length} overlapping {all.length === 1 ? "kingdom" : "kingdoms"}
        </span>
      </div>

      {/* Axis Header */}
      <div className="grid grid-cols-[140px_minmax(0,1fr)] items-end gap-3 pb-2 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
          Kingdom
        </span>
        <div className="relative h-5 border-b border-border">
          {ticks.map((t) => {
            const left = pct(t);
            if (left < 3 || left > 97) return null;
            return (
              <span
                key={t}
                className="absolute bottom-1 -translate-x-1/2 font-mono text-[10px] text-ink-muted"
                style={{ left: `${left}%` }}
              >
                {formatYearShort(t)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Timeline Body */}
      <div className="relative">
        {/* Focal Kingdom Row */}
        <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-3 border-b border-ink/15 py-3 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5">
          <div className="min-w-0 pr-2">
            <p className="truncate font-sans text-xs font-semibold text-ink">
              {polity.name}
            </p>
            <p className="font-mono text-[10px] text-ink-muted">
              {formatDateRange(polity.period)}
            </p>
          </div>
          <div className="relative h-5 bg-paper">
            {ticks.map((t) => (
              <span
                key={`grid-focal-${t}`}
                className="absolute inset-y-0 w-px bg-border/60"
                style={{ left: `${pct(t)}%` }}
                aria-hidden
              />
            ))}
            <motion.div
              initial={prefersReducedMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{
                left: `${focalLeft}%`,
                width: `${focalWidth}%`,
                backgroundColor: polity.accentColor,
                transformOrigin: "left center",
              }}
              className="absolute inset-y-1 shadow-xs"
            />
          </div>
        </div>

        {/* Contemporary Rows */}
        {ranked.length > 0 ? (
          <ul className="divide-y divide-border/50">
            {ranked.map(({ polity: p, from, to }) => {
              const pStart = p.period.startYear;
              const pEnd = p.period.endYear ?? maxYear;
              const fullLeft = pct(pStart);
              const fullWidth = Math.max(1, pct(pEnd) - fullLeft);
              const overlapLeft = pct(from);
              const overlapWidth = Math.max(1.2, pct(to) - overlapLeft);
              const overlapYears = Math.max(1, to - from);
              const clippedLeft = pStart < minYear;
              const clippedRight = pEnd > maxYear;
              const isHovered = hoveredId === p.id;

              return (
                <li
                  key={p.id}
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-3 py-2.5 transition-colors hover:bg-paper sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5"
                >
                  <div className="min-w-0 pr-2">
                    <Link
                      href={`/polities/${p.slug}`}
                      className="block truncate font-sans text-xs font-medium text-ink hover:text-territory-selected hover:underline"
                    >
                      {p.name}
                    </Link>
                    <p className="font-mono text-[10px] text-ink-soft">
                      {formatYearShort(from)}–{formatYearShort(to)} ·{" "}
                      {overlapYears} yrs
                    </p>
                  </div>

                  <div className="relative h-5">
                    {/* Vertical century grid ticks */}
                    {ticks.map((t) => (
                      <span
                        key={`grid-${p.id}-${t}`}
                        className="absolute inset-y-0 w-px bg-border/45"
                        style={{ left: `${pct(t)}%` }}
                        aria-hidden
                      />
                    ))}

                    {/* Soft focal window highlight */}
                    <span
                      className="absolute inset-y-0 bg-ink/[0.035]"
                      style={{
                        left: `${focalLeft}%`,
                        width: `${focalWidth}%`,
                      }}
                      aria-hidden
                    />

                    {/* Full span of contemporary at low opacity */}
                    <div
                      className="absolute top-1.5 h-2 opacity-25"
                      style={{
                        left: `${fullLeft}%`,
                        width: `${fullWidth}%`,
                        backgroundColor: p.accentColor,
                      }}
                    />

                    {/* Shared years bar */}
                    <motion.div
                      initial={prefersReducedMotion ? false : { scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute top-1 h-3"
                      style={{
                        left: `${overlapLeft}%`,
                        width: `${overlapWidth}%`,
                        backgroundColor: p.accentColor,
                        transformOrigin: "left center",
                      }}
                    />

                    {/* Edge continuation indicators instead of hard clipping */}
                    {clippedLeft && (
                      <span className="absolute left-0.5 top-0.5 bg-paper-raised/90 px-1 font-mono text-[9px] text-ink-soft">
                        ← {formatYearShort(pStart)}
                      </span>
                    )}
                    {clippedRight && (
                      <span className="absolute right-0.5 top-0.5 bg-paper-raised/90 px-1 font-mono text-[9px] text-ink-soft">
                        {formatYearShort(pEnd)} →
                      </span>
                    )}

                    {/* Hover readout */}
                    {isHovered && (
                      <span
                        className="pointer-events-none absolute -top-5 z-10 whitespace-nowrap border border-ink bg-ink px-1.5 py-0.5 font-mono text-[10px] text-paper"
                        style={{
                          left: `${Math.min(82, Math.max(0, overlapLeft))}%`,
                        }}
                      >
                        {overlapYears} yrs together ({formatYearShort(from)}–
                        {formatYearShort(to)})
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="py-4 font-sans text-xs text-ink-muted">
            No other kingdom in the atlas existed at the same time.
          </p>
        )}
      </div>

      {/* Expand / Collapse */}
      {all.length > DEFAULT_VISIBLE && (
        <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
          <span className="font-sans text-xs text-ink-muted">
            Showing {ranked.length} of {all.length} overlapping kingdoms
          </span>
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="border border-border bg-paper px-3 py-1 font-sans text-xs text-ink transition-colors hover:border-ink"
          >
            {showAll
              ? "Show fewer"
              : `Show all ${all.length} kingdoms`}
          </button>
        </div>
      )}
    </div>
  );
}
