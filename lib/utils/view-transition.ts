import { startTransition } from "react";
import type { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;

/**
 * Same-document View Transitions (document.startViewTransition) — not the
 * cross-document `@view-transition` CSS rule, which doesn't fire for
 * Next.js's client-side route changes since the document never actually
 * reloads. Elements sharing a `view-transition-name` across the two
 * routes (e.g. a kingdom's photo on /polities and on /polities/[slug])
 * morph between their before/after positions instead of cutting.
 *
 * Next.js gives no "route change finished painting" callback, so this
 * resolves the transition's update promise after React's `startTransition`
 * has committed and two animation frames have passed — enough for a
 * prefetched route (the Next.js default on hover/viewport) to have
 * painted. Feature-detected throughout: browsers without
 * startViewTransition support (Firefox, as of this writing) just get a
 * normal instant navigation.
 */
/** Shared naming convention so the same photo on a list/preview and on
 * its detail page is recognized as "the same element" by the browser. */
export function polityPhotoTransitionName(slug: string): string {
  return `polity-photo-${slug}`;
}

export function navigateWithViewTransition(router: Router, href: string) {
  const doc = document as Document & {
    startViewTransition?: (callback: () => void | Promise<void>) => unknown;
  };
  if (
    typeof doc.startViewTransition !== "function" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    router.push(href);
    return;
  }
  doc.startViewTransition(() => {
    return new Promise<void>((resolve) => {
      startTransition(() => {
        router.push(href);
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    });
  });
}
