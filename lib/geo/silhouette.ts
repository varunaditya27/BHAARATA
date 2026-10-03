import { boundaries } from "@/lib/data/prototype";

type Geometry = GeoJSON.Polygon | GeoJSON.MultiPolygon;

/**
 * Projects a boundary to an SVG path fitted into a `size`×`size` box:
 * equirectangular with a cos(mean latitude) correction (good enough at
 * subcontinental scale, and it keeps the shapes recognisably themselves),
 * y flipped, aspect preserved, centred. Pure — runs on the server.
 */
export function silhouettePath(geometry: Geometry, size = 100, padding = 4): string {
  const polys = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const outerRings = polys.map((p) => p[0]);
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

/** A kingdom's emblem shape: its earliest recorded boundary. */
export function polityGeometry(polityId: string): Geometry | undefined {
  return boundaries.find((b) => b.polityId === polityId)?.geometry;
}
