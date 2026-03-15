import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-50">{title}</h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{subtitle}</p>
      </div>
      {actions}
    </div>
  );
}
