import { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Variant = "default" | "secondary" | "danger" | "ghost";

const variantClass: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-slate-800 text-white hover:bg-slate-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent text-foreground hover:bg-muted"
};

export function Button({
  className,
  children,
  variant = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variantClass[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
