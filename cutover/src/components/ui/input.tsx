import { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-primary",
        props.className
      )}
    />
  );
}
