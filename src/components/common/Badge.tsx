import { ReactNode } from "react";
import { cx } from "../../lib/utils";

interface BadgeProps {
  tone?: "neutral" | "success" | "warning" | "danger";
  children: ReactNode;
}

const toneMap = {
  neutral: "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-100",
  success: "bg-teal-500/15 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
  warning: "bg-amber-500/20 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400",
  danger: "bg-danger-500/20 text-danger-600 dark:bg-danger-500/25 dark:text-danger-400"
};

export default function Badge({ tone = "neutral", children }: BadgeProps) {
  return <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-semibold", toneMap[tone])}>{children}</span>;
}
