"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { type ExpressionSpecification, LngLatBounds, Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAtlasData } from "@/components/layout/AtlasDataProvider";
import { polityGeometry } from "@/lib/geo/silhouette";
import { prefersReducedMotion } from "./animations";
import { MapLoading } from "./MapLoading";
import { BASEMAP_STYLE_URL, TERRAIN_SOURCE } from "./mapStyle";

if (typeof window !== "undefined") setWorkerUrl("/vendor/maplibre-gl-worker.js");

export type MapPlace = { id: string; name: string; slug: string; coordinates: [number, number]; color: string; heldBy: string[] };

const KINGDOMS = "pl-kingdoms";
const PLACES = "pl-places";

/**
 * The places of the atlas on the real base map: shaded relief and a tilted camera, every kingdom laid in its own
 * colour beneath, and each capital a marker in its kingdom's colour. A marker lights its row in the list and the
 * row lights its marker; a marker opens its page.
 */
export function PlacesMap({ places, activeId, onActive }: { places: MapPlace[]; activeId: string | null; onActive: (id: string | null) => void }) {
  const router = useRouter();
  const data = useAtlasData();
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  // The map is built once; these are read at that moment and whenever the pointer acts.
  const latest = useRef({ places, data, router, onActive });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    latest.current = { places, data, router, onActive };
  });

  useEffect(() => {
    if (!container.current) return;
    const { places, data, router } = latest.current;
    const map = new MapLibreMap({
      container: container.current,
      style: BASEMAP_STYLE_URL,
      center: [80, 19],
      zoom: 2.4,
      minZoom: 2,
      maxZoom: 11,
      cooperativeGestures: true,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    const resizer = new ResizeObserver(() => map.resize());
    resizer.observe(container.current);
    map.addControl(new NavigationControl({ visualizePitch: true }), "bottom-left");

    map.on("load", () => {
      // Relief: a shaded surface, and the same elevation lifted into 3D.
      map.addSource("pl-dem", { ...TERRAIN_SOURCE, tiles: [...TERRAIN_SOURCE.tiles] });
      map.addLayer({
        id: "pl-hillshade",
        type: "hillshade",
        source: "pl-dem",
        paint: {
          "hillshade-exaggeration": 0.8,
          "hillshade-illumination-direction": 315,
          "hillshade-shadow-color": "rgba(0,70,90,0.6)",
          "hillshade-highlight-color": "rgba(255,255,255,0.5)",
          "hillshade-accent-color": "rgba(0,70,90,0.3)",
        },
      });
      map.addSource("pl-dem-3d", { ...TERRAIN_SOURCE, tiles: [...TERRAIN_SOURCE.tiles] });
      map.setTerrain({ source: "pl-dem-3d", exaggeration: 2 });

      // Every kingdom, in its own colour.
      const kingdoms = data.polities.flatMap((polity) => {
        const geometry = polityGeometry(polity.id, data);
        return geometry ? [{ type: "Feature" as const, geometry, properties: { id: polity.id, color: polity.accentColor } }] : [];
      });
      map.addSource(KINGDOMS, { type: "geojson", data: { type: "FeatureCollection", features: kingdoms } });
      // Quiet by default: faint outlines of every kingdom. The ones that held the chosen place light up in colour.
      map.addLayer({ id: "pl-kingdom-base", type: "line", source: KINGDOMS, paint: { "line-color": "#06242b", "line-width": 0.7, "line-opacity": 0.16 } });
      const none: ExpressionSpecification = ["in", ["get", "id"], ["literal", [] as string[]]];
      map.addLayer({ id: "pl-kingdom-fill", type: "fill", source: KINGDOMS, filter: none, paint: { "fill-color": ["get", "color"], "fill-opacity": 0.12 } });
      map.addLayer({ id: "pl-kingdom-line", type: "line", source: KINGDOMS, filter: none, paint: { "line-color": ["get", "color"], "line-width": 3, "line-opacity": 1 } });

      // The capitals.
      map.addSource(PLACES, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: places.map((p) => ({
            type: "Feature" as const,
            id: undefined,
            geometry: { type: "Point" as const, coordinates: p.coordinates },
            properties: { id: p.id, name: p.name, slug: p.slug, color: p.color },
          })),
        },
      });
      map.addLayer({ id: "pl-halo", type: "circle", source: PLACES, paint: { "circle-radius": 9, "circle-color": "#ffffff", "circle-opacity": 0.95 } });
      map.addLayer({
        id: "pl-dot",
        type: "circle",
        source: PLACES,
        paint: { "circle-radius": 5.5, "circle-color": ["get", "color"], "circle-stroke-width": 1.2, "circle-stroke-color": "#06242b" },
      });
      map.addLayer({
        id: "pl-label",
        type: "symbol",
        source: PLACES,
        minzoom: 5.6,
        layout: { "text-field": ["get", "name"], "text-font": ["Ranade Medium"], "text-size": 13, "text-offset": [0, 1.35], "text-anchor": "top" },
        paint: { "text-color": "#06242b", "text-halo-color": "#ffffff", "text-halo-width": 1.8 },
      });

      map.on("mousemove", "pl-dot", (e) => {
        map.getCanvas().style.cursor = "pointer";
        latest.current.onActive((e.features?.[0]?.properties?.id as string) ?? null);
      });
      map.on("mouseleave", "pl-dot", () => {
        map.getCanvas().style.cursor = "";
        latest.current.onActive(null);
      });
      map.on("click", "pl-dot", (e) => {
        const slug = e.features?.[0]?.properties?.slug as string | undefined;
        if (slug) router.push(`/places/${slug}`);
      });

      // The opening: the camera settles over the subcontinent and tips toward the relief.
      map.resize();
      const bounds = places.reduce((b, p) => b.extend(p.coordinates), new LngLatBounds(places[0].coordinates, places[0].coordinates));
      const camera = map.cameraForBounds(bounds, { padding: { top: 110, bottom: 60, left: 60, right: 60 } });
      if (camera) {
        map.flyTo({ ...camera, pitch: 46, bearing: -10, duration: prefersReducedMotion() ? 0 : 3400, essential: true });
      }
      map.once("idle", () => setReady(true));
    });

    return () => {
      resizer.disconnect();
      markerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // The place under the pointer, or in the list: a pulsing ring, and the camera follows if it is out of view.
  useEffect(() => {
    const map = mapRef.current;
    markerRef.current?.remove();
    markerRef.current = null;
    const place = places.find((p) => p.id === activeId);
    if (map && !place) {
      const none: ExpressionSpecification = ["in", ["get", "id"], ["literal", [] as string[]]];
      for (const id of ["pl-kingdom-fill", "pl-kingdom-line"]) if (map.getLayer(id)) map.setFilter(id, none);
    }
    if (!map || !place) return;
    const tag = document.createElement("div");
    tag.className = "bh-place-tag";
    tag.style.setProperty("--ring", place.color);
    tag.innerHTML = `<span class="bh-place-ping"></span><span class="bh-place-chip"></span>`;
    (tag.querySelector(".bh-place-chip") as HTMLElement).textContent = place.name;
    markerRef.current = new Marker({ element: tag }).setLngLat(place.coordinates).addTo(map);
    // The kingdoms that held this place light up.
    const lit: ExpressionSpecification = ["in", ["get", "id"], ["literal", place.heldBy]];
    for (const id of ["pl-kingdom-fill", "pl-kingdom-line"]) if (map.getLayer(id)) map.setFilter(id, lit);
    if (!map.getBounds().contains(place.coordinates)) map.easeTo({ center: place.coordinates, duration: prefersReducedMotion() ? 0 : 700 });
  }, [activeId, places]);

  return (
    <div className="relative h-[calc(100dvh-8rem)] min-h-[520px] w-full overflow-hidden bg-[#052a31]">
      <div ref={container} className="h-full w-full" />
      <MapLoading visible={!ready} />
    </div>
  );
}

