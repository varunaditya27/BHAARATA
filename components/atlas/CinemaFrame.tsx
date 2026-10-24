"use client";

import { AnimatePresence, motion } from "motion/react";
import { Odometer } from "@/components/primitives/Odometer";
import { getEraForYear } from "@/lib/geo/historical-state";

/**
 * Letterbox bars for cinema view: everything but the map steps away, and
 * the year and era sit in the lower bar like a title in a film. The bars
 * slide in from the edges (transform only).
 */
export function CinemaFrame({ on, year, onExit }: { on: boolean; year: number; onExit: () => void }) {
  return (
    <AnimatePresence>
      {on && (
        <>
          <motion.div
            key="top"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[9vh] bg-black"
          />
          <motion.div
            key="bottom"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 z-30 flex h-[13vh] items-center justify-between bg-black px-6 text-paper md:px-10"
          >
            <p className="font-sans text-sm text-paper/70">{getEraForYear(year)}</p>
            <div className="font-display text-4xl md:text-5xl">
              <Odometer value={year} suffix={year < 0 ? "BCE" : "CE"} durationMs={300} />
            </div>
            <button
              onClick={onExit}
              className="font-sans text-xs text-paper/60 underline underline-offset-4 hover:text-paper"
            >
              Exit full screen <span className="no-underline">(C)</span>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
