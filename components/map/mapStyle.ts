/**
 * Our own hand-authored MapLibre style (public/map-styles/bhaarata-atlas.json),
 * generated from CARTO's open "positron" vector tile source
 * (basemaps.cartocdn.com — streets/places/water, free with attribution)
 * but reduced to a curated 16-layer subset with every paint property
 * recoloured to our palette. Modern roads, rail, and buildings are
 * dropped entirely — an antique-style map doesn't show a motorway, and
 * removing them is also what makes the result read as "printed" instead
 * of "Google Maps with a filter."
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

export const SOURCE_IDS = {
  territory: "bh-territory",
  frontier: "bh-frontier",
  places: "bh-places",
  routes: "bh-routes",
} as const;

export const LAYER_IDS = {
  territoryFill: "bh-territory-fill",
  territoryOutline: "bh-territory-outline",
  frontierHatch: "bh-frontier-hatch",
  placePoints: "bh-place-points",
  placeLabels: "bh-place-labels",
  placeIcons: "bh-place-icons",
  capitalPulseOuter: "bh-capital-pulse-outer",
  capitalPulseInner: "bh-capital-pulse-inner",
  routeLines: "bh-route-lines",
  routeLinesDash: "bh-route-lines-dash",
} as const;
