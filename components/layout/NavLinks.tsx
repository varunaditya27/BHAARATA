"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils/cn";
import type { NavLink } from "./MobileMenu";

/**
 * Desktop section links with a sliding terracotta ink rule that marks
 * the active section like a cartographic index tab.
 */
export function NavLinks({
  primary,
  secondary,
}: {
  primary: NavLink[];
  secondary: NavLink[];
}) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const renderLink = (link: NavLink, index?: number) => {
    const active = pathname.startsWith(link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex h-16 items-center gap-1.5 font-sans text-[13px] tracking-[0.01em] transition-colors",
          active ? "font-medium text-ink" : "text-ink-muted hover:text-ink"
        )}
      >
        {typeof index === "number" && (
          <span
            className={cn(
              "hidden font-mono text-[10px] xl:inline",
              active ? "text-territory-selected" : "text-ink-soft/70 group-hover:text-ink-muted"
            )}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        <span>{link.label}</span>
        {active ? (
          <motion.span
            layoutId={prefersReducedMotion ? undefined : "nav-active-rule"}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            className="absolute inset-x-0 bottom-0 h-[2px] bg-territory-selected"
          />
        ) : (
          <span className="absolute inset-x-0 bottom-0 h-px origin-center scale-x-0 bg-ink/35 transition-transform duration-200 group-hover:scale-x-100" />
        )}
      </Link>
    );
  };

  return (
    <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
      <div className="flex items-center gap-5">
        {primary.map((link, idx) => renderLink(link, idx))}
      </div>
      <span className="h-4 w-px bg-border" aria-hidden />
      <div className="flex items-center gap-5">
        {secondary.map((link) => renderLink(link))}
      </div>
    </nav>
  );
}
