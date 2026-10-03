"use client";

import { AnimatePresence, motion, useAnimationControls, useDragControls } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Shared } from "@/components/primitives/Shared";
import { images, type ImageKey } from "@/lib/data/images";
import { events, getRulersForPolity } from "@/lib/data/prototype";
import { formatDateRange } from "@/lib/domain/time";
import type { Polity } from "@/lib/domain/types";
import { MOBILE_QUERY, useMediaQuery } from "@/lib/utils/use-media-query";
import { NAV_FORWARD, transitionNames } from "@/lib/utils/view-transition";

export type EntityPreviewPanelProps = {
  polity: Polity | null;
  onClose: () => void;
};

/**
 * Map-native preview (IMPLEMENTATION_PLAN.md §11). Selecting a polity does
 * not navigate — it surfaces this panel. Only "Explore" navigates. Stat
 * counts are real counts from our own (small, illustrative) dataset,
 * never invented numbers.
 *
 * Desktop: a card floating over the map's right edge. Phone: a bottom
 * sheet that peeks name + dates + the explore button, and drags up for
 * the rest — the map stays visible above it either way.
 */
export function EntityPreviewPanel({ polity, onClose }: EntityPreviewPanelProps) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  return (
    <AnimatePresence>
      {polity &&
        (isMobile ? (
          <MobileSheet key={polity.id} polity={polity} onClose={onClose} />
        ) : (
          <motion.aside
            key={polity.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute right-4 top-4 z-20 w-[320px] overflow-hidden border border-paper/15 bg-ink text-paper shadow-xl"
          >
            <CloseButton onClose={onClose} />
            <HeroStrip polity={polity} />
            <div className="p-5">
              <TitleBlock polity={polity} />
              <Details polity={polity} />
              <ExploreLink polity={polity} className="mt-5" />
            </div>
          </motion.aside>
        ))}
    </AnimatePresence>
  );
}

const PEEK = 176;

function MobileSheet({ polity, onClose }: { polity: Polity; onClose: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const controls = useAnimationControls();
  const dragControls = useDragControls();
  const [height, setHeight] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const collapsedY = Math.max(0, height - PEEK);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (height === 0) return;
    void controls.start({ y: expanded ? 0 : collapsedY, transition: { type: "spring", damping: 32, stiffness: 320 } });
  }, [controls, expanded, collapsedY, height]);

  return (
    <motion.aside
      ref={ref}
      initial={{ y: "100%" }}
      animate={controls}
      exit={{ y: "100%", transition: { duration: 0.22 } }}
      drag="y"
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: collapsedY }}
      dragElastic={0.06}
      onDragEnd={(_, info) => {
        const goingUp = info.offset.y < -40 || info.velocity.y < -350;
        const goingDown = info.offset.y > 40 || info.velocity.y > 350;
        const next = goingUp ? true : goingDown ? false : expanded;
        setExpanded(next);
        // Same target as before the drag still needs an explicit snap back.
        void controls.start({ y: next ? 0 : collapsedY });
      }}
      className="absolute inset-x-0 bottom-0 z-20 flex max-h-[82%] flex-col border-t border-paper/20 bg-ink text-paper shadow-[0_-12px_40px_rgba(0,0,0,0.35)]"
    >
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="shrink-0 touch-none cursor-grab px-5 pb-3 pt-2 active:cursor-grabbing"
      >
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse details" : "Expand details"}
          className="mx-auto mb-3 block h-1.5 w-10 rounded-full bg-paper/30"
        />
        <div className="flex items-start justify-between gap-3">
          <TitleBlock polity={polity} compact />
          <CloseButton onClose={onClose} inline />
        </div>
        <ExploreLink polity={polity} className="mt-3" />
      </div>
      <div className="min-h-0 overflow-y-auto px-5 pb-6">
        <HeroStrip polity={polity} />
        <Details polity={polity} />
      </div>
    </motion.aside>
  );
}

function CloseButton({ onClose, inline }: { onClose: () => void; inline?: boolean }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
      className={
        inline
          ? "shrink-0 font-sans text-xs text-paper/70 hover:text-paper"
          : "absolute right-3 top-3 z-10 font-sans text-xs text-paper/70 hover:text-paper"
      }
    >
      Close
    </button>
  );
}

function HeroStrip({ polity }: { polity: Polity }) {
  const hero = polity.heroImageKey ? images[polity.heroImageKey as ImageKey] : undefined;
  if (!hero) return null;
  return (
    <div className="relative h-32 w-full">
      <Shared name={transitionNames.polityPhoto(polity.slug)}>
        <div className="absolute inset-0">
          <Image src={hero.file} alt={hero.alt} fill sizes="320px" className="object-cover" />
        </div>
      </Shared>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
    </div>
  );
}

function TitleBlock({ polity, compact }: { polity: Polity; compact?: boolean }) {
  return (
    <div>
      <Eyebrow className="text-paper/60">{polity.polityType}</Eyebrow>
      <h2 className={`mt-1 font-display text-paper ${compact ? "text-xl" : "text-2xl"}`}>
        {polity.name}
        {compact && polity.nativeName && (
          <span lang="und" className="ml-2 font-indic-display text-base text-paper/60">{polity.nativeName}</span>
        )}
      </h2>
      {!compact && polity.nativeName && (
        <p lang="und" className="font-indic-display text-base text-paper/70">{polity.nativeName}</p>
      )}
      <p className="mt-1 font-sans text-sm text-paper/70">{formatDateRange(polity.period)}</p>
    </div>
  );
}

function Details({ polity }: { polity: Polity }) {
  const rulers = getRulersForPolity(polity.id);
  const relatedEvents = events.filter((e) => e.polityIds.includes(polity.id));
  return (
    <>
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
        <span>{rulers.length} {rulers.length === 1 ? "ruler" : "rulers"} recorded</span>
        <span>{relatedEvents.length} {relatedEvents.length === 1 ? "event" : "events"} recorded</span>
      </div>
      <div className="mt-3">
        <Badge tone="uncertainty">Illustrative prototype data</Badge>
      </div>
    </>
  );
}

function ExploreLink({ polity, className }: { polity: Polity; className?: string }) {
  return (
    <Link
      href={`/polities/${polity.slug}`}
      transitionTypes={NAV_FORWARD}
      className={`block bg-paper px-4 py-2 text-center font-sans text-sm font-medium text-ink hover:bg-paper/90 ${className ?? ""}`}
    >
      Explore {polity.name} →
    </Link>
  );
}
