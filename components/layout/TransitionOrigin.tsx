"use client";

import { useEffect } from "react";

/** Remembers where a link was pressed, so the page transition can open from that point. */
export function TransitionOrigin() {
  useEffect(() => {
    const remember = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest("a")) return;
      const root = document.documentElement.style;
      root.setProperty("--bh-x", `${e.clientX}px`);
      root.setProperty("--bh-y", `${e.clientY}px`);
    };
    document.addEventListener("pointerdown", remember, true);
    return () => document.removeEventListener("pointerdown", remember, true);
  }, []);
  return null;
}
