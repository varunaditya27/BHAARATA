"use client";

import { usePathname } from "next/navigation";

/** Renders its (server-rendered) children everywhere except the given route prefixes. */
export function HideOnRoutes({ routes, children }: { routes: string[]; children: React.ReactNode }) {
  const pathname = usePathname();
  return routes.some((r) => pathname.startsWith(r)) ? null : children;
}
