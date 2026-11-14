"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";
import { KingdomEmblem } from "@/components/entity/KingdomEmblem";
import { Odometer } from "@/components/primitives/Odometer";
import { useAtlasData, useAtlasAccess } from "@/components/layout/AtlasDataProvider";
import { STORY_OVERVIEW, storyChapters } from "@/lib/data/story";
import { NAV_FORWARD } from "@/lib/utils/view-transition";
import { AstrolabeOverlay } from "./AstrolabeOverlay";
import type { MapTelemetry } from "./StoryMap";
import { Wordmark } from "./Wordmark";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const StoryMap = dynamic(() => import("./StoryMap").then((m) => m.StoryMap), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-ink" />,
});

const GHOST_SCRIPTS = [
  { text: "भारत", left: "6%", top: "14%", size: "clamp(4rem, 10vw, 8.5rem)" },
  { text: "பாரதம்", left: "34%", top: "64%", size: "clamp(3.2rem, 8vw, 6.5rem)" },
  { text: "ಭಾರತ", left: "18%", top: "38%", size: "clamp(3.5rem, 8.5vw, 7rem)" },
  { text: "భారత", left: "44%", top: "18%", size: "clamp(3.2rem, 7.5vw, 6rem)" },
];

const ERA_GLINTS = [
  "radial-gradient(54% 48% at 82% 16%, rgba(255,196,128,0.22), rgba(255,170,90,0.07) 45%, transparent 72%)",
  "radial-gradient(56% 50% at 76% 24%, rgba(224,122,95,0.25), rgba(150,52,26,0.08) 48%, transparent 74%)",
  "radial-gradient(56% 50% at 84% 32%, rgba(92,168,176,0.24), rgba(58,90,120,0.08) 48%, transparent 74%)",
  "radial-gradient(56% 50% at 78% 28%, rgba(242,184,96,0.24), rgba(166,138,82,0.08) 48%, transparent 74%)",
  "radial-gradient(58% 52% at 74% 20%, rgba(230,138,86,0.26), rgba(150,52,26,0.09) 48%, transparent 74%)",
];

/** Syncs Lenis smooth scroll ticks with GSAP ScrollTrigger. */
function LenisScrollTriggerBridge() {
  useLenis(() => {
    ScrollTrigger.update();
  });
  return null;
}

/**
 * Tactile chapter card with GSAP quickTo hover tilt (Preset #2/#3)
 * and ScrollTrigger image parallax + staggered reveal.
 */
