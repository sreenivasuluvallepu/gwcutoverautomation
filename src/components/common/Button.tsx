import { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "primary" | "secondary" | "danger" | "ghost";
  children: ReactNode;
}

const toneMap = {
  primary: "bg-ink-800 text-white hover:bg-ink-700 dark:bg-teal-500 dark:text-ink-950 dark:hover:bg-teal-400",
  secondary: "bg-ink-100 text-ink-800 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700",
  danger: "bg-danger-500 text-white hover:bg-danger-600",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-800"
};

export default function Button({ tone = "primary", children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        toneMap[tone],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
