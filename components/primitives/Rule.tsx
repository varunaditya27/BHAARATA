import { cn } from "@/lib/utils/cn";

/** Editorial divider — use instead of card borders/shadows for separation. */
export function Rule({ className }: { className?: string }) {
  return <hr className={cn("border-t border-border", className)} />;
}
