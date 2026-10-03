"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  type GeoJSONSource,
  LngLatBounds,
  Map as MapLibreMap,
  MapMouseEvent,
  NavigationControl,
  Popup,
  ScaleControl,
  setWorkerUrl,
} from "maplibre-gl";
import { useCallback, useEffect, useRef } from "react";
import { prefersReducedMotion, startMapAnimations } from "./animations";
import { applyHistoricalState, boundaryForPolity, polityAtPoint, territoryAtPoint } from "./apply-state";
import { captureMapCanvas } from "./export-image";
import { addHistoricalLayers, ensureMonuments, ensureSites } from "./layers";
import type { LayerToggleId } from "./MapLegend";
import { BASEMAP_STYLE_URL, LAYER_IDS, SOURCE_IDS } from "./mapStyle";
import { events, getPolityBySlug } from "@/lib/data/prototype";
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
  /** Filled with a function returning the current map frame as a canvas
   * (for "save as image"); null until the map exists. */
  captureRef?: React.RefObject<(() => Promise<HTMLCanvasElement>) | null>;
  /** Filled with the MapLibre instance once its layers are ready — for
   * imperative camera sync between the two maps in compare view. */
  instanceRef?: React.RefObject<MapLibreMap | null>;
  initialCenter?: [number, number];
  initialZoom?: number;
};

// The whole subcontinent: kingdoms now run from Punjab and Bengal to Sri Lanka.
const DEFAULT_CENTER: [number, number] = [80, 18.6];
const DEFAULT_ZOOM = 3.95;

const TOGGLE_LAYER_MAP: Record<LayerToggleId, string[]> = {
  territory: [
    LAYER_IDS.territoryFill,
    LAYER_IDS.frontierHatch,
    LAYER_IDS.territoryGlow,
    LAYER_IDS.territoryEcho,
    LAYER_IDS.territoryOutline,
    LAYER_IDS.kingdomLabels,
  ],
  places: [LAYER_IDS.placePoints, LAYER_IDS.placeLabels, LAYER_IDS.placeIcons, LAYER_IDS.capitalSeals],
  routes: [LAYER_IDS.routeLines, LAYER_IDS.routeLinesDash, LAYER_IDS.routeArrows, LAYER_IDS.routeMovers],
  relief: [LAYER_IDS.hillshade, LAYER_IDS.riverFlow],
  battles: [LAYER_IDS.battleRings, LAYER_IDS.battleLabels],
  monuments: [LAYER_IDS.monumentClusters, LAYER_IDS.monumentClusterCount, LAYER_IDS.monumentPoints],
  sites: [LAYER_IDS.sitePoints, LAYER_IDS.siteLabels],
};

/** Layers whose features can be clicked for a small popup. */
const POPUP_LAYERS = [LAYER_IDS.battleRings, LAYER_IDS.sitePoints, LAYER_IDS.monumentPoints, LAYER_IDS.monumentClusters];

function popupLine(parent: HTMLElement, tag: "p" | "a", text: string, className: string, href?: string) {
  const el = document.createElement(tag);
  el.textContent = text; // textContent, never HTML: names come from Wikidata
  el.className = className;
  if (href && el instanceof HTMLAnchorElement) {
    el.href = href;
    if (href.startsWith("http")) {
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    }
  }
  parent.appendChild(el);
}

/** Keep the selected territory clear of whatever panel covers the map:
 * the bottom sheet on phones, the floating card on the right on desktop. */
function fitPadding() {
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  return mobile
    ? { top: 64, bottom: 200, left: 24, right: 24 }
    : { top: 60, bottom: 60, left: 80, right: 380 };
}

