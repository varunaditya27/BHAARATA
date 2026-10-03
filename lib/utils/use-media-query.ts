"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe media query subscription. Server render and first client render
 * both assume `false` (desktop/full motion), then React re-renders with the
 * real value — no hydration mismatch, no setState-in-effect.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const MOBILE_QUERY = "(max-width: 767px)";
