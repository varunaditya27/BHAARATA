import type { Map as MapLibreMap } from "maplibre-gl";
import { DASH_SEQUENCE } from "./layers";
import { LAYER_IDS } from "./mapStyle";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The map's ambient motion — marching-ants routes and the pulse on active
 * capitals — on one shared clock. Skipped entirely under reduced motion
 * (not frozen mid-frame). Returns a stop function for unmount.
 */
export function startMapAnimations(map: MapLibreMap): () => void {
  if (prefersReducedMotion()) return () => {};

  let raf = 0;
  let dashIndex = 0;
  let lastDash = 0;
  const startedAt = performance.now();

  const tick = (now: number) => {
    if (now - lastDash > 60) {
      lastDash = now;
      dashIndex = (dashIndex + 1) % DASH_SEQUENCE.length;
      if (map.getLayer(LAYER_IDS.routeLinesDash)) {
        map.setPaintProperty(LAYER_IDS.routeLinesDash, "line-dasharray", DASH_SEQUENCE[dashIndex]);
      }
    }
    const phase = (Math.sin(((now - startedAt) / 1000) * 2.2) + 1) / 2;
    if (map.getLayer(LAYER_IDS.capitalPulseOuter)) {
      map.setPaintProperty(LAYER_IDS.capitalPulseOuter, "circle-radius", 7 + phase * 9);
      map.setPaintProperty(LAYER_IDS.capitalPulseOuter, "circle-opacity", 0.22 - phase * 0.18);
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
