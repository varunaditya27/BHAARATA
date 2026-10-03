import type { Map as MapLibreMap } from "maplibre-gl";

/**
 * Small ink-coloured glyphs drawn on a canvas at runtime and registered
 * as MapLibre images — not a generic icon-font pin set. Each glyph is
 * purpose-built for one placeType and only appears once you zoom close
 * enough to read it (see place-icons layer's minzoom), matching
 * IMPLEMENTATION_PLAN.md §6's "the map gets more knowledgeable as you
 * approach" rule.
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

export const PLACE_ICON_EXPRESSION = [
  "match",
  ["get", "placeType"],
  "capital",
  "bh-icon-capital",
  "port",
  "bh-icon-port",
  "bh-icon-settlement",
] as unknown as string;
