import type { Map as MapLibreMap } from "maplibre-gl";
import { polities } from "@/lib/data/prototype";
import { polityGeometry, silhouettePath } from "@/lib/geo/silhouette";
import { darkenHex } from "@/lib/utils/color";

/**
 * Small ink-coloured glyphs drawn on a canvas at runtime and registered
 * as MapLibre images — not a generic icon-font pin set. Each glyph is
 * purpose-built for one placeType and only appears once you zoom close
 * enough to read it (see place-icons layer's minzoom): the map should
 * get more detailed as you approach, not show everything at once.
 */
const SIZE = 28;
const INK = "#241f17";

function drawCapital(ctx: CanvasRenderingContext2D) {
  const c = SIZE / 2;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(c, c - 9);
  ctx.lineTo(c + 4, c - 2);
  ctx.lineTo(c + 9, c - 5);
  ctx.lineTo(c + 6, c + 4);
  ctx.lineTo(c - 6, c + 4);
  ctx.lineTo(c - 9, c - 5);
  ctx.lineTo(c - 4, c - 2);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(c - 7, c + 5);
  ctx.lineTo(c + 7, c + 5);
  ctx.stroke();
}

function drawPort(ctx: CanvasRenderingContext2D) {
  const c = SIZE / 2;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(c, c - 8);
  ctx.lineTo(c, c + 6);
  ctx.moveTo(c - 5, c - 5);
  ctx.lineTo(c + 5, c - 5);
  ctx.moveTo(c - 6, c + 2);
  ctx.quadraticCurveTo(c, c + 10, c + 6, c + 2);
  ctx.stroke();
}

function drawSettlement(ctx: CanvasRenderingContext2D) {
  const c = SIZE / 2;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(c - 6, c + 5);
  ctx.lineTo(c - 6, c - 1);
  ctx.lineTo(c, c - 7);
  ctx.lineTo(c + 6, c - 1);
  ctx.lineTo(c + 6, c + 5);
  ctx.closePath();
  ctx.stroke();
}

const DRAWERS: Record<string, (ctx: CanvasRenderingContext2D) => void> = {
  capital: drawCapital,
  port: drawPort,
  settlement: drawSettlement,
};

export function registerMapIcons(map: MapLibreMap) {
  for (const [name, draw] of Object.entries(DRAWERS)) {
    const id = `bh-icon-${name}`;
    if (map.hasImage(id)) continue;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    ctx.clearRect(0, 0, SIZE, SIZE);
    draw(ctx);
    const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
    map.addImage(id, { width: SIZE, height: SIZE, data: imageData.data }, { pixelRatio: 2 });
  }
}

/** Diagonal ink hatching for the frontier band. Drawn tileable: the line
 * runs corner to corner plus the two wrapped corner fragments. */
export function registerHatchPattern(map: MapLibreMap) {
  const id = "bh-hatch";
  if (map.hasImage(id)) return;
  const size = 10;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.strokeStyle = "rgba(36, 31, 23, 0.55)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.lineTo(size, 0);
  ctx.moveTo(-size / 2, size / 2);
  ctx.lineTo(size / 2, -size / 2);
  ctx.moveTo(size / 2, size * 1.5);
  ctx.lineTo(size * 1.5, size / 2);
  ctx.stroke();
  const data = ctx.getImageData(0, 0, size, size);
  map.addImage(id, { width: size, height: size, data: data.data }, { pixelRatio: 1 });
}

export const PLACE_ICON_EXPRESSION = [
  "match",
  ["get", "placeType"],
  "capital",
  "bh-icon-capital",
  "port",
  "bh-icon-port",
  "bh-icon-settlement",
] as unknown as string;

/** Draws a white glyph on a canvas and registers it as an SDF image, so a
 * layer can tint it per feature (each route in its kingdom's colour). */
function addSdfGlyph(map: MapLibreMap, id: string, size: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  if (map.hasImage(id)) return;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  draw(ctx);
  const imageData = ctx.getImageData(0, 0, size, size);
  map.addImage(id, { width: size, height: size, data: imageData.data }, { pixelRatio: 2, sdf: true });
}

/** Route glyphs, all pointing "up" (north) so icon-rotate = bearing works:
 * a chevron for direction of travel, a hull seen from above for ships. */
export function registerRouteIcons(map: MapLibreMap) {
  addSdfGlyph(map, "bh-route-arrow", 24, (ctx) => {
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(6, 15);
    ctx.lineTo(12, 9);
    ctx.lineTo(18, 15);
    ctx.stroke();
  });
  addSdfGlyph(map, "bh-route-ship", 40, (ctx) => {
    ctx.beginPath();
    ctx.moveTo(20, 3);
    ctx.bezierCurveTo(28, 12, 28, 26, 26, 36);
    ctx.lineTo(14, 36);
    ctx.bezierCurveTo(12, 26, 12, 12, 20, 3);
    ctx.closePath();
    ctx.fill();
  });
  addSdfGlyph(map, "bh-route-traveller", 24, (ctx) => {
    ctx.beginPath();
    ctx.arc(12, 12, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** A seal for each kingdom, stamped at its capitals: a disc in its colour,
 * a paper ring, and its outline (the site-wide emblem) inside. */
export function registerSealImages(map: MapLibreMap) {
  const size = 56;
  for (const polity of polities) {
    const id = `bh-seal-${polity.id}`;
    const geometry = polityGeometry(polity.id);
    if (map.hasImage(id) || !geometry) continue;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    const c = size / 2;
    ctx.beginPath();
    ctx.arc(c, c, c - 2, 0, Math.PI * 2);
    ctx.fillStyle = polity.accentColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = darkenHex(polity.accentColor, 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(c, c, c - 6, 0, Math.PI * 2);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(243,237,224,0.85)";
    ctx.stroke();
    ctx.fillStyle = "#f3ede0";
    ctx.fill(new Path2D(silhouettePath(geometry, size, 14)));
    const imageData = ctx.getImageData(0, 0, size, size);
    map.addImage(id, { width: size, height: size, data: imageData.data }, { pixelRatio: 2 });
  }
}
