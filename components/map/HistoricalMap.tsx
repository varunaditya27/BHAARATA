"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  LngLatBounds,
  Map as MapLibreMap,
  MapMouseEvent,
  NavigationControl,
  ScaleControl,
  setWorkerUrl,
} from "maplibre-gl";
import { useCallback, useEffect, useRef } from "react";
import { prefersReducedMotion, startMapAnimations } from "./animations";
import { applyHistoricalState, boundaryForPolity, polityAtPoint, territoryAtPoint } from "./apply-state";
import { addHistoricalLayers } from "./layers";
import type { LayerToggleId } from "./MapLegend";
import { BASEMAP_STYLE_URL, LAYER_IDS, SOURCE_IDS } from "./mapStyle";
import { getPolityBySlug } from "@/lib/data/prototype";
import { formatDateRange } from "@/lib/domain/time";

// MapLibre resolves its worker via `import.meta.url` inside node_modules,
// which Turbopack doesn't serve correctly ("Worker failed to load").
// Point it at our self-hosted copy instead — see
// scripts/copy-maplibre-worker.mjs. Must run before the first `new Map()`.
if (typeof window !== "undefined") {
  setWorkerUrl("/vendor/maplibre-gl-worker.js");
}

export type HistoricalMapProps = {
  year: number;
  selectedPolityId: string | null;
  onSelectPolity: (polityId: string | null) => void;
  visibleLayers: Set<LayerToggleId>;
  onViewportChange?: (center: [number, number], zoom: number) => void;
  /** A place the camera should drift toward (an event during playback).
   * `key` changes trigger the move; the same key twice does nothing. */
  focus?: { key: string; center: [number, number] } | null;
  /** Fires once, when the first frame with our layers has fully drawn. */
  onReady?: () => void;
  initialCenter?: [number, number];
  initialZoom?: number;
};

const DEFAULT_CENTER: [number, number] = [78.5, 13.5];
const DEFAULT_ZOOM = 4.9;

const TOGGLE_LAYER_MAP: Record<LayerToggleId, string[]> = {
  territory: [
    LAYER_IDS.territoryFill,
    LAYER_IDS.frontierHatch,
    LAYER_IDS.territoryGlow,
    LAYER_IDS.territoryEcho,
    LAYER_IDS.territoryOutline,
    LAYER_IDS.kingdomLabels,
  ],
  places: [LAYER_IDS.placePoints, LAYER_IDS.placeLabels, LAYER_IDS.placeIcons],
  routes: [LAYER_IDS.routeLines, LAYER_IDS.routeLinesDash, LAYER_IDS.routeArrows, LAYER_IDS.routeMovers],
  relief: [LAYER_IDS.hillshade],
};

/** Keep the selected territory clear of whatever panel covers the map:
 * the bottom sheet on phones, the floating card on the right on desktop. */
function fitPadding() {
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  return mobile
    ? { top: 64, bottom: 200, left: 24, right: 24 }
    : { top: 60, bottom: 60, left: 80, right: 380 };
}

/** Pull back, then fly in — the staged camera move from
 * IMPLEMENTATION_PLAN.md §23.2 ("India → South India → Thanjavur"),
 * instead of a single flat fitBounds. */
function cinematicFitBounds(map: MapLibreMap, bounds: LngLatBounds) {
  const camera = map.cameraForBounds(bounds, { padding: fitPadding(), maxZoom: 7 });
  if (!camera) return;
  // Tilt into the landscape on arrival — only where 3D terrain is on,
  // otherwise a pitched flat map just looks skewed.
  const pitch = map.getTerrain() ? 30 : 0;
  if (prefersReducedMotion()) {
    map.jumpTo({ ...camera, pitch });
    return;
  }
  const pullBackZoom = Math.max(map.getZoom() - 1, 3.5);
  map.easeTo({ zoom: pullBackZoom, pitch: 0, duration: 350, essential: true });
  map.once("moveend", () => {
    map.flyTo({ ...camera, pitch, duration: 1100, curve: 1.3, essential: true });
  });
}

