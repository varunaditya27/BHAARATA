import { routes } from "@/lib/data/prototype";
import { pointAlongRoute } from "@/lib/geo/route-motion";
import { routesToFeatureCollection } from "@/lib/geo/to-geojson";

/** Seconds for one full journey along a route. */
const VOYAGE_SECONDS = 11;
const routeColors = new Map(
  routesToFeatureCollection(routes).features.map((f) => [f.properties!.routeId as string, f.properties!.glyphColor as string]),
);

/** Where each route's ship/traveller is at `seconds` on the shared clock:
 * staggered per route, fading in at the start and out at the end. */
export function routeMoversFeatureCollection(seconds: number): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: routes.map((route, i) => {
      const t = ((seconds / VOYAGE_SECONDS + i * 0.37) % 1 + 1) % 1;
      const { at, bearing } = pointAlongRoute(route, t);
      return {
        type: "Feature",
        properties: {
          routeId: route.id,
          routeType: route.routeType,
          accentColor: routeColors.get(route.id) ?? "#5c5447",
          bearing,
          fade: Math.min(1, t / 0.1, (1 - t) / 0.1),
        },
        geometry: { type: "Point", coordinates: at },
      };
    }),
  };
}
