"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion, startMapAnimations } from "@/components/map/animations";
import { applyHistoricalState } from "@/components/map/apply-state";
import { addHistoricalLayers } from "@/components/map/layers";
import { BASEMAP_STYLE_URL, LAYER_IDS } from "@/components/map/mapStyle";
import { SpaceBackdrop } from "@/components/home/SpaceBackdrop";
import { STORY_OVERVIEW, type StoryChapter } from "@/lib/data/story";

if (typeof window !== "undefined") {
  setWorkerUrl("/vendor/maplibre-gl-worker.js");
}

const START_YEAR = 600;
const DESCENT_MS = 9500;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Where the film opens: high over the Atlantic, looking at Africa and Arabia, tilted a little. */
const ORBIT_START = { lng: -32, lat: 14, zoom: 1.25, bearing: -22 };

/**
 * The opening swoop, drawn by hand so each part of the camera can move on its
 * own clock: the globe spins east (Atlantic, Africa, Arabia, India) on one
 * ease; the zoom holds back, then dives late; the pitch swells mid-swoop and
 * settles flat; the bearing unwinds. MapLibre's flyTo can't do that — it moves
 * centre and zoom along a single curve.
 */
function orbitFrame(map: MapLibreMap, t: number) {
  const spin = easeInOut(t);
  // On wide screens the title sits on the left, so the globe starts in the right half and centres as it dives.
  const wide = window.matchMedia("(min-width: 1024px)").matches;
  const shift = wide ? Math.round(map.getContainer().clientWidth * 0.3 * (1 - easeInOut(Math.min(1, t * 1.1)))) : 0;
  const dive = easeInOut(Math.max(0, (t - 0.18) / 0.82));
  const target = STORY_OVERVIEW;
  map.jumpTo({
    center: [lerp(ORBIT_START.lng, target.center[0], spin), lerp(ORBIT_START.lat, target.center[1], spin)],
    zoom: lerp(ORBIT_START.zoom, target.zoom, Math.pow(dive, 1.15)),
    bearing: lerp(ORBIT_START.bearing, 0, easeInOut(Math.min(1, t * 1.25))),
    pitch: 34 * Math.sin(Math.PI * Math.pow(dive, 0.8)),
    padding: { left: shift, right: 0, top: 0, bottom: 0 },
  });
}

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
  const descentRef = useRef<number | undefined>(undefined);
  const [shown, setShown] = useState(false);
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
    // A chapter taking over (the reader scrolled) ends the opening swoop where it is.
    if (descentRef.current !== undefined) {
      cancelAnimationFrame(descentRef.current);
      descentRef.current = undefined;
    }
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
      center: [ORBIT_START.lng, ORBIT_START.lat],
      zoom: ORBIT_START.zoom,
      bearing: ORBIT_START.bearing,
      interactive: false,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.on("style.load", () => {
      map.setProjection({ type: "globe" });
      // A thin amber-to-blue atmosphere around the limb, fading as the camera nears the ground.
      map.setSky({
        "sky-color": "#1d3350",
        "sky-horizon-blend": 0.7,
        "horizon-color": "#f0b46e",
        "horizon-fog-blend": 0.6,
        "fog-color": "#8aa6c4",
        "fog-ground-blend": 0.2,
        "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 3, 0.85, 5.5, 0],
      });
    });

    map.on("load", () => {
      addHistoricalLayers(map, { interactive: false });
      // Recolour for the night view: land stays warm parchment, the sea goes deep teal,
      // and relief is pushed up so continents have texture even from orbit.
      const paint = (id: string, prop: string, value: unknown) => {
        if (map.getLayer(id)) map.setPaintProperty(id, prop as never, value as never);
      };
      paint("background", "background-color", "#d4c49b");
      paint("water", "fill-color", "#17353b");
      paint("waterway", "line-color", "#3d6f72");
      paint(LAYER_IDS.hillshade, "hillshade-exaggeration", ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 0.6]);
      paint(LAYER_IDS.hillshade, "hillshade-shadow-color", "rgba(48, 34, 20, 0.78)");
      // Kingdom names only once the camera is close enough to read them; from orbit they just pile up.
      if (map.getLayer(LAYER_IDS.kingdomLabels)) map.setLayerZoomRange(LAYER_IDS.kingdomLabels, 3.7, 24);
      // Fade the globe in once its first tiles are drawn, instead of showing a blank grey ball while they load.
      const reveal = () => setShown(true);
      map.once("idle", reveal);
      setTimeout(reveal, 1800);
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
        orbitFrame(map, 0);
        sweepYear(map, STORY_OVERVIEW.year, DESCENT_MS * 0.9, null);
        // A beat of stillness on the orbit shot so the title can land, then the swoop.
        const hold = 900;
        const t0 = performance.now() + hold;
        const frame = (now: number) => {
          const t = Math.min(1, Math.max(0, (now - t0) / DESCENT_MS));
          orbitFrame(map, t);
          descentRef.current = t < 1 ? requestAnimationFrame(frame) : undefined;
        };
        descentRef.current = requestAnimationFrame(frame);
      }
    });

    return () => {
      stopAnimations();
      if (yearAnimRef.current !== undefined) cancelAnimationFrame(yearAnimRef.current);
      if (descentRef.current !== undefined) cancelAnimationFrame(descentRef.current);
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
    <div className="absolute inset-0 bg-[#070605]" aria-hidden>
      <SpaceBackdrop />
      {/* The map canvas is transparent outside the globe, so the sky above shows through. */}
      <div className={`absolute inset-0 transition-opacity duration-[1400ms] ${shown ? "opacity-100" : "opacity-0"}`}>
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
