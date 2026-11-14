"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ReactLenis } from "lenis/react";
import { motion, useReducedMotion } from "motion/react";
import { KingdomEmblem } from "@/components/entity/KingdomEmblem";
import { Odometer } from "@/components/primitives/Odometer";
import { useAtlasData, useAtlasAccess } from "@/components/layout/AtlasDataProvider";
import { STORY_OVERVIEW, storyChapters } from "@/lib/data/story";
import { NAV_FORWARD } from "@/lib/utils/view-transition";
import { AstrolabeOverlay } from "./AstrolabeOverlay";
import type { MapTelemetry } from "./StoryMap";
import { Wordmark } from "./Wordmark";

const StoryMap = dynamic(() => import("./StoryMap").then((m) => m.StoryMap), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-ink" />,
});

const GHOST_SCRIPTS = [
  { text: "भारत", left: "6%", top: "14%", size: "clamp(4rem, 10vw, 8.5rem)", delay: 0.1 },
  { text: "பாரதம்", left: "34%", top: "64%", size: "clamp(3.2rem, 8vw, 6.5rem)", delay: 0.25 },
  { text: "ಭಾರತ", left: "18%", top: "38%", size: "clamp(3.5rem, 8.5vw, 7rem)", delay: 0.4 },
  { text: "భారత", left: "44%", top: "18%", size: "clamp(3.2rem, 7.5vw, 6rem)", delay: 0.55 },
];

const ERA_GLINTS = [
  "radial-gradient(54% 48% at 82% 16%, rgba(255,196,128,0.22), rgba(255,170,90,0.07) 45%, transparent 72%)",
  "radial-gradient(56% 50% at 76% 24%, rgba(224,122,95,0.25), rgba(150,52,26,0.08) 48%, transparent 74%)",
  "radial-gradient(56% 50% at 84% 32%, rgba(92,168,176,0.24), rgba(58,90,120,0.08) 48%, transparent 74%)",
  "radial-gradient(56% 50% at 78% 28%, rgba(242,184,96,0.24), rgba(166,138,82,0.08) 48%, transparent 74%)",
  "radial-gradient(58% 52% at 74% 20%, rgba(230,138,86,0.26), rgba(150,52,26,0.09) 48%, transparent 74%)",
];

/**
 * The homepage as a choreographed historical film: smooth inertia scrolling
 * via Lenis, continuous scroll-scrubbed 60fps camera and year interpolation,
 * celestial astrolabe HUD, and parallax chapter plates.
 */
