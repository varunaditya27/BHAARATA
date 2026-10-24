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
        "inline-flex items-center rounded-sm px-2 py-0.5 font-sans text-xs",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
