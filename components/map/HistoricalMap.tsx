"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  LngLatBounds,
  Map as MapLibreMap,
  MapGeoJSONFeature,
  MapMouseEvent,
  NavigationControl,
  ScaleControl,
  setWorkerUrl,
} from "maplibre-gl";
import { useEffect, useRef } from "react";
import { boundaries, places, routes } from "@/lib/data/prototype";
import { getHistoricalState, getRoutesAtYear } from "@/lib/geo/historical-state";
import { boundariesToFeatureCollection, placesToFeatureCollection, routesToFeatureCollection } from "@/lib/geo/to-geojson";
import { PLACE_ICON_EXPRESSION, registerMapIcons } from "./mapIcons";
import type { LayerToggleId } from "./MapLegend";
import { BASEMAP_STYLE_URL, LAYER_IDS, SOURCE_IDS } from "./mapStyle";

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
  initialCenter?: [number, number];
  initialZoom?: number;
};

const DEFAULT_CENTER: [number, number] = [78.5, 12.5];
const DEFAULT_ZOOM = 5.2;

const TOGGLE_LAYER_MAP: Record<LayerToggleId, string[]> = {
  territory: [LAYER_IDS.territoryFill, LAYER_IDS.territoryOutline],
  places: [LAYER_IDS.placePoints, LAYER_IDS.placeLabels, LAYER_IDS.placeIcons],
  routes: [LAYER_IDS.routeLines, LAYER_IDS.routeLinesDash],
};

/** Classic "marching ants" dash-phase sequence (Mapbox/MapLibre pattern):
 * cycling through these line-dasharray values reads as the dash pattern
 * travelling along the line. */
const DASH_SEQUENCE: number[][] = [
  [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5],
  [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0],
  [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5],
  [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5],
];

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Pull back, then fly in — the staged camera move from
 * IMPLEMENTATION_PLAN.md §23.2 ("India → South India → Thanjavur"),
 * instead of a single flat fitBounds. */
function cinematicFitBounds(map: MapLibreMap, bounds: LngLatBounds) {
  if (prefersReducedMotion()) {
    map.fitBounds(bounds, { padding: 80, duration: 0, maxZoom: 7 });
    return;
  }
  const pullBackZoom = Math.max(map.getZoom() - 1, 3.5);
  map.easeTo({ zoom: pullBackZoom, duration: 350, essential: true });
  map.once("moveend", () => {
    map.fitBounds(bounds, { padding: 80, duration: 950, maxZoom: 7, essential: true });
  });
}

/**
 * MapLibre owns geography; React only ever updates sources/paint/camera
 * imperatively. This component must never be remounted on year change —
 * only its effects should run. See historical-map skill rules in AGENTS.md.
 *
 * Territory fade ("ink bleed") works by loading ALL boundaries once and
 * driving visibility purely through feature-state opacity + a paint
 * transition — not by swapping source data per year. That's what lets a
 * kingdom's territory smoothly appear/strengthen/fade instead of popping.
 */
