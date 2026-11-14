import type { ExpressionSpecification, Map as MapLibreMap } from "maplibre-gl";
import type { AtlasData } from "@/lib/data/atlas-data";
import { getHistoricalState, getRoutesAtYear } from "@/lib/geo/historical-state";
import { boundaryId } from "@/lib/geo/to-geojson";
import { LAYER_IDS, SOURCE_IDS } from "./mapStyle";

export const TERRITORY_OPACITY = {
  inactive: 0,
  active: 0.36,
  muted: 0.19,
  selected: 0.58,
} as const;

/** How long a lost territory's outline lingers as a dashed "echo". */
export const ECHO_YEARS = 60;

/** Soft cross-dissolve ramp (in years) at boundary transitions so shapes morph instead of popping. */
const BLEND_YEARS = 14;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / Math.max(0.0001, edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * The one place that turns "year Y, kingdom K selected" into map state.
 * Feature-state writes are idempotent and the paint transitions (in
 * layers.ts) do the fading, so calling this every frame of a scrub is
 * cheap and always correct.
 */
const lastWritten = new WeakMap<MapLibreMap, Map<string, string>>();

/** The year most recently applied to a map, so layers added later (lazily) can start in step. */
const appliedYear = new WeakMap<MapLibreMap, number>();
export const currentYear = (map: MapLibreMap, fallback = 1050) => appliedYear.get(map) ?? fallback;

export function applyHistoricalState(map: MapLibreMap, year: number, selectedPolityId: string | null, data: AtlasData) {
  const { boundaries, places } = data;
  appliedYear.set(map, year);
  let written = lastWritten.get(map);
  if (!written) lastWritten.set(map, (written = new Map()));
  const state = getHistoricalState(year, data);
  const activeBoundaryIds = new Set(state.activeBoundaries.map(boundaryId));
  const activeCapitalNames = new Set(state.activePolities.flatMap((p) => p.capitals));
  const polityHasActiveShape = new Set(state.activeBoundaries.map((b) => b.polityId));
  const hasSelection = selectedPolityId !== null;

  for (const b of boundaries) {
    const id = boundaryId(b);
    const strictlyActive = activeBoundaryIds.has(id);
    const selected = strictlyActive && b.polityId === selectedPolityId;

    // Compute smooth temporal presence across [validFrom - BLEND_YEARS, validTo + BLEND_YEARS]
    let presence = 0;
    if (strictlyActive) {
      const fadeIn = smoothstep(b.validFrom - BLEND_YEARS, b.validFrom + 4, year);
      const fadeOut = 1 - smoothstep(b.validTo - 4, b.validTo + BLEND_YEARS, year);
      presence = Math.min(fadeIn, fadeOut);
    } else if (year >= b.validFrom - BLEND_YEARS && year < b.validFrom) {
      presence = smoothstep(b.validFrom - BLEND_YEARS, b.validFrom + 4, year) * 0.65;
    } else if (year > b.validTo && year <= b.validTo + BLEND_YEARS) {
      presence = (1 - smoothstep(b.validTo - 4, b.validTo + BLEND_YEARS, year)) * 0.65;
    }

    const baseFill = selected
      ? TERRITORY_OPACITY.selected
      : hasSelection
        ? TERRITORY_OPACITY.muted
        : TERRITORY_OPACITY.active;
    const baseLine = selected ? 0.96 : hasSelection ? 0.42 : 0.78;
    const baseGlow = selected ? 0.68 : hasSelection ? 0.12 : 0.28;
    const baseInnerBleed = selected ? 0.52 : hasSelection ? 0.16 : 0.34;

    const opacity = Number((baseFill * presence).toFixed(2));
    const lineOpacity = Number((baseLine * presence).toFixed(2));
    const glowOpacity = Number((baseGlow * presence).toFixed(2));
    const innerBleedOpacity = Number((baseInnerBleed * presence).toFixed(2));

    // Echo: a territory that ended within ECHO_YEARS keeps a dashed ghost
    // of its old outline, fading with time — unless the same kingdom
    // already shows a newer shape.
    const since = year - b.validTo;
    const echo =
      !strictlyActive && since > BLEND_YEARS && since <= ECHO_YEARS && !polityHasActiveShape.has(b.polityId)
        ? 0.55 * (1 - since / ECHO_YEARS)
        : 0;
    const hatch = strictlyActive ? (selected ? 0.75 : 0.45) : 0;
    const label = strictlyActive ? (selected ? 0.98 : hasSelection ? 0.55 : 0.9) : 0;
    const signature = `${strictlyActive}|${opacity}|${lineOpacity}|${selected}|${echo.toFixed(2)}|${label}`;
    if (written.get(id) === signature) continue;
    written.set(id, signature);
    map.setFeatureState(
      { source: SOURCE_IDS.territory, id },
      {
        active: strictlyActive,
        opacity,
        lineOpacity,
        glowOpacity,
        innerBleedOpacity,
        selected,
        echoOpacity: echo,
      },
    );
    if (id in data.frontiers) map.setFeatureState({ source: SOURCE_IDS.frontier, id }, { hatchOpacity: hatch });
    map.setFeatureState({ source: SOURCE_IDS.kingdomLabels, id }, { labelOpacity: label });
  }

  const capitalIds = places
    // By name prefix, as elsewhere: "Gulbarga" is the place "Gulbarga (Kalaburagi)".
    .filter((p) => p.placeType === "capital" && [...activeCapitalNames].some((c) => p.name.startsWith(c)))
    .map((p) => p.id);
  // A battle shows from its own year for ten years, so scrubbing past it leaves it briefly on the map.
  const battleWindow: ExpressionSpecification = [
    "all",
    ["<=", ["get", "year"], year],
    [">", ["get", "year"], year - 10],
  ];
  // Sites (temples, mosques, forts…) appear in the year they were built and stay.
  for (const id of [LAYER_IDS.sitePoints, LAYER_IDS.siteLabels]) {
    if (map.getLayer(id)) map.setFilter(id, ["<=", ["get", "y"], year]);
  }
  map.setFilter(LAYER_IDS.battleRings, battleWindow);
  map.setFilter(LAYER_IDS.battleLabels, battleWindow);

  map.setFilter(LAYER_IDS.capitalPulseOuter, ["in", ["get", "placeId"], ["literal", capitalIds]]);
  map.setFilter(LAYER_IDS.capitalSeals, ["in", ["get", "polityId"], ["literal", state.activePolities.map((p) => p.id)]]);

  const routeIds = getRoutesAtYear(year, data).map((r) => r.id);
  for (const layerId of [LAYER_IDS.routeLines, LAYER_IDS.routeLinesDash, LAYER_IDS.routeArrows, LAYER_IDS.routeMovers]) {
    map.setFilter(layerId, ["in", ["get", "routeId"], ["literal", routeIds]]);
  }
}

/** The boundary to frame for a kingdom in a given year — its shape for
 * that year if it has one, otherwise its first recorded shape. */
export function boundaryForPolity(polityId: string, year: number, data: AtlasData) {
  const own = data.boundaries.filter((b) => b.polityId === polityId);
  return own.find((b) => year >= b.validFrom && year <= b.validTo) ?? own[0];
}

/**
 * Which kingdom a click/hover at this point means: only territory that's
 * actually visible this year (every polygon is always loaded, invisibly),
 * and the smallest one when several overlap — Hoysala sitting inside the
 * Chalukya extent should win, not lose to it.
 */
/** The visible territory under a point — the smallest, where they overlap. */
export function territoryAtPoint(
  map: MapLibreMap,
  point: { x: number; y: number },
): { polityId: string; featureId: string } | null {
  const hits = map
    .queryRenderedFeatures([point.x, point.y], { layers: [LAYER_IDS.territoryFill] })
    .filter((f) => map.getFeatureState({ source: SOURCE_IDS.territory, id: f.id as string }).active);
  if (hits.length === 0) return null;
  hits.sort((a, b) => (a.properties.area as number) - (b.properties.area as number));
  return { polityId: hits[0].properties.polityId as string, featureId: hits[0].id as string };
}

export function polityAtPoint(map: MapLibreMap, point: { x: number; y: number }): string | null {
  return territoryAtPoint(map, point)?.polityId ?? null;
}
