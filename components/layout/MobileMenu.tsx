"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export type NavLink = { href: string; label: string };

/** Below `lg` the seven section links don't fit in one row — they move
 * into a sheet that slides down under the header. */
export function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center border border-border text-ink lg:hidden"
      >
        <Menu size={16} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-[bh-overlay-in_200ms_ease-out]" />
        <Dialog.Content className="fixed inset-x-0 top-0 z-50 border-b border-border bg-paper px-6 pb-8 pt-4 shadow-xl data-[state=open]:animate-[bh-sheet-down_320ms_cubic-bezier(0.22,1,0.36,1)]">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-display text-lg tracking-wide text-ink">BHĀRATA</Dialog.Title>
            <Dialog.Close aria-label="Close menu" className="flex h-9 w-9 items-center justify-center border border-border text-ink">
              <X size={16} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Site sections</Dialog.Description>
          <nav className="mt-8 flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "border-t border-border py-3 font-display text-2xl text-ink",
                  pathname.startsWith(link.href) && "text-territory-selected",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
