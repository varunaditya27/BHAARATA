import type { Map as MapLibreMap } from "maplibre-gl";
import type { Polity } from "@/lib/domain/types";

/** The map as it is drawn right now. WebGL clears its buffer after each
 * frame, so the copy has to happen inside the next "render" event. */
export function captureMapCanvas(map: MapLibreMap): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    map.once("render", () => {
      const src = map.getCanvas();
      const out = document.createElement("canvas");
      out.width = src.width;
      out.height = src.height;
      out.getContext("2d")?.drawImage(src, 0, 0);
      resolve(out);
    });
    map.triggerRepaint();
  });
}

const PAPER = "#f3ede0";
const INK = "#241f17";
const MUTED = "#5c5447";

function cssFont(variable: string, fallback: string) {
  const family = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return family || fallback;
}

/**
 * Adds a printed cartouche to a captured map — title, year and era, the
 * kingdoms on the map with their colours, the placeholder-data warning,
 * and the map credits (which must travel with the image).
 */
export function composeMapPrint(
  mapCanvas: HTMLCanvasElement,
  opts: { year: string; era: string; kingdoms: Polity[]; credits: string },
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = mapCanvas.width;
  canvas.height = mapCanvas.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(mapCanvas, 0, 0);

  const s = canvas.width / 1400; // scale everything to the output width
  const display = cssFont("--font-zodiak", "Georgia, serif");
  const sans = cssFont("--font-ranade", "system-ui, sans-serif");
  const pad = 22 * s;
  const rowH = 22 * s;
  const boxW = 340 * s;
  const boxH = pad * 2 + 30 * s + 50 * s + opts.kingdoms.length * rowH + 40 * s;
  const x = 28 * s;
  const y = canvas.height - boxH - 28 * s;

  ctx.fillStyle = PAPER;
  ctx.globalAlpha = 0.94;
  ctx.fillRect(x, y, boxW, boxH);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1 * s;
  ctx.strokeRect(x + 5 * s, y + 5 * s, boxW - 10 * s, boxH - 10 * s);

  let cy = y + pad + 14 * s;
  ctx.fillStyle = MUTED;
  ctx.font = `500 ${11 * s}px ${sans}`;
  ctx.fillText("BHĀRATA · HISTORICAL ATLAS", x + pad, cy);
  cy += 40 * s;
  ctx.fillStyle = INK;
  ctx.font = `400 ${36 * s}px ${display}`;
  ctx.fillText(opts.year, x + pad, cy);
  cy += 22 * s;
  ctx.fillStyle = MUTED;
  ctx.font = `400 ${13 * s}px ${sans}`;
  ctx.fillText(opts.era, x + pad, cy);
  cy += 24 * s;

  for (const k of opts.kingdoms) {
    ctx.fillStyle = k.accentColor;
    ctx.fillRect(x + pad, cy - 10 * s, 12 * s, 12 * s);
    ctx.fillStyle = INK;
    ctx.font = `400 ${14 * s}px ${sans}`;
    ctx.fillText(k.name, x + pad + 20 * s, cy);
    cy += rowH;
  }

  cy += 8 * s;
  ctx.fillStyle = MUTED;
  ctx.font = `italic 400 ${11 * s}px ${sans}`;
  ctx.fillText("Placeholder data, not yet checked — please don't quote it as fact.", x + pad, cy);

  ctx.font = `400 ${10 * s}px ${sans}`;
  const w = ctx.measureText(opts.credits).width;
  ctx.fillStyle = PAPER;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(canvas.width - w - 26 * s, canvas.height - 24 * s, w + 16 * s, 18 * s);
  ctx.globalAlpha = 1;
  ctx.fillStyle = INK;
  ctx.fillText(opts.credits, canvas.width - w - 18 * s, canvas.height - 11 * s);
  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}
