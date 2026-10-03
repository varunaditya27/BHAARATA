"use client";

import { AnimatePresence, motion } from "motion/react";

/**
 * A brief full-bleed flash when auto-play crosses into a new named era.
 * Only fires during auto-play, not on
 * manual scrubbing — see the trigger logic in AtlasView — so it reads as
 * a cinematic beat, not an interruption every time someone drags the
 * slider.
 */
export function EraTitleCard({ era, year }: { era: string | null; year: number }) {
  return (
    <AnimatePresence>
      {era && (
        <motion.div
          key={era}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-ink/70"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-center"
          >
            <p className="font-sans text-sm uppercase tracking-[0.3em] text-paper/70">
              {year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`}
            </p>
            <h2 className="mt-2 font-display text-5xl uppercase tracking-wide text-paper md:text-6xl">
              {era}
            </h2>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
