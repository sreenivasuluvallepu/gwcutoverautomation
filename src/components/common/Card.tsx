import { ReactNode } from "react";
import { cx } from "../../lib/utils";

interface CardProps {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, subtitle, right, children, className }: CardProps) {
  return (
    <section className={cx("rounded-xl2 border border-ink-200/70 bg-white/90 p-4 shadow-card dark:border-ink-800 dark:bg-ink-900/80", className)}>
      {(title || subtitle || right) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-100">{title}</h3>}
            {subtitle && <p className="mt-1 text-xs text-ink-500 dark:text-ink-300">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}
