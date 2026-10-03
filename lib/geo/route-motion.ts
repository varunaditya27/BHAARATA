import type { HistoricalRoute } from "@/lib/domain/types";

type LngLat = [number, number];

/** Length of a segment in a locally-flat projection (cos-latitude scaled degrees). */
function segLength([x1, y1]: LngLat, [x2, y2]: LngLat) {
  const k = Math.cos((((y1 + y2) / 2) * Math.PI) / 180);
  return Math.hypot((x2 - x1) * k, y2 - y1);
}

/** Compass bearing (0 = north, clockwise) from a to b. */
function bearing([x1, y1]: LngLat, [x2, y2]: LngLat) {
  const k = Math.cos((((y1 + y2) / 2) * Math.PI) / 180);
  return (Math.atan2((x2 - x1) * k, y2 - y1) * 180) / Math.PI;
}

/**
 * The point a fraction `t` (0–1) of the way along a route, by distance,
 * with the heading of the segment it's on — where a ship or caravan
 * travelling the route would be, and which way it would face.
 */
export function pointAlongRoute(route: HistoricalRoute, t: number): { at: LngLat; bearing: number } {
  const coords = route.path.coordinates as LngLat[];
  const lengths = coords.slice(1).map((c, i) => segLength(coords[i], c));
  const total = lengths.reduce((a, b) => a + b, 0);
  let remaining = Math.min(1, Math.max(0, t)) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] || i === lengths.length - 1) {
      const f = lengths[i] === 0 ? 0 : Math.min(1, remaining / lengths[i]);
      const [a, b] = [coords[i], coords[i + 1]];
      return { at: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], bearing: bearing(a, b) };
    }
    remaining -= lengths[i];
  }
  return { at: coords[0], bearing: 0 };
}
