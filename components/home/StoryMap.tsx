"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useAtlasData } from "@/components/layout/AtlasDataProvider";
import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion, startMapAnimations } from "@/components/map/animations";
import { applyHistoricalState } from "@/components/map/apply-state";
import { addHistoricalLayers } from "@/components/map/layers";
import { BASEMAP_STYLE_URL, LAYER_IDS } from "@/components/map/mapStyle";
import { SpaceBackdrop } from "@/components/home/SpaceBackdrop";
import { STORY_OVERVIEW, storyChapters, type StoryChapter } from "@/lib/data/story";

if (typeof window !== "undefined") {
  setWorkerUrl("/vendor/maplibre-gl-worker.js");
}

const START_YEAR = 600;
const DESCENT_MS = 6400;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Where the film opens: orbital view over the Arabian Sea / East Africa with India visible on the eastern limb. */
const ORBIT_START = { lng: 36, lat: 16, zoom: 1.45, bearing: -18, pitch: 18 };

function heroRightPadding(container: HTMLElement) {
  const wide = window.matchMedia("(min-width: 1024px)").matches;
  return wide ? Math.round(container.clientWidth * 0.28) : 0;
}

function chapterOffsets(container: HTMLElement) {
  const h = container.clientHeight;
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  return isMobile
    ? { top: 40, bottom: Math.round(h * 0.52), left: 0 }
    : { top: 0, bottom: 0, left: 480 };
}

type Waypoint = {
  lng: number;
  lat: number;
  zoom: number;
  year: number;
  bearing: number;
  pitch: number;
  polityId: string | null;
  isChapter: boolean;
};

const WAYPOINTS: Waypoint[] = [
  {
    lng: STORY_OVERVIEW.center[0],
    lat: STORY_OVERVIEW.center[1],
    zoom: STORY_OVERVIEW.zoom,
    year: STORY_OVERVIEW.year,
    bearing: 0,
    pitch: 0,
    polityId: null,
    isChapter: false,
  },
  ...storyChapters.map((c, idx) => ({
    lng: c.camera.center[0],
    lat: c.camera.center[1],
    zoom: c.camera.zoom,
    year: c.year,
    bearing: idx % 2 === 0 ? -8 : 8,
    pitch: 22,
    polityId: c.polityId,
    isChapter: true,
  })),
];

export type MapTelemetry = {
  lng: number;
  lat: number;
  bearing: number;
};

/**
 * Unified 60fps camera and historical-year engine for the homepage film.
 * Seamlessly transitions from the opening orbital descent into continuous,
 * spring-damped scroll flight across the four historical chapters.
 */