function ChapterPlate({
  chapter,
  index,
  polityName,
  politySlug,
  polityId,
  accentColor,
  image,
  onNext,
}: {
  chapter: (typeof storyChapters)[number];
  index: number;
  polityName: string;
  politySlug?: string;
  polityId?: string;
  accentColor: string;
  image: { file: string; alt: string; artist: string; license: string };
  onNext?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = cardRef.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // ScrollTrigger card entrance + inner image parallax
        gsap.fromTo(
          el,
          { opacity: 0.15, y: 42 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 86%",
              end: "top 40%",
              scrub: 0.4,
            },
          }
        );

        const imgWrap = el.querySelector(".gsap-chapter-img");
        if (imgWrap) {
          gsap.fromTo(
            imgWrap,
            { scale: 1.12, yPercent: -6 },
            {
              scale: 1,
              yPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }

        const copyItems = el.querySelectorAll(".gsap-chapter-item");
        if (copyItems.length > 0) {
          gsap.from(copyItems, {
            opacity: 0,
            y: 16,
            duration: 0.45,
            stagger: 0.07,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 78%",
              toggleActions: "play none none reverse",
            },
          });
        }

        // Preset #2/#3: 60fps quickTo subtle tilt on pointer move
        gsap.set(el, { transformPerspective: 900 });
        const rxTo = gsap.quickTo(el, "rotateX", {
          duration: 0.35,
          ease: "power2.out",
        });
        const ryTo = gsap.quickTo(el, "rotateY", {
          duration: 0.35,
          ease: "power2.out",
        });
        const yTo = gsap.quickTo(el, "y", {
          duration: 0.25,
          ease: "power2.out",
        });

        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          rxTo(-ny * 4.5);
          ryTo(nx * 5.5);
          yTo(-3);
        };
        const onLeave = () => {
          rxTo(0);
          ryTo(0);
          yTo(0);
        };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        };
      });

      return () => mm.revert();
    },
    { scope: cardRef }
  );

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-md overflow-hidden border border-paper/15 bg-ink/95 shadow-2xl will-change-transform"
    >
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />

      <div className="relative aspect-[16/6] overflow-hidden md:aspect-[16/9]">
        <div className="gsap-chapter-img relative h-full w-full will-change-transform">
          <Image
            src={image.file}
            alt={image.alt}
            fill
            sizes="448px"
            className="object-cover"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />
        <span className="absolute bottom-2.5 right-3 border border-paper/20 bg-ink/80 px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] text-paper/85">
          c. {chapter.year} CE
        </span>
      </div>

      <div className="p-5 md:p-6">
        <div className="gsap-chapter-item flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {polityId && (
              <KingdomEmblem
                polityId={polityId}
                color={accentColor}
                className="h-8 w-8"
              />
            )}
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/55">
              Chapter 0{index + 1} · {polityName}
            </p>
          </div>
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/50 transition-colors hover:text-paper"
            >
              Next ↓
            </button>
          )}
        </div>

        <h2 className="gsap-chapter-item mt-3 font-display text-2xl text-paper md:text-3xl">
          {chapter.title}
        </h2>
        <p className="gsap-chapter-item mt-3 font-sans text-[0.95rem] leading-relaxed text-paper/80 md:text-base">
          {chapter.body}
        </p>

        <div className="gsap-chapter-item mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-paper/10 pt-4 font-sans text-sm">
          <Link
            href={`/atlas?year=${chapter.year}${politySlug ? `&polity=${politySlug}` : ""}`}
            transitionTypes={NAV_FORWARD}
            className="text-paper underline underline-offset-4 hover:text-paper/80"
          >
            Show {chapter.year} CE on the map
          </Link>
          {politySlug && (
            <Link
              href={`/polities/${politySlug}`}
              transitionTypes={NAV_FORWARD}
              className="text-paper/70 underline underline-offset-4 hover:text-paper"
            >
              More about {polityName}
            </Link>
          )}
        </div>
        <p className="gsap-chapter-item mt-3 font-sans text-[0.68rem] text-paper/45">
          Photo: {image.artist}, {image.license}
        </p>
      </div>
    </div>
  );
}

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

  const sectionRef = useRef<HTMLElement>(null);
  const spineFillRef = useRef<HTMLSpanElement>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  // GSAP ScrollTrigger choreography for the hero ghost scripts + vertical spine
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Hero copy entrance stagger
        gsap.from(".gsap-hero-item", {
          opacity: 0,
          y: 20,
          duration: 0.7,
          stagger: 0.12,
          delay: 0.25,
          ease: "power2.out",
        });

        // Multi-layer depth parallax on classical script watermarks (Preset #14)
        gsap.utils.toArray<HTMLElement>(".gsap-ghost-script").forEach((layer, i) => {
          gsap.fromTo(
            layer,
            { opacity: 0, yPercent: 12 },
            {
              opacity: 0.048,
              yPercent: 0,
              duration: 1.2,
              delay: 0.1 + i * 0.12,
              ease: "power2.out",
            }
          );
          gsap.to(layer, {
            yPercent: (i + 1) * -18,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "25% top",
              scrub: 0.5,
            },
          });
        });

        // Hallmark #3: 2px vertical progress spine scaled by ScrollTrigger
        if (spineFillRef.current && sectionRef.current) {
          gsap.fromTo(
            spineFillRef.current,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.2,
              },
            }
          );
        }
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  // Continuous scroll-step calculation (0 = hero, 1..4 = chapters 1..4)
  useEffect(() => {
    const updateScroll = () => {
      const vh = window.innerHeight || 1;
      const center = vh * 0.5;
      const els = chapterRefs.current;
      if (!els.length || !els[0]) return;

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
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center",
    });
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
      <LenisScrollTriggerBridge />
      <section ref={sectionRef} className="relative bg-ink text-paper">
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

          {/* Hallmark #3: 2px vertical chronological spine along left edge */}
          <div
            className="pointer-events-none absolute bottom-20 left-3 top-20 hidden w-[2px] bg-paper/10 md:block"
            aria-hidden
          >
            <span
              ref={spineFillRef}
              className="block h-full w-full origin-top transition-colors duration-500"
              style={{
                backgroundColor: activePolity?.accentColor ?? "#96341a",
              }}
            />
          </div>

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
                  backgroundColor:
                    chapterIndex === -1 ? "#f3ede0" : "rgba(243,237,224,0.28)",
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
                      isCurrent
                        ? "text-paper"
                        : "text-paper/45 group-hover:text-paper/80"
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
        <div className="relative -mt-[calc(100dvh-4rem)]">
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
                <span
                  key={g.text}
                  style={{ left: g.left, top: g.top, fontSize: g.size }}
                  className="gsap-ghost-script absolute font-display text-paper opacity-[0.045] will-change-transform"
                >
                  {g.text}
                </span>
              ))}
            </div>

            <div className="relative z-10 max-w-xl">
              <div className="gsap-hero-item flex items-center gap-3">
                <span className="h-px w-8 bg-territory-selected" aria-hidden />
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/80">
                  600 – 1700 CE · Historical Atlas
                </p>
              </div>
              <h1 className="mt-4">
                <Wordmark className="text-6xl text-paper md:text-8xl" />
              </h1>
              <p className="gsap-hero-item mt-6 max-w-md font-sans text-lg leading-relaxed text-paper/85">
                The kingdoms of the Indian subcontinent from 600 to 1700: where
                they ruled, when, and how we know.
              </p>
              <div className="gsap-hero-item mt-10 flex items-center gap-6">
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
                <ChapterPlate
                  chapter={c}
                  index={i}
                  polityName={polity?.name ?? c.polityId}
                  politySlug={polity?.slug}
                  polityId={polity?.id}
                  accentColor={accent}
                  image={image}
                  onNext={
                    i < storyChapters.length - 1
                      ? () => scrollToStage(i + 2)
                      : undefined
                  }
                />
              </article>
            );
          })}
        </div>
      </section>
    </ReactLenis>
  );
}
