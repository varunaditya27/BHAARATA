/** Darkens a `#rrggbb` hex color by `amount` (0-1) — used for territory
 * outlines, which read as a deeper shade of the fill rather than a flat
 * black border (textbook-atlas convention). */
export function darkenHex(hex: string, amount: number): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const dr = clamp(r * (1 - amount));
  const dg = clamp(g * (1 - amount));
  const db = clamp(b * (1 - amount));
  return `#${dr.toString(16).padStart(2, "0")}${dg.toString(16).padStart(2, "0")}${db.toString(16).padStart(2, "0")}`;
}
