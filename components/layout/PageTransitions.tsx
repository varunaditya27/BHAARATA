"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

let release: (() => void) | null = null;

/**
 * Moves between pages with the browser's own view transitions. A link in the header, footer or search opens the
 * next page as a circle of its colour growing from the click; any other link slides forward. The browser takes
 * its snapshot of the new page once the route has rendered. Without support, or with reduced motion, links work as
 * plain navigation.
 */
export function PageTransitions() {
  const router = useRouter();
  const pathname = usePathname();

  // The new route is on screen: let the browser capture it.
  useEffect(() => {
    if (!release) return;
    const done = release;
    release = null;
    requestAnimationFrame(() => requestAnimationFrame(done));
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest<HTMLElement>("a[href]");
      const target = a?.getAttribute("target");
      if (!a || (target && target !== "_self") || a.hasAttribute("download")) return;
      // Read the attribute: an SVG link's href property is not a string.
      const url = new URL(a.getAttribute("href") ?? "", location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (!("startViewTransition" in document) || !("ViewTransitionTypeSet" in window)) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      e.preventDefault();
      e.stopPropagation();
      const root = document.documentElement.style;
      root.setProperty("--bh-x", `${e.clientX || innerWidth / 2}px`);
      root.setProperty("--bh-y", `${e.clientY || 0}px`);
      const type = a.dataset.transition ?? (a.closest("header, footer") ? "section" : "drill");
      document.startViewTransition({
        update: () =>
          new Promise<void>((resolve) => {
            release = resolve;
            router.push(url.pathname + url.search + url.hash);
            window.setTimeout(resolve, 2500);
          }),
        types: [type],
      });
    };
    // Capture phase, so this runs before the framework's own link handling.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