/**
 * MapLibre owns geography; React only ever updates sources/paint/camera
 * imperatively. This component must never be remounted on year change —
 * only its effects should run. See the map rules in AGENTS.md.
 *
 * Effects don't gate on `map.isStyleLoaded()`: that also reads false
 * whenever tiles are mid-download, long after the one-time `load` event
 * has fired — so "not loaded yet, wait for load" silently dropped
 * updates (selection flights, year changes) during any tile fetch. A
 * ready flag set once in our own load handler, plus a keyed queue for
 * anything requested before then, is the reliable version.
 */
export function HistoricalMap({
  year,
  selectedPolityId,
  onSelectPolity,
  visibleLayers,
  onViewportChange,
  focus,
  onReady,
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_ZOOM,
}: HistoricalMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverLabelRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const readyRef = useRef(false);
  const queueRef = useRef(new Map<string, (map: MapLibreMap) => void>());
  const prevSelectedRef = useRef<string | null>(null);
  const yearRafRef = useRef<number | undefined>(undefined);
  const onSelectRef = useRef(onSelectPolity);
  const onViewportChangeRef = useRef(onViewportChange);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onSelectRef.current = onSelectPolity;
    onViewportChangeRef.current = onViewportChange;
    onReadyRef.current = onReady;
  }, [onSelectPolity, onViewportChange, onReady]);

  /** Run now if the map is ready, else once it is. Keyed so only the
   * latest request of each kind survives the wait. */
  const whenReady = useCallback((key: string, fn: (map: MapLibreMap) => void) => {
    const map = mapRef.current;
    if (map && readyRef.current) fn(map);
    else queueRef.current.set(key, fn);
  }, []);

  // Init once.
  useEffect(() => {
    if (!containerRef.current) return;
    const queue = queueRef.current;
    let stopAnimations = () => {};

    const map = new MapLibreMap({
      container: containerRef.current,
      style: BASEMAP_STYLE_URL,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: true, visualizePitch: false }), "top-right");
    map.addControl(new ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");

    map.on("move", () => {
      const c = map.getCenter();
      onViewportChangeRef.current?.([c.lng, c.lat], map.getZoom());
    });

    map.on("load", () => {
      // 3D terrain only where the GPU can afford it — phones get the
      // (cheap, flat) hillshade alone.
      addHistoricalLayers(map, { terrain3d: !window.matchMedia("(max-width: 767px)").matches });

      map.on("click", (e: MapMouseEvent) => {
        const polityId = polityAtPoint(map, e.point);
        // Clicking open ground deselects and levels the camera back out.
        if (!polityId && map.getPitch() > 0) {
          map.easeTo({ pitch: 0, duration: prefersReducedMotion() ? 0 : 600 });
        }
        onSelectRef.current(polityId);
      });
      // Hover: glow + lifted shade via feature-state, and a name/dates label
      // moved directly on the DOM — no React render per mouse move.
      let hovered: string | null = null;
      const setHover = (featureId: string | null) => {
        if (featureId === hovered) return;
        if (hovered) map.setFeatureState({ source: SOURCE_IDS.territory, id: hovered }, { hover: false });
        if (featureId) map.setFeatureState({ source: SOURCE_IDS.territory, id: featureId }, { hover: true });
        hovered = featureId;
      };
      map.on("mousemove", (e: MapMouseEvent) => {
        const hit = territoryAtPoint(map, e.point);
        map.getCanvas().style.cursor = hit ? "pointer" : "";
        setHover(hit?.featureId ?? null);
        const label = hoverLabelRef.current;
        if (!label) return;
        const polity = hit ? getPolityBySlug(hit.polityId) : undefined;
        if (!polity) {
          label.style.opacity = "0";
          return;
        }
        const [name, dates] = label.children as unknown as HTMLElement[];
        name.textContent = polity.name;
        dates.textContent = formatDateRange(polity.period);
        label.style.opacity = "1";
        label.style.transform = `translate(${e.point.x + 14}px, ${e.point.y + 14}px)`;
      });
      map.getCanvas().addEventListener("mouseleave", () => {
        setHover(null);
        if (hoverLabelRef.current) hoverLabelRef.current.style.opacity = "0";
      });

      stopAnimations = startMapAnimations(map);
      readyRef.current = true;
      for (const fn of queue.values()) fn(map);
      queue.clear();
      // "load" only means the style is parsed. The first frame rendered with
      // every tile in is what a viewer would call loaded. ("idle" never
      // fires here: the route/pulse animation repaints every frame.)
      const onRender = () => {
        if (!map.areTilesLoaded()) return;
        map.off("render", onRender);
        onReadyRef.current?.();
      };
      map.on("render", onRender);
    });

    return () => {
      stopAnimations();
      readyRef.current = false;
      map.remove();
      mapRef.current = null;
    };
    // Intentionally run once: subsequent year/selection/layer changes are
    // handled by the effects below, not re-init.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Year + selection: feature-state drives the territory fade and the
  // selection highlight in one pass; a new selection also flies the camera.
  // Coalesced to one update per animation frame — the native range input
  // can fire faster than the browser repaints during a fast drag.
  useEffect(() => {
    whenReady("state", (map) => {
      if (yearRafRef.current !== undefined) cancelAnimationFrame(yearRafRef.current);
      yearRafRef.current = requestAnimationFrame(() => {
        yearRafRef.current = undefined;
        applyHistoricalState(map, year, selectedPolityId);

        if (selectedPolityId && selectedPolityId !== prevSelectedRef.current) {
          const boundary = boundaryForPolity(selectedPolityId, year);
          if (boundary) {
            const bounds = new LngLatBounds();
            const rings =
              boundary.geometry.type === "Polygon"
                ? [boundary.geometry.coordinates[0]]
                : boundary.geometry.coordinates.map((p) => p[0]);
            rings.forEach((ring) => ring.forEach(([lng, lat]) => bounds.extend([lng, lat])));
            cinematicFitBounds(map, bounds);
          }
        }
        prevSelectedRef.current = selectedPolityId;
      });
    });
  }, [year, selectedPolityId, whenReady]);

  useEffect(() => {
    return () => {
      if (yearRafRef.current !== undefined) cancelAnimationFrame(yearRafRef.current);
    };
  }, []);

  // A gentle drift toward an event's place — no zoom punch, no pitch
  // change: it should read as the camera following the story, not a cut.
  useEffect(() => {
    if (!focus) return;
    whenReady("focus", (map) => {
      map.easeTo({
        center: focus.center,
        zoom: Math.max(map.getZoom(), 5.2),
        duration: prefersReducedMotion() ? 0 : 1800,
        essential: true,
      });
    });
    // Keyed on focus.key so re-renders with an equal focus don't re-fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.key, whenReady]);

  // Layer visibility toggles.
  useEffect(() => {
    whenReady("layers", (map) => {
      for (const [toggleId, layerIds] of Object.entries(TOGGLE_LAYER_MAP)) {
        const visible = visibleLayers.has(toggleId as LayerToggleId);
        for (const layerId of layerIds) {
          if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
        }
      }
    });
  }, [visibleLayers, whenReady]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full"
        role="application"
        aria-label="Interactive historical map of the Indian subcontinent"
      />
      <div
        ref={hoverLabelRef}
        className="pointer-events-none absolute left-0 top-0 z-10 border border-ink/15 bg-paper-raised/95 px-2.5 py-1.5 opacity-0 shadow-md transition-opacity duration-150"
        aria-hidden
      >
        <p className="font-display text-sm leading-tight text-ink" />
        <p className="font-sans text-[0.7rem] text-ink-muted" />
      </div>
    </div>
  );
}
