import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const variantClasses = {
  solid: "bg-ink text-paper hover:bg-ink/85",
  outline: "border border-ink text-ink hover:bg-ink/5",
  text: "text-ink underline underline-offset-4 hover:text-ink-muted",
} as const;

type BaseProps = {
  children: React.ReactNode;
  variant?: keyof typeof variantClasses;
  className?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 font-sans text-sm font-medium transition-colors px-4 py-2";

export function Button({
  children,
  variant = "solid",
  className,
  ...rest
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variantClasses[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  variant = "solid",
  className,
  href,
  transitionTypes,
}: BaseProps & { href: string; transitionTypes?: string[] }) {
  return (
    <Link href={href} transitionTypes={transitionTypes} className={cn(base, variantClasses[variant], className)}>
      {children}
    </Link>
  );
}