/** Pull back, then fly in — a staged camera move (wide view, then down to
 * the kingdom) instead of a single flat fitBounds, so the reader sees where
 * in the subcontinent they are being taken. */
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
  captureRef,
  instanceRef,
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
    if (captureRef) captureRef.current = () => captureMapCanvas(map);
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
        // Battles, monuments and clusters take the click before any kingdom underneath.
        const layers = POPUP_LAYERS.filter((id) => map.getLayer(id) && map.getLayoutProperty(id, "visibility") !== "none");
        const hit = layers.length ? map.queryRenderedFeatures(e.point, { layers })[0] : undefined;
        if (hit) {
          const props = hit.properties as Record<string, string | number>;
          const coords = (hit.geometry as GeoJSON.Point).coordinates as [number, number];
          if (props.cluster_id !== undefined) {
            (map.getSource(SOURCE_IDS.monuments) as GeoJSONSource).getClusterExpansionZoom(Number(props.cluster_id)).then((zoom) => {
              map.easeTo({ center: coords, zoom: zoom + 0.5, duration: prefersReducedMotion() ? 0 : 500 });
            });
            return;
          }
          const box = document.createElement("div");
          if (hit.layer.id === LAYER_IDS.battleRings) {
            const ev = events.find((x) => x.id === props.eventId);
            popupLine(box, "p", `Battle · ${props.year}`, "bh-popup-eyebrow");
            popupLine(box, "p", String(props.name), "bh-popup-title");
            if (ev) popupLine(box, "p", ev.summary.length > 260 ? ev.summary.slice(0, 257).replace(/\s+\S*$/, "") + "…" : ev.summary, "bh-popup-text");
            popupLine(box, "a", "More in the chronology →", "bh-popup-link", `/chronology#${props.slug}`);
          } else if (hit.layer.id === LAYER_IDS.sitePoints) {
            const kind = String(props.t);
            popupLine(box, "p", `${kind.charAt(0).toUpperCase()}${kind.slice(1)} · built c. ${props.y}`, "bh-popup-eyebrow");
            popupLine(box, "p", String(props.n), "bh-popup-title");
            if (props.i) {
              // A thumbnail linked from Wikimedia Commons, with its credit; nothing is copied into the site.
              const fig = document.createElement("figure");
              fig.className = "bh-popup-photo";
              const img = document.createElement("img");
              img.src = String(props.i);
              img.alt = String(props.n);
              img.loading = "lazy";
              fig.appendChild(img);
              popupLine(fig, "a", String(props.c), "bh-popup-credit", String(props.p));
              box.appendChild(fig);
            }
            if (props.d) popupLine(box, "p", String(props.d), "bh-popup-text");
            popupLine(box, "p", "Date of construction from Wikidata; many such dates are approximate.", "bh-popup-note");
            if (props.w) popupLine(box, "a", "Read on Wikipedia →", "bh-popup-link", `https://en.wikipedia.org/wiki/${encodeURIComponent(String(props.w))}`);
          } else {
            popupLine(box, "p", "Protected monument today", "bh-popup-eyebrow");
            popupLine(box, "p", String(props.n), "bh-popup-title");
            popupLine(box, "p", "Looked after by the Archaeological Survey of India. Not tied to a year on this map.", "bh-popup-text");
            if (props.w) popupLine(box, "a", "Read on Wikipedia →", "bh-popup-link", `https://en.wikipedia.org/wiki/${encodeURIComponent(String(props.w))}`);
            else popupLine(box, "a", "See it on Wikidata →", "bh-popup-link", `https://www.wikidata.org/wiki/${props.q}`);
          }
          new Popup({ offset: 12, maxWidth: "280px", closeButton: true }).setLngLat(coords).setDOMContent(box).addTo(map);
          return;
        }
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
        const popupLayers = POPUP_LAYERS.filter((id) => map.getLayer(id));
        const overPoint = popupLayers.length > 0 && map.queryRenderedFeatures(e.point, { layers: popupLayers }).length > 0;
        map.getCanvas().style.cursor = hit || overPoint ? "pointer" : "";
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
      // "load" only means the style is parsed; ready is the first frame with
      // every tile in. "idle" rarely fires (the route/pulse animation repaints
      // every frame), so whichever of the checks below comes first wins, with
      // a 4s fallback so the loading cover can't get stuck.
      let readied = false;
      const markReady = () => {
        if (readied) return;
        readied = true;
        map.off("render", onRender);
        clearTimeout(fallback);
        if (instanceRef) instanceRef.current = map;
        onReadyRef.current?.();
      };
      // The basemap and the history layers — not terrain (decoration that
      // can fill in afterwards; its tiles are the slowest), nor the ships/
      // travellers source, which gets new data thirty times a second and so
      // is almost never "loaded".
      const notWaitedFor = new Set<string>([SOURCE_IDS.routeMovers, SOURCE_IDS.dem, SOURCE_IDS.demTerrain]);
      const onRender = () => {
        const ids = Object.keys(map.getStyle().sources).filter((id) => !notWaitedFor.has(id));
        if (ids.every((id) => map.isSourceLoaded(id))) markReady();
      };
      const fallback = setTimeout(markReady, 4000);
      map.on("render", onRender);
      map.once("idle", markReady);
    });

    return () => {
      stopAnimations();
      readyRef.current = false;
      map.remove();
      mapRef.current = null;
      if (captureRef) captureRef.current = null;
      if (instanceRef) instanceRef.current = null;
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
      if (visibleLayers.has("monuments")) ensureMonuments(map);
      if (visibleLayers.has("sites")) ensureSites(map);
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
