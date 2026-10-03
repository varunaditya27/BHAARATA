import { polities } from "@/lib/data/prototype";
import type { HistoricalBoundary, HistoricalRoute, Place } from "@/lib/domain/types";
import { darkenHex } from "@/lib/utils/color";

const accentByPolityId = new Map(polities.map((p) => [p.id, p.accentColor]));

/**
 * MapLibre owns rendering; React only ever hands it GeoJSON + paint
 * expressions. Feature ids are the polity id so feature-state (selection,
 * hover) can target them without rebuilding the source.
 */
export function boundariesToFeatureCollection(
  boundaries: HistoricalBoundary[],
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: boundaries.map((b) => ({
      type: "Feature",
      id: b.polityId,
      properties: {
        polityId: b.polityId,
        confidence: b.confidence,
        accentColor: accentByPolityId.get(b.polityId) ?? "#96341a",
        outlineColor: darkenHex(accentByPolityId.get(b.polityId) ?? "#96341a", 0.35),
      },
      geometry: b.geometry,
    })),
  };
}

export function placesToFeatureCollection(places: Place[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: places.map((place) => ({
      type: "Feature",
      id: place.id,
      properties: {
        placeId: place.id,
        name: place.name,
        placeType: place.placeType,
      },
      geometry: {
        type: "Point",
        coordinates: place.coordinates,
      },
    })),
  };
}

export function routesToFeatureCollection(routes: HistoricalRoute[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: routes.map((route) => ({
      type: "Feature",
      id: route.id,
      properties: {
        routeId: route.id,
        label: route.label,
        routeType: route.routeType,
        accentColor: accentByPolityId.get(route.polityIds[0] ?? "") ?? "#5c5447",
      },
      geometry: route.path,
    })),
  };
}
