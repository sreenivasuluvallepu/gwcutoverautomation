import { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn("h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary", props.className)}
    />
  );
}
