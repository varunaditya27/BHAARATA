"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";
import { ButtonLink } from "@/components/primitives/Button";
import { Magnetic } from "@/components/primitives/Magnetic";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface EntryPoint {
  index: string;
  href: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  cursorLabel: string;
}

const ENTRY_POINTS: EntryPoint[] = [
  {
    index: "01",
    href: "/atlas",
    title: "The atlas",
    subtitle: "Space & Borders · 600–1700 CE",
    description:
      "Drag the timeline and watch kingdoms grow, shrink and disappear across eleven centuries.",
    cta: "Open the atlas",
    cursorLabel: "Explore Map",
  },
  {
    index: "02",
    href: "/chronology",
    title: "The timeline",
    subtitle: "Dynastic Lanes & Battles",
    description:
      "Every event in order, with each kingdom on its own line and dated battles below.",
    cta: "View the timeline",
    cursorLabel: "Inspect Lanes",
  },
  {
    index: "03",
    href: "/polities",
    title: "The kingdoms",
    subtitle: "54 Polities · Primary Evidence",
    description:
      "One page per kingdom: its rulers, places, neighbours and surviving stone or copper-plate evidence.",
    cta: "Browse kingdoms",
    cursorLabel: "Browse Index",
  },
];

function ClosingEntryCard({
  entry,
  reducedMotion,
}: {
  entry: EntryPoint;
  reducedMotion: boolean;
}) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const rxTo = useRef<gsap.QuickToFunc | null>(null);
  const ryTo = useRef<gsap.QuickToFunc | null>(null);

  useGSAP(
    () => {
      if (!shellRef.current || reducedMotion) return;
      gsap.set(shellRef.current, { transformPerspective: 950 });
      rxTo.current = gsap.quickTo(shellRef.current, "rotateX", {
        duration: 0.4,
        ease: "power3.out",
      });
      ryTo.current = gsap.quickTo(shellRef.current, "rotateY", {
        duration: 0.4,
        ease: "power3.out",
      });
    },
    { scope: shellRef, dependencies: [reducedMotion] },
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !shellRef.current) return;
    const rect = shellRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nx = (x / rect.width) * 2 - 1;
    const ny = (y / rect.height) * 2 - 1;

    ryTo.current?.(nx * 3.5);
    rxTo.current?.(-ny * 3.0);

    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(380px circle at ${x}px ${y}px, rgba(150, 52, 26, 0.1), transparent 70%)`;
    }
  };

  const handleMouseLeave = () => {
    if (reducedMotion) return;
    rxTo.current?.(0);
    ryTo.current?.(0);
  };

  return (
    <div
      ref={shellRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="gsap-entry-card rounded-[6px] border border-border bg-paper/60 p-1.5 shadow-[0_20px_50px_-28px_rgba(20,17,13,0.28)] will-change-transform"
    >
      <Link
        href={entry.href}
        transitionTypes={NAV_FORWARD}
        data-cursor-label={entry.cursorLabel}
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[3px] border border-border/80 bg-paper p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-colors duration-300 hover:border-territory-selected/60 sm:p-7"
      >
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-territory-selected">
              {entry.index}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
              {entry.subtitle}
            </span>
          </div>

          <h3 className="mt-4 font-display text-2xl text-ink transition-colors group-hover:text-territory-selected">
            {entry.title}
          </h3>
          <p className="mt-2.5 font-sans text-sm leading-relaxed text-ink-muted">
            {entry.description}
          </p>
        </div>

        <div className="relative z-10 mt-7 flex items-center justify-between border-t border-border/60 pt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition-colors group-hover:text-territory-selected">
          <span>{entry.cta}</span>
          <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-paper text-ink transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:border-territory-selected group-hover:bg-territory-selected group-hover:text-paper"
          >
            →
          </span>
        </div>
      </Link>
    </div>
  );
}

/**
 * Below-the-fold homepage closing section with GSAP ScrollTrigger
 * masked word-by-word headline reveal and Double-Bezel interactive entry cards.
 */
export function HomeClosing() {
  const rootRef = useRef<HTMLElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const headingWords = ["Explore", "kingdoms", "across", "time."];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".gsap-closing-word",
          { yPercent: 112, autoAlpha: 0, filter: "blur(6px)" },
          {
            yPercent: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 0.82,
            stagger: 0.055,
            ease: "power4.out",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          },
        );

        gsap.fromTo(
          ".gsap-closing-head",
          { autoAlpha: 0, y: 24, filter: "blur(4px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.72,
            stagger: 0.1,
            delay: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );

        gsap.fromTo(
          ".gsap-entry-card",
          { autoAlpha: 0, y: 34, scale: 0.98 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.78,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".gsap-entry-grid",
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="flex flex-col items-start gap-8 border-b border-border pb-14 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="gsap-closing-head font-mono text-[11px] uppercase tracking-[0.2em] text-territory-selected">
            Interactive Historical Atlas
          </p>
          <h2 className="mt-2 font-display text-4xl leading-[1.08] text-ink md:text-5xl">
            {headingWords.map((word, idx) => (
              <span
                key={word}
                className="mr-[0.26em] inline-block overflow-hidden align-bottom pb-[0.05em]"
              >
                <span
                  className={`gsap-closing-word inline-block will-change-transform ${
                    idx >= 2 ? "italic text-territory-selected" : ""
                  }`}
                >
                  {word}
                </span>
              </span>
            ))}
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
              Open the atlas →
            </ButtonLink>
          </Magnetic>
        </div>
      </div>

      <div className="gsap-entry-grid mt-12 grid gap-6 md:grid-cols-3">
        {ENTRY_POINTS.map((entry) => (
          <ClosingEntryCard
            key={entry.href}
            entry={entry}
            reducedMotion={reducedMotion}
          />
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
