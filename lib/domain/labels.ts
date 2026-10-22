const PLACE_KIND: Record<string, string> = { capital: "Capital", settlement: "Town", port: "Port", monument: "Monument" };

/** A place's type in everyday words ("settlement" reads as "Town"). */
export function placeKindLabel(placeType: string): string {
  return PLACE_KIND[placeType] ?? placeType.charAt(0).toUpperCase() + placeType.slice(1);
}
