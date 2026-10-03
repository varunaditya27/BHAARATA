"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { navigateWithViewTransition } from "@/lib/utils/view-transition";

/**
 * A <Link> that navigates inside a View Transition when the browser
 * supports it (see lib/utils/view-transition.ts) — use for the "list
 * photo becomes the detail-page hero photo" continuity moments. Falls
 * back to a plain Next.js navigation everywhere else.
 */
export function TransitionLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigateWithViewTransition(router, href);
      }}
    >
      {children}
    </Link>
  );
}
