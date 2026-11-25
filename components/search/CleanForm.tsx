"use client";

/** A search form that leaves out the fields nobody filled in, so the address stays short enough to share. */
export function CleanForm({ children, ...props }: React.ComponentProps<"form">) {
  return (
    <form
      {...props}
      onSubmit={(e) => {
        for (const el of Array.from(e.currentTarget.elements)) {
          const field = el as HTMLInputElement;
          if (field.name && field.type !== "hidden" && field.type !== "checkbox" && !field.value.trim()) field.disabled = true;
        }
      }}
    >
      {children}
    </form>
  );
}