export function StoryMap({
  chapter,
  scrollStep = 0,
  onYear,
  onTelemetry,
}: {
  chapter: StoryChapter | null;
  /** Continuous scroll progress: 0 = hero overview, 1..4 = chapters 1..4 */
  scrollStep?: number;
  onYear?: (year: number) => void;
  onTelemetry?: (t: MapTelemetry) => void;
}) {
  const data = useAtlasData();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [shown, setShown] = useState(false);

  const scrollStepRef = useRef(scrollStep);
  const chapterRef = useRef(chapter);
  const onYearRef = useRef(onYear);
  const onTelemetryRef = useRef(onTelemetry);

  useEffect(() => {
    scrollStepRef.current = scrollStep;
  }, [scrollStep]);

  useEffect(() => {
    chapterRef.current = chapter;
  }, [chapter]);

  useEffect(() => {
    onYearRef.current = onYear;
  }, [onYear]);

  useEffect(() => {
    onTelemetryRef.current = onTelemetry;
  }, [onTelemetry]);

  useEffect(() => {
    if (!containerRef.current) return;
    let stopAnimations = () => {};
    let rafId: number | undefined;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: BASEMAP_STYLE_URL,
      center: [ORBIT_START.lng, ORBIT_START.lat],
      zoom: ORBIT_START.zoom,
      bearing: ORBIT_START.bearing,
      pitch: ORBIT_START.pitch,
      interactive: false,
      attributionControl: { compact: true },
    });
    map.setPadding({
      left: heroRightPadding(containerRef.current),
      right: 0,
      top: 0,
      bottom: 0,
    });
    mapRef.current = map;

    map.on("style.load", () => {
      map.setProjection({ type: "globe" });
      map.setSky({
        "sky-color": "#1d3350",
        "sky-horizon-blend": 0.7,
        "horizon-color": "#f0b46e",
        "horizon-fog-blend": 0.6,
        "fog-color": "#8aa6c4",
        "fog-ground-blend": 0.2,
        "atmosphere-blend": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          1,
          3,
          0.85,
          5.5,
          0,
        ],
      });
    });

    map.on("load", () => {
      addHistoricalLayers(map, data, { interactive: false });
      const paint = (id: string, prop: string, value: unknown) => {
        if (map.getLayer(id))
          map.setPaintProperty(id, prop as never, value as never);
      };
      paint("background", "background-color", "#d4c49b");
      paint("water", "fill-color", "#17353b");
      paint("waterway", "line-color", "#3d6f72");
      paint(LAYER_IDS.hillshade, "hillshade-exaggeration", [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        1,
        5,
        0.6,
      ]);
      paint(
        LAYER_IDS.hillshade,
        "hillshade-shadow-color",
        "rgba(48, 34, 20, 0.78)"
      );
      if (map.getLayer(LAYER_IDS.kingdomLabels)) {
        map.setLayerZoomRange(LAYER_IDS.kingdomLabels, 3.7, 24);
      }

      setShown(true);
      applyHistoricalState(map, START_YEAR, null, data);
      onYearRef.current?.(START_YEAR);
      stopAnimations = startMapAnimations(map, data);

      const reduced = prefersReducedMotion();
      const t0 = performance.now();
      let lastFrame = t0;
      let lastStateWrite = 0;
      let lastTelemetryWrite = 0;
      let descentInterrupted = scrollStepRef.current > 0.04;

      // Live damped state
      const cur = {
        lng: reduced ? STORY_OVERVIEW.center[0] : ORBIT_START.lng,
        lat: reduced ? STORY_OVERVIEW.center[1] : ORBIT_START.lat,
        zoom: reduced ? STORY_OVERVIEW.zoom : ORBIT_START.zoom,
        bearing: reduced ? 0 : ORBIT_START.bearing,
        pitch: reduced ? 0 : ORBIT_START.pitch,
        padLeft: heroRightPadding(map.getContainer()),
        padBottom: 0,
        padTop: 0,
        year: reduced ? STORY_OVERVIEW.year : START_YEAR,
      };
      let appliedYear = -1;
      let appliedPolity: string | null = "__init__";

      const tick = (now: number) => {
        const dt = Math.min(0.06, Math.max(0.001, (now - lastFrame) / 1000));
        lastFrame = now;

        const step = Math.max(
          0,
          Math.min(WAYPOINTS.length - 1, scrollStepRef.current)
        );
        if (step > 0.04) {
          descentInterrupted = true;
        }

        const descentT = Math.min(1, Math.max(0, (now - t0) / DESCENT_MS));

        if (!reduced && !descentInterrupted && descentT < 1) {
          // Phase 1: Choreographed opening orbital descent
          const spin = easeInOut(descentT);
          const dive = easeInOut(Math.max(0, (descentT - 0.12) / 0.88));
          const baseShift = heroRightPadding(map.getContainer());

          cur.lng = lerp(ORBIT_START.lng, STORY_OVERVIEW.center[0], spin);
          cur.lat = lerp(ORBIT_START.lat, STORY_OVERVIEW.center[1], spin);
          cur.zoom = lerp(
            ORBIT_START.zoom,
            STORY_OVERVIEW.zoom,
            Math.pow(dive, 1.1)
          );
          cur.bearing = lerp(
            ORBIT_START.bearing,
            0,
            easeInOut(Math.min(1, descentT * 1.2))
          );
          cur.pitch =
            lerp(ORBIT_START.pitch, 0, spin) + 22 * Math.sin(Math.PI * dive);
          cur.padLeft = Math.round(
            baseShift * (1 - easeInOut(Math.min(1, descentT * 1.15)))
          );
          cur.padBottom = 0;
          cur.padTop = 0;

          const yearT = Math.min(1, Math.max(0, (descentT - 0.32) / 0.68));
          cur.year =
            START_YEAR +
            (STORY_OVERVIEW.year - START_YEAR) * easeInOut(yearT);
        } else {
          // Phase 2: Continuous scroll-scrubbed flight across chapters
          const idx = Math.min(WAYPOINTS.length - 2, Math.floor(step));
          const frac = step - idx;
          const smoothFrac = easeInOut(frac);
          const a = WAYPOINTS[idx];
          const b = WAYPOINTS[idx + 1];

          const cOffsets = chapterOffsets(map.getContainer());
          const targetLng = lerp(a.lng, b.lng, smoothFrac);
          const targetLat = lerp(a.lat, b.lat, smoothFrac);
          // Slight zoom-out mid-flight between chapters so long jumps breathe
          const flightArc = Math.sin(Math.PI * frac);
          const targetZoom =
            lerp(a.zoom, b.zoom, smoothFrac) - (idx >= 1 ? 0.35 * flightArc : 0);
          const targetPitch =
            lerp(a.pitch, b.pitch, smoothFrac) + 14 * flightArc;
          const targetBearing =
            lerp(a.bearing, b.bearing, smoothFrac) + 6 * flightArc;

          const aPadLeft = a.isChapter ? cOffsets.left : 0;
          const bPadLeft = b.isChapter ? cOffsets.left : 0;
          const aPadBottom = a.isChapter ? cOffsets.bottom : 0;
          const bPadBottom = b.isChapter ? cOffsets.bottom : 0;
          const aPadTop = a.isChapter ? cOffsets.top : 0;
          const bPadTop = b.isChapter ? cOffsets.top : 0;

          const targetPadLeft = lerp(aPadLeft, bPadLeft, smoothFrac);
          const targetPadBottom = lerp(aPadBottom, bPadBottom, smoothFrac);
          const targetPadTop = lerp(aPadTop, bPadTop, smoothFrac);
          const targetYear = lerp(a.year, b.year, smoothFrac);

          const alpha = reduced ? 1 : 1 - Math.exp(-dt * 7.5);
          cur.lng = lerp(cur.lng, targetLng, alpha);
          cur.lat = lerp(cur.lat, targetLat, alpha);
          cur.zoom = lerp(cur.zoom, targetZoom, alpha);
          cur.pitch = lerp(cur.pitch, targetPitch, alpha);
          cur.bearing = lerp(cur.bearing, targetBearing, alpha);
          cur.padLeft = lerp(cur.padLeft, targetPadLeft, alpha);
          cur.padBottom = lerp(cur.padBottom, targetPadBottom, alpha);
          cur.padTop = lerp(cur.padTop, targetPadTop, alpha);
          cur.year = lerp(cur.year, targetYear, alpha);
        }

        map.jumpTo({
          center: [cur.lng, cur.lat],
          zoom: cur.zoom,
          bearing: cur.bearing,
          pitch: cur.pitch,
          padding: {
            left: Math.round(cur.padLeft),
            right: 0,
            top: Math.round(cur.padTop),
            bottom: Math.round(cur.padBottom),
          },
        });

        const roundedYear = Math.round(cur.year);
        const nearestIdx = Math.round(step);
        const activePolity =
          step > 0.45
            ? (WAYPOINTS[nearestIdx]?.polityId ??
              chapterRef.current?.polityId ??
              null)
            : null;

        if (
          now - lastStateWrite > 65 ||
          (roundedYear !== appliedYear && Math.abs(roundedYear - appliedYear) >= 2) ||
          activePolity !== appliedPolity
        ) {
          lastStateWrite = now;
          if (roundedYear !== appliedYear || activePolity !== appliedPolity) {
            appliedYear = roundedYear;
            appliedPolity = activePolity;
            applyHistoricalState(map, roundedYear, activePolity, data);
            onYearRef.current?.(roundedYear);
          }
        }

        if (now - lastTelemetryWrite > 90) {
          lastTelemetryWrite = now;
          onTelemetryRef.current?.({
            lng: cur.lng,
            lat: cur.lat,
            bearing: cur.bearing,
          });
        }

        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
    });

    return () => {
      stopAnimations();
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      map.remove();
      mapRef.current = null;
    };
    // Init once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0 bg-[#070605]" aria-hidden>
      <SpaceBackdrop />
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      >
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
