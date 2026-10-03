import { cn } from "@/lib/utils/cn";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "font-sans text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
