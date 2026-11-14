import type { AtlasData } from "@/lib/data/atlas-data";
import type { HistoricalBoundary, HistoricalEvent, HistoricalRoute, Place, Polity } from "@/lib/domain/types";
import { darkenHex } from "@/lib/utils/color";

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

/**
 * Chaikin corner-cutting subdivision for closed GeoJSON rings.
 * Turns coarse, angular Cliopatria vertices into smooth, hand-inked
 * cartographic curves while keeping the ring closed and topology intact.
 */
function smoothRing(ring: GeoJSON.Position[], iterations = 2): GeoJSON.Position[] {
  if (ring.length < 5) return ring;
  // Strip closing duplicate vertex before subdivision
  let pts = ring.slice(0, -1);
  for (let iter = 0; iter < iterations; iter++) {
    if (pts.length > 420) break; // Avoid over-subdividing already dense rings
    const next: GeoJSON.Position[] = [];
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const p0 = pts[i];
      const p1 = pts[(i + 1) % n];
      const dx = p1[0] - p0[0];
      const dy = p1[1] - p0[1];
      // Only subdivide segments long enough to show visible angularity
      if (dx * dx + dy * dy < 0.0025) {
        next.push(p0);
        continue;
      }
      next.push([0.75 * p0[0] + 0.25 * p1[0], 0.75 * p0[1] + 0.25 * p1[1]]);
      next.push([0.25 * p0[0] + 0.75 * p1[0], 0.25 * p0[1] + 0.75 * p1[1]]);
    }
    pts = next;
  }
  if (pts.length > 0) {
    pts.push([pts[0][0], pts[0][1]]);
  }
  return pts;
}

function smoothGeometry(
  g: GeoJSON.Polygon | GeoJSON.MultiPolygon
): GeoJSON.Polygon | GeoJSON.MultiPolygon {
  if (g.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: g.coordinates.map((ring) => smoothRing(ring, 2)),
    };
  }
  return {
    type: "MultiPolygon",
    coordinates: g.coordinates.map((poly) =>
      poly.map((ring) => smoothRing(ring, 2))
    ),
  };
}

export function boundariesToFeatureCollection(
  boundaries: HistoricalBoundary[], data: AtlasData,
): GeoJSON.FeatureCollection {
  const accentByPolityId = new Map(data.polities.map(p => [p.id, p.accentColor]));
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
        outlineColor: darkenHex(accentByPolityId.get(b.polityId) ?? "#96341a", 0.32),
      },
      geometry: smoothGeometry(b.geometry),
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

export function frontiersToFeatureCollection(boundaries: HistoricalBoundary[], data: AtlasData): GeoJSON.FeatureCollection {
  const geoms = data.frontiers;
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
export function kingdomLabelsToFeatureCollection(boundaries: HistoricalBoundary[], data: AtlasData): GeoJSON.FeatureCollection {
  const points = data.labels;
  const nameByPolityId = new Map(data.polities.map(p => [p.id, p.name]));
  const accentByPolityId = new Map(data.polities.map(p => [p.id, p.accentColor]));
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
      .filter((e) => e.category === "battle" && e.location && e.period.startQualifier !== "unknown")
      .map((e) => ({
        type: "Feature",
        id: e.id,
        properties: { eventId: e.id, slug: e.slug, name: e.title, year: e.period.startYear },
        geometry: { type: "Point", coordinates: e.location as [number, number] },
      })),
  };
}

export function routesToFeatureCollection(routes: HistoricalRoute[], data: AtlasData): GeoJSON.FeatureCollection {
  const accentByPolityId = new Map(data.polities.map(p => [p.id, p.accentColor]));
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
