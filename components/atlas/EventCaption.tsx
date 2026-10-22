"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { getPolityBySlug } from "@/lib/data/prototype";
import { formatDateRange } from "@/lib/domain/time";
import type { HistoricalEvent } from "@/lib/domain/types";
import { lightenHex } from "@/lib/utils/color";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

/**
 * Documentary lower-third: appears when playback (or a click on a
 * timeline mark) reaches an event. A rule in the kingdom's colour, the
 * date, the title, one line of summary. It doesn't block the map.
 */
/** `raised` lifts it clear of the cinema-view letterbox bar. */
export function EventCaption({ event, raised = false }: { event: HistoricalEvent | null; raised?: boolean }) {
  const polity = event?.polityIds[0] ? getPolityBySlug(event.polityIds[0]) : undefined;
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={`pointer-events-none absolute left-3 right-3 z-40 md:left-6 md:right-auto md:max-w-md ${raised ? "bottom-[15vh]" : "bottom-14 md:bottom-10"}`}
        >
          <div className="pointer-events-auto flex gap-4 bg-ink p-4 text-paper shadow-xl">
            <span
              className="w-1 shrink-0 self-stretch"
              style={{ backgroundColor: lightenHex(polity?.accentColor ?? "#b85c38", 0.2) }}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="font-sans text-xs text-paper/70">
                {formatDateRange(event.period)}
                {polity && <>, {polity.name}</>}
              </p>
              <p className="mt-1 font-display text-xl leading-snug">{event.title}</p>
              <p className="mt-1.5 line-clamp-2 font-sans text-sm leading-relaxed text-paper/75">{event.summary}</p>
              <Link
                href={`/chronology#${event.slug}`}
                transitionTypes={NAV_FORWARD}
                className="mt-2 inline-block font-sans text-xs text-paper/80 underline underline-offset-4 hover:text-paper"
              >
                Read more in the chronology
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
