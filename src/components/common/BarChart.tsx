import { MetricPoint } from "../../types";

interface BarChartProps {
  data: MetricPoint[];
  unit?: string;
}

export default function BarChart({ data, unit = "" }: BarChartProps) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-2">
      {data.map((point) => {
        const width = Math.max(8, Math.round((point.value / max) * 100));
        return (
          <div key={point.label} className="grid grid-cols-[52px_1fr_70px] items-center gap-2 text-xs">
            <span className="font-mono text-ink-600 dark:text-ink-300">{point.label}</span>
            <div className="h-2.5 rounded-full bg-ink-200 dark:bg-ink-800">
              <div style={{ width: `${width}%` }} className="h-2.5 rounded-full bg-teal-500" />
            </div>
            <span className="text-right font-semibold text-ink-700 dark:text-ink-100">
              {point.value}
              {unit}
            </span>
          </div>
        );
      })}
    </div>
  );
}