export function HistoricalMap({
  year,
  selectedPolityId,
  onSelectPolity,
  visibleLayers,
  onViewportChange,
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_ZOOM,
}: HistoricalMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onViewportChangeRef = useRef(onViewportChange);
  const prevSelectedRef = useRef<string | null>(null);
  const animationHandleRef = useRef<{ raf?: number; interval?: ReturnType<typeof setInterval> }>({});
  const yearEffectRafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    onViewportChangeRef.current = onViewportChange;
  }, [onViewportChange]);

  // Init once.
  useEffect(() => {
    if (!containerRef.current) return;
    const handle = animationHandleRef.current;

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
      registerMapIcons(map);

      map.addSource(SOURCE_IDS.territory, {
        type: "geojson",
        data: boundariesToFeatureCollection(boundaries),
        promoteId: "polityId",
      });
      map.addSource(SOURCE_IDS.places, {
        type: "geojson",
        data: placesToFeatureCollection(places),
        promoteId: "placeId",
      });
      map.addSource(SOURCE_IDS.routes, {
        type: "geojson",
        data: routesToFeatureCollection(routes),
        promoteId: "routeId",
      });

      map.addLayer({
        id: LAYER_IDS.territoryFill,
        type: "fill",
        source: SOURCE_IDS.territory,
        paint: {
          "fill-color": ["get", "accentColor"],
          "fill-opacity": ["coalesce", ["feature-state", "opacity"], 0],
          "fill-opacity-transition": { duration: 500, delay: 0 },
        },
      });
      map.addLayer({
        id: LAYER_IDS.territoryOutline,
        type: "line",
        source: SOURCE_IDS.territory,
        paint: {
          "line-color": ["get", "outlineColor"],
          "line-width": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            3.5,
            2,
          ],
          "line-opacity": ["coalesce", ["feature-state", "lineOpacity"], 0],
          "line-opacity-transition": { duration: 500, delay: 0 },
        },
      });

      map.addLayer({
        id: LAYER_IDS.routeLines,
        type: "line",
        source: SOURCE_IDS.routes,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["get", "accentColor"],
          "line-width": 1.25,
          "line-opacity": 0.5,
        },
      });
      map.addLayer({
        id: LAYER_IDS.routeLinesDash,
        type: "line",
        source: SOURCE_IDS.routes,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["get", "accentColor"],
          "line-width": 2,
          "line-dasharray": DASH_SEQUENCE[0],
        },
      });

      map.addLayer({
        id: LAYER_IDS.capitalPulseOuter,
        type: "circle",
        source: SOURCE_IDS.places,
        filter: ["==", ["get", "placeType"], "__none__"],
        paint: {
          "circle-radius": 8,
          "circle-color": "#241f17",
          "circle-opacity": 0.15,
          "circle-stroke-width": 0,
        },
      });

      map.addLayer({
        id: LAYER_IDS.placePoints,
        type: "circle",
        source: SOURCE_IDS.places,
        paint: {
          "circle-radius": 3,
          "circle-color": "#241f17",
          "circle-stroke-width": 1,
          "circle-stroke-color": "#f3ede0",
        },
      });
      map.addLayer({
        id: LAYER_IDS.placeIcons,
        type: "symbol",
        source: SOURCE_IDS.places,
        minzoom: 6,
        layout: {
          "icon-image": PLACE_ICON_EXPRESSION as unknown as string,
          "icon-size": 0.65,
          "icon-allow-overlap": true,
        },
      });
      map.addLayer({
        id: LAYER_IDS.placeLabels,
        type: "symbol",
        source: SOURCE_IDS.places,
        minzoom: 5,
        layout: {
          "text-field": ["get", "name"],
          "text-size": 11,
          "text-offset": [0, 1.3],
          "text-anchor": "top",
          "text-font": ["Ranade Medium"],
        },
        paint: {
          "text-color": "#241f17",
          "text-halo-color": "#f3ede0",
          "text-halo-width": 1.2,
        },
      });

      for (const [toggleId, layerIds] of Object.entries(TOGGLE_LAYER_MAP)) {
        const visible = visibleLayers.has(toggleId as LayerToggleId);
        for (const layerId of layerIds) {
          map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
        }
      }

      map.on(
        "click",
        LAYER_IDS.territoryFill,
        (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
          const feature = e.features?.[0];
          const polityId = feature?.properties?.polityId as string | undefined;
          onSelectPolity(polityId ?? null);
        },
      );
      map.on("mouseenter", LAYER_IDS.territoryFill, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", LAYER_IDS.territoryFill, () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("click", (e: MapMouseEvent) => {
        const hits = map.queryRenderedFeatures(e.point, { layers: [LAYER_IDS.territoryFill] });
        if (hits.length === 0) onSelectPolity(null);
      });

      // Marching-ants + capital pulse — one shared clock, skipped entirely
      // under prefers-reduced-motion rather than just frozen mid-frame.
      if (!prefersReducedMotion()) {
        let dashIndex = 0;
        const dashInterval = setInterval(() => {
          dashIndex = (dashIndex + 1) % DASH_SEQUENCE.length;
          if (map.getLayer(LAYER_IDS.routeLinesDash)) {
            map.setPaintProperty(LAYER_IDS.routeLinesDash, "line-dasharray", DASH_SEQUENCE[dashIndex]);
          }
        }, 60);

        const startedAt = performance.now();
        const tickPulse = () => {
          const t = (performance.now() - startedAt) / 1000;
          const phase = (Math.sin(t * 2.2) + 1) / 2; // 0..1
          if (map.getLayer(LAYER_IDS.capitalPulseOuter)) {
            map.setPaintProperty(LAYER_IDS.capitalPulseOuter, "circle-radius", 7 + phase * 9);
            map.setPaintProperty(LAYER_IDS.capitalPulseOuter, "circle-opacity", 0.22 - phase * 0.18);
          }
          handle.raf = requestAnimationFrame(tickPulse);
        };
        handle.raf = requestAnimationFrame(tickPulse);
        handle.interval = dashInterval;
      }

      const c = map.getCenter();
      onViewportChangeRef.current?.([c.lng, c.lat], map.getZoom());
    });

    return () => {
      if (handle.raf) cancelAnimationFrame(handle.raf);
      if (handle.interval) clearInterval(handle.interval);
      map.remove();
      mapRef.current = null;
    };
    // Intentionally run once: subsequent year/selection/layer changes are
    // handled by the effects below via setFeatureState/setFilter/
    // setLayoutProperty, not re-init.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Year + selection changes: feature-state drives the territory fade
  // (ink bleed) and the selection highlight in one pass — plus the
  // capital-pulse filter and route filter, plus the staged camera flight.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const run = () => {
      const state = getHistoricalState(year);
      const activePolityIds = new Set(state.activePolities.map((p) => p.id));
      const activeCapitalNames = new Set(state.activePolities.flatMap((p) => p.capitals));

      for (const boundary of boundaries) {
        const isActive = activePolityIds.has(boundary.polityId);
        const isSelected = boundary.polityId === selectedPolityId;
        map.setFeatureState(
          { source: SOURCE_IDS.territory, id: boundary.polityId },
          {
            opacity: !isActive ? 0 : isSelected ? 0.8 : 0.58,
            lineOpacity: isActive ? 1 : 0,
            selected: isSelected,
          },
        );
      }

      const activeCapitalIds = places
        .filter((p) => p.placeType === "capital" && activeCapitalNames.has(p.name))
        .map((p) => p.id);
      if (map.getLayer(LAYER_IDS.capitalPulseOuter)) {
        map.setFilter(LAYER_IDS.capitalPulseOuter, [
          "in",
          ["get", "placeId"],
          ["literal", activeCapitalIds],
        ]);
      }

      const activeRouteIds = getRoutesAtYear(year).map((r) => r.id);
      for (const layerId of [LAYER_IDS.routeLines, LAYER_IDS.routeLinesDash]) {
        if (map.getLayer(layerId)) {
          map.setFilter(layerId, ["in", ["get", "routeId"], ["literal", activeRouteIds]]);
        }
      }

      if (selectedPolityId && selectedPolityId !== prevSelectedRef.current) {
        const boundary = boundaries.find((b) => b.polityId === selectedPolityId);
        if (boundary) {
          const bounds = new LngLatBounds();
          const ring =
            boundary.geometry.type === "Polygon"
              ? boundary.geometry.coordinates[0]
              : boundary.geometry.coordinates[0]?.[0];
          ring?.forEach(([lng, lat]) => bounds.extend([lng, lat]));
          cinematicFitBounds(map, bounds);
        }
      }
      prevSelectedRef.current = selectedPolityId;
    };

    // Coalesce to at most one update per animation frame — the native
    // range input can fire faster than the browser repaints during a
    // fast drag, and without this the feature-state writes queue up
    // behind each other instead of the scrub feeling continuous.
    if (map.isStyleLoaded()) {
      if (yearEffectRafRef.current !== undefined) cancelAnimationFrame(yearEffectRafRef.current);
      yearEffectRafRef.current = requestAnimationFrame(run);
    } else {
      map.once("load", run);
    }

    return () => {
      if (yearEffectRafRef.current !== undefined) {
        cancelAnimationFrame(yearEffectRafRef.current);
        yearEffectRafRef.current = undefined;
      }
    };
  }, [year, selectedPolityId]);

  // Layer visibility toggles.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      for (const [toggleId, layerIds] of Object.entries(TOGGLE_LAYER_MAP)) {
        const visible = visibleLayers.has(toggleId as LayerToggleId);
        for (const layerId of layerIds) {
          if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
          }
        }
      }
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [visibleLayers]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="application"
      aria-label="Interactive historical map of the Indian subcontinent"
    />
  );
}
