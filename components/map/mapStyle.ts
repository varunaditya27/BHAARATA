/**
 * Our own hand-authored MapLibre style (public/map-styles/bhaarata-atlas.json),
 * generated from CARTO's open "positron" vector tile source
 * (basemaps.cartocdn.com — streets/places/water, free with attribution)
 * but reduced to a curated 16-layer subset with every paint property
 * recoloured to our palette. Modern roads, rail, and buildings are
 * dropped entirely — an antique-style map doesn't show a motorway, and
 * removing them is also what makes the result read as "printed" instead
 * of "Google Maps with a filter." Modern country borders and country
 * names are dropped for the same reason PROJECT_BIBLE.md §8 gives: an
 * 11th-century map labelled INDIA / PAKISTAN / BANGLADESH presents
 * historical space as modern nation-states.
 *
 * We reuse CARTO's vector tiles rather than hosting our own (that's the
 * Phase II+ step, once PMTiles built from PostGIS exist) — this is how
 * "custom cartography" is normally done in practice: a bespoke style.json
 * against an existing vector source, authored the way Maputnik would.
 *
 * To regenerate: see the derivation notes in this file's git history, or
 * re-derive from https://basemaps.cartocdn.com/gl/positron-gl-style/style.json.
 *
 * Map labels use glyphs generated from our own Ranade/Zodiak fonts
 * (public/map-glyphs/, built with `npx @kartore/glyphore build`), not
 * CARTO's glyph server — which doesn't send CORS headers for the faces
 * we want, so every label was silently falling back to a system font.
 */
export const BASEMAP_STYLE_URL = "/map-styles/bhaarata-atlas.json";

/**
 * Free, keyless elevation tiles (Terrarium-encoded) from the AWS Open Data
 * "Terrain Tiles" set. Chosen over Mapterhorn because it covers the oceans
 * too: Mapterhorn omits sea tiles, so every Arabian Sea / Bay of Bengal
 * tile in view 404'd and showed up as console errors.
 */
export const TERRAIN_SOURCE = {
  type: "raster-dem",
  tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
  encoding: "terrarium",
  tileSize: 256,
  maxzoom: 14,
  attribution:
    '<a href="https://registry.opendata.aws/terrain-tiles/">Terrain Tiles</a> (Mapzen, AWS Open Data)',
} as const;

export const SOURCE_IDS = {
  territory: "bh-territory",
  frontier: "bh-frontier",
  dem: "bh-dem",
  demTerrain: "bh-dem-terrain",
  kingdomLabels: "bh-kingdom-labels",
  places: "bh-places",
  routes: "bh-routes",
  routeMovers: "bh-route-movers",
  capitalSeals: "bh-capital-seals",
  battles: "bh-battles",
  monuments: "bh-monuments",
} as const;

export const LAYER_IDS = {
  territoryFill: "bh-territory-fill",
  territoryOutline: "bh-territory-outline",
  territoryGlow: "bh-territory-glow",
  territoryEcho: "bh-territory-echo",
  frontierHatch: "bh-frontier-hatch",
  hillshade: "bh-hillshade",
  kingdomLabels: "bh-kingdom-labels",
  placePoints: "bh-place-points",
  placeLabels: "bh-place-labels",
  placeIcons: "bh-place-icons",
  capitalPulseOuter: "bh-capital-pulse-outer",
  capitalPulseInner: "bh-capital-pulse-inner",
  routeLines: "bh-route-lines",
  routeLinesDash: "bh-route-lines-dash",
  routeArrows: "bh-route-arrows",
  routeMovers: "bh-route-movers",
  capitalSeals: "bh-capital-seals",
  riverFlow: "bh-river-flow",
  battleRings: "bh-battle-rings",
  battleLabels: "bh-battle-labels",
  monumentClusters: "bh-monument-clusters",
  monumentClusterCount: "bh-monument-cluster-count",
  monumentPoints: "bh-monument-points",
} as const;
