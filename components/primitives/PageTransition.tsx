import { ViewTransition } from "react";

/**
 * Wraps a page's content so forward/back navigations slide in the
 * direction they travel (CSS in globals.css, `.nav-forward`/`.nav-back`).
 * Must sit in each page.tsx, not the layout — layouts persist across
 * navigations, so their enter/exit never fire. Untyped transitions
 * (browser back button, router.refresh) deliberately get no slide.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
