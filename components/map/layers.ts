import type { Map as MapLibreMap } from "maplibre-gl";
import { boundaries, places, routes } from "@/lib/data/prototype";
import {
  boundariesToFeatureCollection,
  frontiersToFeatureCollection,
  placesToFeatureCollection,
  routesToFeatureCollection,
} from "@/lib/geo/to-geojson";
import { PLACE_ICON_EXPRESSION, registerHatchPattern, registerMapIcons } from "./mapIcons";
import { LAYER_IDS, SOURCE_IDS } from "./mapStyle";

/** Classic "marching ants" dash-phase sequence (Mapbox/MapLibre pattern):
 * cycling through these line-dasharray values reads as the dash pattern
 * travelling along the line. */
export const DASH_SEQUENCE: number[][] = [
  [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5],
  [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0],
  [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5],
  [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5],
];

/**
 * Every historical source and layer, added once on map load. Shared by
 * the atlas map, the comparison map, and the homepage story map so they
 * can't drift apart visually. All boundaries are loaded up front; which
 * ones show is driven purely by feature-state (see apply-state.ts), which
 * is what makes territory fade instead of pop.
 */
export function addHistoricalLayers(map: MapLibreMap, options: { interactive?: boolean } = {}) {
  registerMapIcons(map);
  registerHatchPattern(map);

  map.addSource(SOURCE_IDS.territory, {
    type: "geojson",
    data: boundariesToFeatureCollection(boundaries),
    promoteId: "boundaryId",
  });
  map.addSource(SOURCE_IDS.frontier, {
    type: "geojson",
    data: frontiersToFeatureCollection(boundaries),
    promoteId: "boundaryId",
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
    id: LAYER_IDS.frontierHatch,
    type: "fill",
    source: SOURCE_IDS.frontier,
    paint: {
      "fill-pattern": "bh-hatch",
      "fill-opacity": ["coalesce", ["feature-state", "hatchOpacity"], 0],
      "fill-opacity-transition": { duration: 500, delay: 0 },
    },
  });
  map.addLayer({
    id: LAYER_IDS.territoryOutline,
    type: "line",
    source: SOURCE_IDS.territory,
    layout: { "line-join": "round" },
    paint: {
      "line-color": ["get", "outlineColor"],
      "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 3.5, 2],
      "line-opacity": ["coalesce", ["feature-state", "lineOpacity"], 0],
      "line-opacity-transition": { duration: 500, delay: 0 },
    },
  });

  map.addLayer({
    id: LAYER_IDS.routeLines,
    type: "line",
    source: SOURCE_IDS.routes,
    filter: ["in", ["get", "routeId"], ["literal", []]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": ["get", "accentColor"], "line-width": 1.25, "line-opacity": 0.5 },
  });
  map.addLayer({
    id: LAYER_IDS.routeLinesDash,
    type: "line",
    source: SOURCE_IDS.routes,
    filter: ["in", ["get", "routeId"], ["literal", []]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": ["get", "accentColor"], "line-width": 2, "line-dasharray": DASH_SEQUENCE[0] },
  });

  map.addLayer({
    id: LAYER_IDS.capitalPulseOuter,
    type: "circle",
    source: SOURCE_IDS.places,
    filter: ["in", ["get", "placeId"], ["literal", []]],
    paint: { "circle-radius": 8, "circle-color": "#241f17", "circle-opacity": 0.15, "circle-stroke-width": 0 },
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
    paint: { "text-color": "#241f17", "text-halo-color": "#f3ede0", "text-halo-width": 1.2 },
  });

  if (options.interactive === false) {
    // Story/preview maps: territory only, no settlement clutter.
    for (const id of [LAYER_IDS.placeIcons, LAYER_IDS.placeLabels, LAYER_IDS.placePoints]) {
      map.setLayoutProperty(id, "visibility", "none");
    }
  }
}
