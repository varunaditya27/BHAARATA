"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ButtonLink } from "@/components/primitives/Button";
import { Magnetic } from "@/components/primitives/Magnetic";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ENTRY_POINTS = [
  {
    index: "01",
    href: "/atlas",
    title: "The atlas",
    description:
      "Drag the timeline and watch kingdoms grow, shrink and disappear.",
  },
  {
    index: "02",
    href: "/chronology",
    title: "The timeline",
    description:
      "Every event in order, with each kingdom on its own line.",
  },
  {
    index: "03",
    href: "/polities",
    title: "The kingdoms",
    description:
      "One page per kingdom: its rulers, places, neighbours and evidence.",
  },
];

/**
 * Below-the-fold homepage closing section with GSAP ScrollTrigger
 * headline reveal and staggered entry cards (Presets #2 & #8).
 */
export function HomeClosing() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".gsap-closing-head", {
          opacity: 0,
          y: 28,
          duration: 0.65,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });

        gsap.from(".gsap-entry-card", {
          opacity: 0,
          y: 24,
          duration: 0.55,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-entry-grid",
            start: "top 86%",
            toggleActions: "play none none reverse",
          },
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6"
    >
      <div className="flex flex-col items-start gap-8 border-b border-border pb-14 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="gsap-closing-head font-display text-4xl text-ink md:text-5xl">
            Explore kingdoms across time.
          </h2>
          <p className="gsap-closing-head mt-4 font-sans leading-relaxed text-ink-muted">
            Those were four moments. In the atlas you can move to any year from
            600 to 1700, click a kingdom to read about it, and see where the
            information comes from.
          </p>
        </div>
        <div className="gsap-closing-head">
          <Magnetic className="inline-block">
            <ButtonLink
              href="/atlas"
              transitionTypes={NAV_FORWARD}
              variant="solid"
            >
              Open the atlas
            </ButtonLink>
          </Magnetic>
        </div>
      </div>

      <div className="gsap-entry-grid mt-12 grid gap-8 md:grid-cols-3">
        {ENTRY_POINTS.map((entry) => (
          <Link
            key={entry.href}
            href={entry.href}
            transitionTypes={NAV_FORWARD}
            className="gsap-entry-card group relative block border-t border-border pt-5 transition-transform duration-200 hover:-translate-y-1"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
              {entry.index}
            </span>
            <h3 className="mt-1 font-display text-xl text-ink transition-colors group-hover:text-territory-selected">
              {entry.title}
            </h3>
            <p className="mt-2 font-sans text-sm leading-relaxed text-ink-muted">
              {entry.description}
            </p>
          </Link>
        ))}
      </div>

      <p className="mt-12 font-sans text-xs text-ink-muted">
        Kingdom borders come from a research collection; descriptions, rulers,
        battles and places from Wikipedia and Wikidata. Two things are still
        drawn by hand: the Chera outline and the example routes.
      </p>
    </section>
  );
}
