import { polities } from "@/lib/data/prototype";
import type { HistoricalBoundary, HistoricalEvent, HistoricalRoute, Place, Polity } from "@/lib/domain/types";
import { darkenHex } from "@/lib/utils/color";
import frontierGeometries from "@/lib/data/geo/frontiers.json";
import labelPoints from "@/lib/data/geo/labels.json";

const nameByPolityId = new Map(polities.map((p) => [p.id, p.name]));

const accentByPolityId = new Map(polities.map((p) => [p.id, p.accentColor]));

/*
 * MapLibre owns rendering; React only ever hands it GeoJSON + paint
 * expressions. Each feature carries a stable id (promoted from its
 * properties) so feature-state — visibility, selection — can target it
 * without rebuilding the source.
 */

/** Stable id for one dated boundary snapshot — a kingdom can have several
 * (different extents in different centuries), so the polity id alone
 * isn't unique enough to address feature-state. */
export function boundaryId(b: Pick<HistoricalBoundary, "polityId" | "validFrom">): string {
  return `${b.polityId}-${b.validFrom}`;
}

function ringArea(ring: GeoJSON.Position[]): number {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    sum += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  }
  return Math.abs(sum / 2);
}

/** Planar area in degrees² — only ever compared against other boundaries
 * (to pick the most specific one under a click), never shown. */
function geometryArea(g: GeoJSON.Polygon | GeoJSON.MultiPolygon): number {
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  return polys.reduce((acc, rings) => acc + ringArea(rings[0]) - rings.slice(1).reduce((h, r) => h + ringArea(r), 0), 0);
}

export function boundariesToFeatureCollection(
  boundaries: HistoricalBoundary[],
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: boundaries.map((b) => ({
      type: "Feature",
      properties: {
        boundaryId: boundaryId(b),
        area: geometryArea(b.geometry),
        polityId: b.polityId,
        confidence: b.confidence,
        accentColor: accentByPolityId.get(b.polityId) ?? "#96341a",
        outlineColor: darkenHex(accentByPolityId.get(b.polityId) ?? "#96341a", 0.35),
      },
      geometry: b.geometry,
    })),
  };
}

/**
 * The inner band along each boundary's edge (precomputed: the polygon
 * minus an inward buffer sized so the band is ~28% of the territory).
 * Drawn hatched — the atlas convention for "approximate frontier" — so
 * the uncertainty of where a kingdom ended is visible, not just
 * footnoted (PROJECT_BIBLE.md §8).
 */
/** Ids of the boundaries that have a hatched frontier band. */
export const hasFrontier: ReadonlySet<string> = new Set(Object.keys(frontierGeometries));

export function frontiersToFeatureCollection(boundaries: HistoricalBoundary[]): GeoJSON.FeatureCollection {
  const geoms = frontierGeometries as Record<string, GeoJSON.Polygon | GeoJSON.MultiPolygon>;
  return {
    type: "FeatureCollection",
    features: boundaries
      .filter((b) => geoms[boundaryId(b)])
      .map((b) => ({
        type: "Feature",
        properties: { boundaryId: boundaryId(b), polityId: b.polityId },
        geometry: geoms[boundaryId(b)],
      })),
  };
}

/**
 * One label point per boundary, at the shape's pole of inaccessibility
 * (precomputed — the interior point farthest from any edge, which is
 * where an atlas sets an area name; a centroid can fall outside an
 * irregular shape or right on its frontier). Parentheticals are dropped
 * for the map: "Chalukya (Kalyani)" prints as CHALUKYA.
 */
export function kingdomLabelsToFeatureCollection(boundaries: HistoricalBoundary[]): GeoJSON.FeatureCollection {
  const points = labelPoints as Record<string, number[]>;
  return {
    type: "FeatureCollection",
    features: boundaries
      .filter((b) => points[boundaryId(b)])
      .map((b) => ({
        type: "Feature",
        properties: {
          boundaryId: boundaryId(b),
          polityId: b.polityId,
          label: (nameByPolityId.get(b.polityId) ?? b.polityId).replace(/\s*\(.*\)\s*/g, ""),
          labelColor: darkenHex(accentByPolityId.get(b.polityId) ?? "#96341a", 0.55),
        },
        geometry: { type: "Point", coordinates: points[boundaryId(b)] },
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

/** Battles as points; `year` drives the "only near its own year" filter. */
export function battlesToFeatureCollection(events: HistoricalEvent[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: events
      .filter((e) => e.category === "battle" && e.location)
      .map((e) => ({
        type: "Feature",
        id: e.id,
        properties: { eventId: e.id, slug: e.slug, name: e.title, year: e.period.startYear },
        geometry: { type: "Point", coordinates: e.location as [number, number] },
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
        // Glyphs on a route (arrows, ships) sit over that same kingdom's
        // fill, so they take a darker shade to stay visible.
        glyphColor: darkenHex(accentByPolityId.get(route.polityIds[0] ?? "") ?? "#5c5447", 0.45),
      },
      geometry: route.path,
    })),
  };
}

/** One point per (kingdom, capital) pair, for the seal stamped at each
 * capital. Matches capitals by name prefix, as the entity pages do
 * ("Dorasamudra" → "Dorasamudra (Halebidu)"). */
export function capitalSealsToFeatureCollection(polities: Polity[], places: Place[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: polities.flatMap((polity) =>
      places
        .filter((place) => polity.capitals.some((c) => place.name.startsWith(c)))
        .map((place) => ({
          type: "Feature" as const,
          id: `${polity.id}:${place.id}`,
          properties: { polityId: polity.id, placeId: place.id },
          geometry: { type: "Point" as const, coordinates: place.coordinates },
        })),
    ),
  };
}
