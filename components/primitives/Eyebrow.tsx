import { cn } from "@/lib/utils/cn";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "font-sans text-sm font-medium text-ink-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
