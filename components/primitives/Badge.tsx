import { cn } from "@/lib/utils/cn";

const toneClasses = {
  neutral: "bg-stone/60 text-ink-muted",
  uncertainty: "bg-uncertainty/15 text-uncertainty",
  territory: "bg-territory/10 text-territory-selected",
} as const;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneClasses;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 font-sans text-[0.65rem] font-medium uppercase tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
