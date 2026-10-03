/**
 * Shared names for React <ViewTransition> pairs. An element rendered with
 * the same name on two routes is treated by the browser as one object
 * moving, not two swapping — see node_modules/next/dist/docs/01-app/
 * 02-guides/view-transitions.md. Keep every naming convention here so the
 * list, preview, and detail views can't drift apart.
 */
export const transitionNames = {
  polityPhoto: (slug: string) => `polity-photo-${slug}`,
  polityTitle: (slug: string) => `polity-title-${slug}`,
  personPortrait: (slug: string) => `person-portrait-${slug}`,
  placePhoto: (slug: string) => `place-photo-${slug}`,
  evidencePhoto: (slug: string) => `evidence-photo-${slug}`,
} as const;

/** Link `transitionTypes` — forward = deeper into the record graph
 * (list → detail, map → record), back = toward an index or the atlas. */
export const NAV_FORWARD = ["nav-forward"];
export const NAV_BACK = ["nav-back"];
