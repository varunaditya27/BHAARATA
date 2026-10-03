"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
import { useEffect, useRef } from "react";
import { prefersReducedMotion, startMapAnimations } from "@/components/map/animations";
import { applyHistoricalState } from "@/components/map/apply-state";
import { addHistoricalLayers } from "@/components/map/layers";
import { BASEMAP_STYLE_URL } from "@/components/map/mapStyle";
import { STORY_OVERVIEW, type StoryChapter } from "@/lib/data/story";

if (typeof window !== "undefined") {
  setWorkerUrl("/vendor/maplibre-gl-worker.js");
}

const START_YEAR = 700;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * The homepage film's camera. Opens on the globe seen from orbit, descends
 * onto the subcontinent while the kingdoms ink in year by year, then
 * follows whichever chapter is on screen. Not user-interactive: the page
 * scroll is the only control, so it must never capture wheel or touch.
 */
export function StoryMap({
  chapter,
  onYear,
}: {
  chapter: StoryChapter | null;
  /** Fired as the year sweeps (throttled), so the page's counter turns
   * in step with the territory inking in. */
  onYear?: (year: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const readyRef = useRef(false);
  const yearRef = useRef(START_YEAR);
  const yearAnimRef = useRef<number | undefined>(undefined);
  const chapterRef = useRef(chapter);
  const onYearRef = useRef(onYear);

  useEffect(() => {
    onYearRef.current = onYear;
  }, [onYear]);

  /** Sweep the year so territory inks in/out in sequence instead of
   * jumping — feature-state writes throttled to ~12/s; the map's own
   * paint transitions smooth between them. */
  const sweepYear = (map: MapLibreMap, to: number, ms: number, selected: string | null) => {
    if (yearAnimRef.current !== undefined) cancelAnimationFrame(yearAnimRef.current);
    const from = yearRef.current;
    if (prefersReducedMotion() || ms === 0) {
      yearRef.current = to;
      applyHistoricalState(map, to, selected);
      onYearRef.current?.(to);
      return;
    }
    const started = performance.now();
    let lastWrite = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / ms);
      const y = Math.round(from + (to - from) * easeInOut(t));
      if (now - lastWrite > 80 || t === 1) {
        lastWrite = now;
        yearRef.current = y;
        applyHistoricalState(map, y, selected);
        onYearRef.current?.(y);
      }
      if (t < 1) yearAnimRef.current = requestAnimationFrame(step);
    };
    yearAnimRef.current = requestAnimationFrame(step);
  };

  /** Keep the chapter's subject clear of its text card: the card sits on
   * the left on desktop, across the bottom on phones. The overview (no
   * card, just the title) gets no offset. */
  const chapterPadding = (map: MapLibreMap, c: StoryChapter | null) => {
    if (!c) return { top: 0, bottom: 0, left: 0, right: 0 };
    const h = map.getContainer().clientHeight;
    return window.matchMedia("(max-width: 767px)").matches
      ? { top: 40, bottom: Math.round(h * 0.55), left: 0, right: 0 }
      : { top: 0, bottom: 0, left: 500, right: 0 };
  };

  const showChapter = (map: MapLibreMap, c: StoryChapter | null, duration: number) => {
    const target = c?.camera ?? STORY_OVERVIEW;
    const camera = { center: target.center, zoom: target.zoom, padding: chapterPadding(map, c) };
    sweepYear(map, c?.year ?? STORY_OVERVIEW.year, duration * 0.75, c?.polityId ?? null);
    if (prefersReducedMotion()) map.jumpTo(camera);
    else map.flyTo({ ...camera, duration, curve: 1.25, essential: true });
  };

  useEffect(() => {
    chapterRef.current = chapter;
    const map = mapRef.current;
    if (map && readyRef.current) showChapter(map, chapter, 2400);
    // showChapter only touches refs and the map instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter]);

  useEffect(() => {
    if (!containerRef.current) return;
    let stopAnimations = () => {};
    const map = new MapLibreMap({
      container: containerRef.current,
      style: BASEMAP_STYLE_URL,
      center: [30, 8],
      zoom: 1.3,
      interactive: false,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.on("style.load", () => {
      map.setProjection({ type: "globe" });
      map.setSky({
        "sky-color": "#1a1712",
        "horizon-color": "#3b3427",
        "fog-color": "#241f17",
        "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 3, 0.8, 5, 0],
      });
    });

    map.on("load", () => {
      addHistoricalLayers(map, { interactive: false });
      applyHistoricalState(map, START_YEAR, null);
      stopAnimations = startMapAnimations(map);
      readyRef.current = true;

      // The descent: from orbit onto the subcontinent, kingdoms inking in
      // as the years run forward. If a chapter is already on screen (deep
      // link / restored scroll), go straight to it instead.
      if (chapterRef.current) {
        showChapter(map, chapterRef.current, 2400);
      } else if (prefersReducedMotion()) {
        map.jumpTo({ center: STORY_OVERVIEW.center, zoom: STORY_OVERVIEW.zoom });
        applyHistoricalState(map, STORY_OVERVIEW.year, null);
        yearRef.current = STORY_OVERVIEW.year;
        onYearRef.current?.(STORY_OVERVIEW.year);
      } else {
        map.flyTo({ center: STORY_OVERVIEW.center, zoom: STORY_OVERVIEW.zoom, duration: 5600, curve: 1.1, essential: true });
        sweepYear(map, STORY_OVERVIEW.year, 5200, null);
      }
    });

    return () => {
      stopAnimations();
      if (yearAnimRef.current !== undefined) cancelAnimationFrame(yearAnimRef.current);
      readyRef.current = false;
      map.remove();
      mapRef.current = null;
    };
    // Init once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // MapLibre forces `position: relative` on its container, so the
  // absolute positioning has to live on a wrapper or the canvas collapses
  // to its 300px default height.
  return (
    <div className="absolute inset-0 bg-ink" aria-hidden>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
