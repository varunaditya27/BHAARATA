"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { TransitionLink } from "@/components/primitives/TransitionLink";
import { images, type ImageKey } from "@/lib/data/images";
import { formatDateRange } from "@/lib/domain/time";
import type { Polity } from "@/lib/domain/types";
import { events, getRulersForPolity } from "@/lib/data/prototype";
import { polityPhotoTransitionName } from "@/lib/utils/view-transition";

export type EntityPreviewPanelProps = {
  polity: Polity | null;
  onClose: () => void;
};

/**
 * Map-native preview (IMPLEMENTATION_PLAN.md §11). Selecting a polity does
 * not navigate — it surfaces this panel. Only "Open full record" navigates.
 * Stat counts are real counts from our own (small, illustrative) dataset,
 * never invented numbers.
 */
export function EntityPreviewPanel({ polity, onClose }: EntityPreviewPanelProps) {
  const hero = polity?.heroImageKey ? images[polity.heroImageKey as ImageKey] : undefined;
  const rulers = polity ? getRulersForPolity(polity.id) : [];
  const relatedEvents = polity ? events.filter((e) => e.polityIds.includes(polity.id)) : [];

  return (
    <AnimatePresence>
      {polity && (
        <motion.aside
          key={polity.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="absolute right-4 top-4 w-[320px] overflow-hidden border border-paper/15 bg-ink text-paper shadow-xl"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 font-sans text-xs text-paper/70 hover:text-paper"
          >
            Close
          </button>

          {hero && (
            <div className="relative h-32 w-full">
              <Image
                src={hero.file}
                alt={hero.alt}
                fill
                sizes="320px"
                className="object-cover"
                style={{ viewTransitionName: polityPhotoTransitionName(polity.slug) }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
            </div>
          )}

          <div className="p-5">
            <Eyebrow className="text-paper/60">{polity.polityType}</Eyebrow>
            <h2 className="mt-1 font-display text-2xl text-paper">{polity.name}</h2>
            {polity.nativeName && (
              <p className="font-devanagari-display text-base text-paper/70">{polity.nativeName}</p>
            )}
            <p className="mt-2 font-sans text-sm text-paper/70">{formatDateRange(polity.period)}</p>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-paper/15 pt-4 font-sans text-sm">
              <div>
                <p className="text-paper/50">Capital</p>
                <p className="text-paper">{polity.capitals[0]}</p>
              </div>
              <div>
                <p className="text-paper/50">Region</p>
                <p className="text-paper">{polity.region}</p>
              </div>
              {polity.language && (
                <div>
                  <p className="text-paper/50">Language</p>
                  <p className="text-paper">{polity.language}</p>
                </div>
              )}
              {polity.religion && (
                <div>
                  <p className="text-paper/50">Religion</p>
                  <p className="text-paper">{polity.religion}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-5 border-t border-paper/15 pt-3 font-sans text-xs text-paper/60">
              <span>{rulers.length} rulers recorded</span>
              <span>{relatedEvents.length} events recorded</span>
            </div>

            <div className="mt-3">
              <Badge tone="uncertainty">Illustrative prototype data</Badge>
            </div>

            <TransitionLink
              href={`/polities/${polity.slug}`}
              className="mt-5 block bg-paper px-4 py-2 text-center font-sans text-sm font-medium text-ink hover:bg-paper/90"
            >
              Explore {polity.name} →
            </TransitionLink>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
