"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { KingdomEmblem } from "@/components/entity/KingdomEmblem";
import { Odometer } from "@/components/primitives/Odometer";
import { images } from "@/lib/data/images";
import { getPolityBySlug } from "@/lib/data/prototype";
import { STORY_OVERVIEW, storyChapters } from "@/lib/data/story";
import { NAV_FORWARD } from "@/lib/utils/view-transition";
import { Wordmark } from "./Wordmark";

// MapLibre is ~800KB — loaded after the page's text is on screen, never
// during server render.
const StoryMap = dynamic(() => import("./StoryMap").then((m) => m.StoryMap), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-ink" />,
});

/**
 * The homepage as a short film. A sticky stage holds the map; the opening
 * title and four chapters scroll over it, and whichever chapter is centred
 * on screen drives the camera and the year. Scrolling is the only control.
 */
export function HomeFilm() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mapYear, setMapYear] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId((entry.target as HTMLElement).dataset.chapter || null);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    scrollerRef.current?.querySelectorAll("[data-chapter]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const chapter = storyChapters.find((c) => c.id === activeId) ?? null;
  // The counter follows the map's sweeping year once the map is live;
  // before that (or without WebGL) it shows the scene's target year.
  const year = mapYear ?? chapter?.year ?? STORY_OVERVIEW.year;
  const chapterIndex = chapter ? storyChapters.indexOf(chapter) : -1;

  return (
    <section className="relative bg-ink text-paper">
      <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-hidden">
        <StoryMap chapter={chapter} onYear={setMapYear} />
        {/* Light on the globe: a warm sun glint from the upper right, and the far side falling into shadow. */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{ background: "radial-gradient(52% 46% at 82% 14%, rgba(255,196,128,0.20), rgba(255,170,90,0.06) 45%, transparent 70%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(90% 85% at 72% 38%, transparent 38%, rgba(5,4,3,0.55) 78%, rgba(5,4,3,0.85) 100%)" }}
          aria-hidden
        />
        <div className="bh-map-grain pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-ink/40 md:bg-gradient-to-r md:from-ink/80 md:via-ink/20 md:to-transparent" />

        <div
          className="pointer-events-none absolute right-0 top-0 h-56 w-[28rem] max-w-full"
          style={{ background: "radial-gradient(ellipse at top right, rgba(36,31,23,0.82), rgba(36,31,23,0.35) 45%, transparent 72%)" }}
          aria-hidden
        />
        <div className="pointer-events-none absolute right-4 top-4 text-right md:right-8 md:top-8">
          <p className="font-sans text-sm text-paper/70">
            {chapter ? `Chapter ${chapterIndex + 1} of ${storyChapters.length}` : "The Indian subcontinent"}
          </p>
          <Odometer value={year} suffix="CE" className="mt-1 font-display text-4xl text-paper md:text-6xl" />
        </div>

        <div className="pointer-events-none absolute bottom-16 left-4 flex gap-2 md:bottom-6 md:left-8" aria-hidden>
          {storyChapters.map((c, i) => (
            <span
              key={c.id}
              className="h-0.5 w-8 bg-paper transition-opacity duration-500"
              style={{ opacity: i <= chapterIndex ? 0.9 : 0.25 }}
            />
          ))}
        </div>
      </div>

      <div ref={scrollerRef} className="relative -mt-[calc(100dvh-4rem)]">
        <div data-chapter="" className="flex h-[calc(100dvh-4rem)] items-end px-4 pb-20 md:px-8 md:pb-24">
          <div className="max-w-xl">
            <p className="bh-fade-in font-sans text-base text-paper/80" style={{ animationDelay: "200ms" }}>
              A historical atlas
            </p>
            <h1 className="mt-4">
              <Wordmark className="text-6xl text-paper md:text-8xl" />
            </h1>
            <p className="bh-fade-in mt-6 max-w-md font-sans text-lg leading-relaxed text-paper/85" style={{ animationDelay: "1300ms" }}>
              The kingdoms of the Indian subcontinent from 600 to 1700: where they ruled, when, and how we know.
            </p>
            <p className="bh-fade-in mt-10 font-sans text-sm text-paper/60" style={{ animationDelay: "1800ms" }}>
              Scroll down to begin ↓
            </p>
          </div>
        </div>

        {storyChapters.map((c, i) => {
          const polity = getPolityBySlug(c.polityId);
          const image = images[c.imageKey];
          return (
            <article
              key={c.id}
              data-chapter={c.id}
              className="flex min-h-[100dvh] items-end px-4 pb-14 md:items-center md:px-8 md:pb-0"
            >
              <div className="w-full max-w-md bg-ink shadow-xl">
                <div className="relative aspect-[16/6] overflow-hidden md:aspect-[16/9]">
                  <Image src={image.file} alt={image.alt} fill sizes="448px" className="object-cover" />
                </div>
                <div className="p-5 md:p-6">
                  <div className="flex items-center gap-3">
                    {polity && <KingdomEmblem polityId={polity.id} color={polity.accentColor} className="h-8 w-8" />}
                    <p className="font-sans text-sm text-paper/70">
                      Chapter {i + 1}, c. {c.year} CE
                    </p>
                  </div>
                  <h2 className="mt-3 font-display text-2xl md:text-3xl">{c.title}</h2>
                  <p className="mt-3 font-sans text-[0.95rem] leading-relaxed text-paper/80 md:text-base">{c.body}</p>
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-sans text-sm">
                    <Link
                      href={`/atlas?year=${c.year}&polity=${c.polityId}`}
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
                  <p className="mt-4 font-sans text-[0.7rem] text-paper/45">
                    Photo: {image.artist}, {image.license}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
