import type { Map as MapLibreMap } from "maplibre-gl";
import { boundaries, places, routes } from "@/lib/data/prototype";
import {
  boundariesToFeatureCollection,
  frontiersToFeatureCollection,
  kingdomLabelsToFeatureCollection,
  placesToFeatureCollection,
  routesToFeatureCollection,
} from "@/lib/geo/to-geojson";
import { PLACE_ICON_EXPRESSION, registerHatchPattern, registerMapIcons } from "./mapIcons";
import { LAYER_IDS, SOURCE_IDS, TERRAIN_SOURCE } from "./mapStyle";

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
export function addHistoricalLayers(
  map: MapLibreMap,
  options: { interactive?: boolean; terrain3d?: boolean } = {},
) {
  registerMapIcons(map);

  // Relief first, under the basemap's rivers and water so they stay crisp.
  // Toned to the palette — warm brown shadow, paper highlight — so the
  // Ghats and the Deccan scarp read as engraving, not satellite shading.
  map.addSource(SOURCE_IDS.dem, { ...TERRAIN_SOURCE, tiles: [...TERRAIN_SOURCE.tiles] });
  map.addLayer(
    {
      id: LAYER_IDS.hillshade,
      type: "hillshade",
      source: SOURCE_IDS.dem,
      paint: {
        "hillshade-exaggeration": 0.42,
        "hillshade-illumination-direction": 315,
        "hillshade-shadow-color": "rgba(82, 62, 40, 0.6)",
        "hillshade-highlight-color": "rgba(255, 251, 242, 0.45)",
        "hillshade-accent-color": "rgba(82, 62, 40, 0.3)",
      },
    },
    map.getLayer("waterway") ? "waterway" : undefined,
  );
  if (options.terrain3d) {
    // A separate source for the 3D mesh — sharing one with the hillshade
    // degrades both (MapLibre warns about it).
    map.addSource(SOURCE_IDS.demTerrain, { ...TERRAIN_SOURCE, tiles: [...TERRAIN_SOURCE.tiles] });
    map.setTerrain({ source: SOURCE_IDS.demTerrain, exaggeration: 1.6 });
  }
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
  map.addSource(SOURCE_IDS.kingdomLabels, {
    type: "geojson",
    data: kingdomLabelsToFeatureCollection(boundaries),
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
      // Hovering lifts the shade a touch, so the pointer reads as "this one".
      "fill-opacity": [
        "+",
        ["coalesce", ["feature-state", "opacity"], 0],
        ["case", ["boolean", ["feature-state", "hover"], false], 0.12, 0],
      ],
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
  // Dashed ghost of a recently lost territory (see ECHO_YEARS).
  map.addLayer({
    id: LAYER_IDS.territoryEcho,
    type: "line",
    source: SOURCE_IDS.territory,
    layout: { "line-join": "round" },
    paint: {
      "line-color": ["get", "outlineColor"],
      "line-width": 1.4,
      "line-dasharray": [2, 2],
      "line-opacity": ["coalesce", ["feature-state", "echoOpacity"], 0],
      "line-opacity-transition": { duration: 500, delay: 0 },
    },
  });
  // A soft halo under the outline, shown only on hover.
  map.addLayer({
    id: LAYER_IDS.territoryGlow,
    type: "line",
    source: SOURCE_IDS.territory,
    layout: { "line-join": "round" },
    paint: {
      "line-color": ["get", "accentColor"],
      "line-width": 12,
      "line-blur": 10,
      "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.7, 0],
      "line-opacity-transition": { duration: 250, delay: 0 },
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
      "text-variable-anchor": ["top", "bottom", "right", "left"],
      "text-radial-offset": 0.9,
      "text-justify": "auto",
      "text-font": ["Ranade Medium"],
    },
    paint: { "text-color": "#241f17", "text-halo-color": "#f3ede0", "text-halo-width": 1.2 },
  });

  // Kingdom names set like a printed atlas: spaced capitals that widen as
  // you zoom in. Topmost so they're placed first and reserve their space;
  // settlement labels (variable anchors, above) then step around them
  // instead of overprinting.
  map.addLayer({
    id: LAYER_IDS.kingdomLabels,
    type: "symbol",
    source: SOURCE_IDS.kingdomLabels,
    layout: {
      "text-field": ["get", "label"],
      "text-font": ["Zodiak Bold"],
      "text-transform": "uppercase",
      "text-size": ["interpolate", ["linear"], ["zoom"], 3.5, 11, 5, 15, 7, 24],
      "text-letter-spacing": ["interpolate", ["linear"], ["zoom"], 3.5, 0.18, 5, 0.32, 7, 0.55],
      "text-max-width": 30,
      "text-allow-overlap": true,
      "text-ignore-placement": false,
    },
    paint: {
      "text-color": ["get", "labelColor"],
      "text-halo-color": "rgba(243, 237, 224, 0.55)",
      "text-halo-width": 1.4,
      "text-halo-blur": 0.6,
      "text-opacity": ["coalesce", ["feature-state", "labelOpacity"], 0],
      "text-opacity-transition": { duration: 500, delay: 0 },
    },
  });

  if (options.interactive === false) {
    // Story/preview maps: territory only, no settlement clutter.
    for (const id of [LAYER_IDS.placeIcons, LAYER_IDS.placeLabels, LAYER_IDS.placePoints]) {
      map.setLayoutProperty(id, "visibility", "none");
    }
  }
}
