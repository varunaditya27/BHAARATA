"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { NavLink } from "./MobileMenu";

/** Desktop section links. The current section gets an ink rule beneath
 * it — the one place the nav says "you are here". */
export function NavLinks({ primary, secondary }: { primary: NavLink[]; secondary: NavLink[] }) {
  const pathname = usePathname();
  const item = (link: NavLink) => {
    const active = pathname.startsWith(link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative py-1 transition-colors hover:text-ink",
          active && "text-ink after:absolute after:inset-x-0 after:-bottom-[18px] after:h-px after:bg-ink",
        )}
      >
        {link.label}
      </Link>
    );
  };
  return (
    <nav className="hidden items-center gap-5 font-sans text-sm text-ink-muted lg:flex">
      {primary.map(item)}
      <span className="h-4 w-px bg-border" aria-hidden />
      {secondary.map(item)}
    </nav>
  );
}
