import { boundaries, getBoundariesForPolity } from "@/lib/data/prototype";

type Geometry = GeoJSON.Polygon | GeoJSON.MultiPolygon;

/**
 * Projects a boundary to an SVG path fitted into a `size`×`size` box:
 * equirectangular with a cos(mean latitude) correction (good enough at
 * subcontinental scale, and it keeps the shapes recognisably themselves),
 * y flipped, aspect preserved, centred. Pure — runs on the server.
 */
export function silhouettePath(geometry: Geometry, size = 100, padding = 4): string {
  const polys = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const rings = polys.map((p) => p[0]);
  // Specks (small islands) would stretch the box and shrink the main shape to a sliver.
  const largest = Math.max(...rings.map(ringArea));
  const outerRings = rings.filter((ring) => ringArea(ring) >= largest * 0.05);
  const all = outerRings.flat();
  const meanLat = all.reduce((s, [, lat]) => s + lat, 0) / all.length;
  const k = Math.cos((meanLat * Math.PI) / 180);

  const projected = outerRings.map((ring) => ring.map(([lng, lat]) => [lng * k, -lat] as const));
  const xs = projected.flat().map(([x]) => x);
  const ys = projected.flat().map(([, y]) => y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = (size - padding * 2) / Math.max(maxX - minX, maxY - minY);
  const offX = (size - (maxX - minX) * scale) / 2;
  const offY = (size - (maxY - minY) * scale) / 2;

  return projected
    .map(
      (ring) =>
        "M" +
        ring.map(([x, y]) => `${((x - minX) * scale + offX).toFixed(1)},${((y - minY) * scale + offY).toFixed(1)}`).join("L") +
        "Z",
    )
    .join("");
}

/** Shoelace area of a ring, longitude scaled by cos(latitude). */
function ringArea(ring: GeoJSON.Position[]): number {
  let twice = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = [ring[i][0] * Math.cos((ring[i][1] * Math.PI) / 180), ring[i][1]];
    const [xj, yj] = [ring[j][0] * Math.cos((ring[j][1] * Math.PI) / 180), ring[j][1]];
    twice += xj * yi - xi * yj;
  }
  return Math.abs(twice) / 2;
}

/** Area of the outer rings, the parts silhouettePath draws. */
function outlineArea(geometry: Geometry): number {
  const polys = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polys.reduce((sum, [ring]) => sum + ringArea(ring), 0);
}

function largestBoundary(polityId: string): { geometry: Geometry; area: number } | undefined {
  let best: { geometry: Geometry; area: number } | undefined;
  for (const { geometry } of getBoundariesForPolity(polityId)) {
    const area = outlineArea(geometry);
    if (!best || area > best.area) best = { geometry, area };
  }
  return best;
}

/** A kingdom's emblem shape: its largest recorded boundary, the extent it is best known by. */
export function polityGeometry(polityId: string): Geometry | undefined {
  return largestBoundary(polityId)?.geometry;
}

/** The most land a kingdom held at one time, in the same relative units as outlineArea. For comparing kingdoms, not a real km² figure. */
export function polityPeakArea(polityId: string): number {
  return largestBoundary(polityId)?.area ?? 0;
}

function pointInRing([x, y]: [number, number], ring: GeoJSON.Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Ray-casting point-in-polygon, holes respected. */
export function pointInGeometry(point: [number, number], geometry: Geometry): boolean {
  const polys = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polys.some(
    (rings) => pointInRing(point, rings[0]) && !rings.slice(1).some((hole) => pointInRing(point, hole)),
  );
}

/** Every recorded boundary that contains a point — i.e. which kingdoms
 * held a place, and when (per the illustrative boundaries). */
export function boundariesContaining(point: [number, number]) {
  return boundaries.filter((b) => pointInGeometry(point, b.geometry)).sort((a, b) => a.validFrom - b.validFrom);
}

/**
 * Several geometries + points projected into a shared box (same
 * projection as silhouettePath) — for a place's "held by" mini map and
 * the places index map.
 */
export function projectTogether(geometries: Geometry[], points: [number, number][], size = 100, padding = 6) {
  const rings = geometries.flatMap((g) => (g.type === "Polygon" ? [g.coordinates[0]] : g.coordinates.map((p) => p[0])));
  const all = [...rings.flat(), ...points];
  const meanLat = all.reduce((s, p) => s + p[1], 0) / all.length;
  const k = Math.cos((meanLat * Math.PI) / 180);
  const xs = all.map((p) => p[0] * k);
  const ys = all.map((p) => -p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = (size - padding * 2) / Math.max(maxX - minX, maxY - minY);
  const offX = (size - (maxX - minX) * scale) / 2;
  const offY = (size - (maxY - minY) * scale) / 2;
  const tx = (lng: number) => (lng * k - minX) * scale + offX;
  const ty = (lat: number) => (-lat - minY) * scale + offY;
  const pathOf = (g: Geometry) =>
    (g.type === "Polygon" ? [g.coordinates[0]] : g.coordinates.map((p) => p[0]))
      .map((ring) => "M" + ring.map(([lng, lat]) => `${tx(lng).toFixed(1)},${ty(lat).toFixed(1)}`).join("L") + "Z")
      .join("");
  return { paths: geometries.map(pathOf), points: points.map(([lng, lat]) => [tx(lng), ty(lat)] as const) };
}
