import { ViewTransition } from "react";

/**
 * Marks one element as "the same object" across routes, so a photo on a
 * list morphs into the hero on the detail page. `default="none"` keeps it
 * from crossfading on every unrelated transition; `share="morph"` is
 * required alongside it or the pair silently stops morphing (per the
 * Next.js view-transitions guide).
 */
export function Shared({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <ViewTransition name={name} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}
