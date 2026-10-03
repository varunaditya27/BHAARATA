import type { Map as MapLibreMap } from "maplibre-gl";
import { boundaries, places } from "@/lib/data/prototype";
import { getHistoricalState, getRoutesAtYear } from "@/lib/geo/historical-state";
import { boundaryId } from "@/lib/geo/to-geojson";
import { LAYER_IDS, SOURCE_IDS } from "./mapStyle";

export const TERRITORY_OPACITY = { inactive: 0, active: 0.58, selected: 0.8 } as const;

/**
 * The one place that turns "year Y, kingdom K selected" into map state.
 * Feature-state writes are idempotent and the paint transitions (in
 * layers.ts) do the fading, so calling this every frame of a scrub is
 * cheap and always correct.
 */
export function applyHistoricalState(map: MapLibreMap, year: number, selectedPolityId: string | null) {
  const state = getHistoricalState(year);
  const activeBoundaryIds = new Set(state.activeBoundaries.map(boundaryId));
  const activeCapitalNames = new Set(state.activePolities.flatMap((p) => p.capitals));

  for (const b of boundaries) {
    const id = boundaryId(b);
    const active = activeBoundaryIds.has(id);
    const selected = active && b.polityId === selectedPolityId;
    map.setFeatureState(
      { source: SOURCE_IDS.territory, id },
      {
        active,
        opacity: !active ? TERRITORY_OPACITY.inactive : selected ? TERRITORY_OPACITY.selected : TERRITORY_OPACITY.active,
        lineOpacity: active ? 1 : 0,
        selected,
      },
    );
  }

  const capitalIds = places
    .filter((p) => p.placeType === "capital" && activeCapitalNames.has(p.name))
    .map((p) => p.id);
  map.setFilter(LAYER_IDS.capitalPulseOuter, ["in", ["get", "placeId"], ["literal", capitalIds]]);

  const routeIds = getRoutesAtYear(year).map((r) => r.id);
  for (const layerId of [LAYER_IDS.routeLines, LAYER_IDS.routeLinesDash]) {
    map.setFilter(layerId, ["in", ["get", "routeId"], ["literal", routeIds]]);
  }
}

/** The boundary to frame for a kingdom in a given year — its shape for
 * that year if it has one, otherwise its first recorded shape. */
export function boundaryForPolity(polityId: string, year: number) {
  const own = boundaries.filter((b) => b.polityId === polityId);
  return own.find((b) => year >= b.validFrom && year <= b.validTo) ?? own[0];
}

/**
 * Which kingdom a click/hover at this point means: only territory that's
 * actually visible this year (every polygon is always loaded, invisibly),
 * and the smallest one when several overlap — Hoysala sitting inside the
 * Chalukya extent should win, not lose to it.
 */
export function polityAtPoint(map: MapLibreMap, point: { x: number; y: number }): string | null {
  const hits = map
    .queryRenderedFeatures([point.x, point.y], { layers: [LAYER_IDS.territoryFill] })
    .filter((f) => map.getFeatureState({ source: SOURCE_IDS.territory, id: f.id as string }).active);
  if (hits.length === 0) return null;
  hits.sort((a, b) => (a.properties.area as number) - (b.properties.area as number));
  return hits[0].properties.polityId as string;
}