export function HomeFilm() {
  const { images } = useAtlasData();
  const { getPolityById } = useAtlasAccess();
  const prefersReducedMotion = useReducedMotion();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [scrollStep, setScrollStep] = useState(0);
  const [mapYear, setMapYear] = useState<number | null>(null);
  const [telemetry, setTelemetry] = useState<MapTelemetry>({
    lng: STORY_OVERVIEW.center[0],
    lat: STORY_OVERVIEW.center[1],
    bearing: 0,
  });

  const scrollerRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  // Continuous scroll-step calculation (0 = hero, 1..4 = chapters 1..4)
  useEffect(() => {
    const updateScroll = () => {
      const vh = window.innerHeight || 1;
      const center = vh * 0.5;
      const els = chapterRefs.current;
      if (!els.length || !els[0]) return;

      // Measure where viewport center falls relative to hero & each chapter
      const centers = els.map((el) => {
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        return rect.top + rect.height * 0.5;
      });

      if (center <= centers[0]) {
        setScrollStep(0);
        setActiveId(null);
        return;
      }

      for (let i = 0; i < centers.length - 1; i++) {
        const c0 = centers[i];
        const c1 = centers[i + 1];
        if (center >= c0 && center <= c1) {
          const t = (center - c0) / Math.max(1, c1 - c0);
          const step = i + t;
          setScrollStep(step);
          const nearest = Math.round(step);
          setActiveId(
            nearest >= 1 ? (storyChapters[nearest - 1]?.id ?? null) : null
          );
          return;
        }
      }

      const lastIdx = centers.length - 1;
      setScrollStep(lastIdx);
      setActiveId(storyChapters[lastIdx - 1]?.id ?? null);
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, []);

  const chapter = storyChapters.find((c) => c.id === activeId) ?? null;
  const activePolity = chapter ? getPolityById(chapter.polityId) : undefined;
  const year = mapYear ?? chapter?.year ?? STORY_OVERVIEW.year;
  const chapterIndex = chapter ? storyChapters.indexOf(chapter) : -1;
  const glintIndex = Math.min(ERA_GLINTS.length - 1, Math.max(0, chapterIndex + 1));

  const scrollToStage = (idx: number) => {
    const target = chapterRefs.current[idx];
    if (!target) return;
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
  };

  return (
    <ReactLenis
      root
      options={{
        lerp: prefersReducedMotion ? 1 : 0.09,
        smoothWheel: !prefersReducedMotion,
        syncTouch: false,
      }}
    >
      <section className="relative bg-ink text-paper">
        {/* Sticky Cinematic Stage */}
        <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-hidden">
          <StoryMap
            chapter={chapter}
            scrollStep={scrollStep}
            onYear={setMapYear}
            onTelemetry={setTelemetry}
          />

          {/* Zero-wait Celestial Astrolabe & Meridian HUD */}
          <AstrolabeOverlay
            lng={telemetry.lng}
            lat={telemetry.lat}
            bearing={telemetry.bearing}
            accentColor={activePolity?.accentColor ?? "#d4a359"}
            activeChapterId={activeId}
          />

          {/* Dynamic era sun glint */}
          <div
            className="pointer-events-none absolute inset-0 mix-blend-screen transition-all duration-1000"
            style={{ background: ERA_GLINTS[glintIndex] }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(90% 85% at 72% 38%, transparent 38%, rgba(5,4,3,0.55) 78%, rgba(5,4,3,0.85) 100%)",
            }}
            aria-hidden
          />
          <div className="bh-map-grain pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-ink/40 md:bg-gradient-to-r md:from-ink/80 md:via-ink/20 md:to-transparent" />

          {/* Top-right Year Odometer & Chapter Readout */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-56 w-[28rem] max-w-full"
            style={{
              background:
                "radial-gradient(ellipse at top right, rgba(36,31,23,0.82), rgba(36,31,23,0.35) 45%, transparent 72%)",
            }}
            aria-hidden
          />
          <div className="pointer-events-none absolute right-4 top-4 text-right md:right-8 md:top-8">
            <div className="flex items-center justify-end gap-2">
              {activePolity && (
                <span
                  className="inline-block h-2 w-2 rounded-full transition-colors duration-500"
                  style={{ backgroundColor: activePolity.accentColor }}
                />
              )}
              <p className="font-sans text-sm text-paper/75">
                {chapter
                  ? `Chapter ${chapterIndex + 1} of ${storyChapters.length} · ${activePolity?.name ?? ""}`
                  : "The Indian subcontinent"}
              </p>
            </div>
            <Odometer
              value={year}
              suffix="CE"
              durationMs={85}
              className="mt-1 font-display text-4xl text-paper md:text-6xl"
            />
          </div>

          {/* Interactive Horizon Chapter Scrubber Rail */}
          <nav
            aria-label="Story chapters"
            className="absolute bottom-14 left-4 z-20 flex items-center gap-3 md:bottom-6 md:left-8"
          >
            <button
              type="button"
              onClick={() => scrollToStage(0)}
              className="group flex items-center gap-2 py-1 text-left"
              aria-label="Jump to opening overview"
            >
              <span
                className="h-1 w-6 transition-all duration-300"
                style={{
                  backgroundColor: chapterIndex === -1 ? "#f3ede0" : "rgba(243,237,224,0.28)",
                }}
              />
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-paper/60 group-hover:text-paper sm:inline">
                Orbit
              </span>
            </button>

            {storyChapters.map((c, i) => {
              const p = getPolityById(c.polityId);
              const isCurrent = i === chapterIndex;
              const isPassed = i <= chapterIndex;
              const fillPct = Math.max(0, Math.min(1, scrollStep - i)) * 100;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => scrollToStage(i + 1)}
                  className="group flex items-center gap-2 py-1 text-left"
                  aria-label={`Jump to chapter ${i + 1}: ${c.title} (${c.year} CE)`}
                >
                  <span className="relative h-1 w-10 overflow-hidden bg-paper/20">
                    <span
                      className="absolute inset-y-0 left-0 transition-all duration-150"
                      style={{
                        width: `${fillPct}%`,
                        backgroundColor: isCurrent
                          ? (p?.accentColor ?? "#e07a5f")
                          : isPassed
                            ? "#f3ede0"
                            : "transparent",
                      }}
                    />
                  </span>
                  <span
                    className={`hidden font-mono text-[10px] tabular-nums transition-colors sm:inline ${
                      isCurrent ? "text-paper" : "text-paper/45 group-hover:text-paper/80"
                    }`}
                  >
                    {c.year}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Scrolling Narrative Track */}
        <div ref={scrollerRef} className="relative -mt-[calc(100dvh-4rem)]">
          {/* Opening Hero Stage */}
          <div
            ref={(el) => {
              chapterRefs.current[0] = el;
            }}
            data-chapter=""
            className="relative flex h-[calc(100dvh-4rem)] items-end px-4 pb-24 md:px-8 md:pb-28"
          >
            {/* Multilingual Classical Script Ghost Backdrop */}
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden select-none"
              aria-hidden
            >
              {GHOST_SCRIPTS.map((g) => (
                <motion.span
                  key={g.text}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 0.045, y: 0 }}
                  transition={{
                    duration: 1.4,
                    delay: g.delay,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ left: g.left, top: g.top, fontSize: g.size }}
                  className="absolute font-display text-paper"
                >
                  {g.text}
                </motion.span>
              ))}
            </div>

            <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-territory-selected" aria-hidden />
                <p
                  className="bh-fade-in font-mono text-xs uppercase tracking-[0.2em] text-paper/80"
                  style={{ animationDelay: "60ms" }}
                >
                  600 – 1700 CE · Historical Atlas
                </p>
              </div>
              <h1 className="mt-4">
                <Wordmark className="text-6xl text-paper md:text-8xl" />
              </h1>
              <p
                className="bh-fade-in mt-6 max-w-md font-sans text-lg leading-relaxed text-paper/85"
                style={{ animationDelay: "280ms" }}
              >
                The kingdoms of the Indian subcontinent from 600 to 1700: where
                they ruled, when, and how we know.
              </p>
              <div
                className="bh-fade-in mt-10 flex items-center gap-6"
                style={{ animationDelay: "460ms" }}
              >
                <button
                  type="button"
                  onClick={() => scrollToStage(1)}
                  className="group inline-flex items-center gap-2.5 font-sans text-sm text-paper/80 transition-colors hover:text-paper"
                >
                  <span>Scroll or click to begin the descent</span>
                  <span className="inline-block transition-transform duration-300 group-hover:translate-y-1">
                    ↓
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Four Historical Chapter Stages */}
          {storyChapters.map((c, i) => {
            const polity = getPolityById(c.polityId);
            const image = images[c.imageKey];
            const accent = polity?.accentColor ?? "#96341a";
            return (
              <article
                key={c.id}
                ref={(el) => {
                  chapterRefs.current[i + 1] = el;
                }}
                data-chapter={c.id}
                className="flex min-h-[100dvh] items-end px-4 pb-16 md:items-center md:px-8 md:pb-0"
              >
                <motion.div
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, y: 36, filter: "blur(6px)" }
                  }
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ amount: 0.35, once: false }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full max-w-md overflow-hidden border border-paper/15 bg-ink/95 shadow-2xl"
                >
                  {/* Kingdom pigment top rule */}
                  <div
                    className="h-1 w-full"
                    style={{ backgroundColor: accent }}
                  />

                  <div className="relative aspect-[16/6] overflow-hidden md:aspect-[16/9]">
                    <motion.div
                      initial={prefersReducedMotion ? false : { scale: 1.08 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ amount: 0.35, once: false }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                      className="relative h-full w-full"
                    >
                      <Image
                        src={image.file}
                        alt={image.alt}
                        fill
                        sizes="448px"
                        className="object-cover"
                      />
                    </motion.div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />
                    <span className="absolute bottom-2.5 right-3 border border-paper/20 bg-ink/80 px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] text-paper/85">
                      c. {c.year} CE
                    </span>
                  </div>

                  <div className="p-5 md:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {polity && (
                          <KingdomEmblem
                            polityId={polity.id}
                            color={polity.accentColor}
                            className="h-8 w-8"
                          />
                        )}
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/55">
                            Chapter 0{i + 1} · {polity?.name ?? c.polityId}
                          </p>
                        </div>
                      </div>
                      {i < storyChapters.length - 1 && (
                        <button
                          type="button"
                          onClick={() => scrollToStage(i + 2)}
                          className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/50 transition-colors hover:text-paper"
                        >
                          Next ↓
                        </button>
                      )}
                    </div>

                    <h2 className="mt-3 font-display text-2xl text-paper md:text-3xl">
                      {c.title}
                    </h2>
                    <p className="mt-3 font-sans text-[0.95rem] leading-relaxed text-paper/80 md:text-base">
                      {c.body}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-paper/10 pt-4 font-sans text-sm">
                      <Link
                        href={`/atlas?year=${c.year}${polity ? `&polity=${polity.slug}` : ""}`}
                        transitionTypes={NAV_FORWARD}
                        className="text-paper underline underline-offset-4 hover:text-paper/80"
                      >
                        Show {c.year} CE on the map
                      </Link>
                      {polity && (
                        <Link
                          href={`/polities/${polity.slug}`}
                          transitionTypes={NAV_FORWARD}
                          className="text-paper/70 underline underline-offset-4 hover:text-paper"
                        >
                          More about {polity.name}
                        </Link>
                      )}
                    </div>
                    <p className="mt-3 font-sans text-[0.68rem] text-paper/45">
                      Photo: {image.artist}, {image.license}
                    </p>
                  </div>
                </motion.div>
              </article>
            );
          })}
        </div>
      </section>
    </ReactLenis>
  );
}
