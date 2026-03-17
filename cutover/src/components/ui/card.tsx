import { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Card({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("rounded-lg border border-border bg-card p-4 shadow-soft", className)}>{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{children}</h3>;
}
