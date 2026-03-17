import { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary",
        props.className
      )}
    />
  );
}
