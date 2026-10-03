"use client";

import { useCallback, useSyncExternalStore } from "react";

const EVENT = "bh-stored-flag";

function read(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

/**
 * A boolean remembered in this browser (off when storage is unavailable).
 * Server render and hydration both see `false`, so there's no mismatch;
 * the stored value takes over right after.
 */
export function useStoredFlag(key: string): [boolean, (next: boolean) => void] {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("storage", onChange);
    window.addEventListener(EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(EVENT, onChange);
    };
  }, []);
  const value = useSyncExternalStore(subscribe, () => read(key), () => false);
  const set = useCallback(
    (next: boolean) => {
      try {
        localStorage.setItem(key, next ? "1" : "0");
      } catch {
        // Remembering is a convenience; it's fine if it can't happen.
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [key],
  );
  return [value, set];
}
