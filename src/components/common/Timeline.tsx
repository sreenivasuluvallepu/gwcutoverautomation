import { TimelineEvent } from "../../types";
import { cx } from "../../lib/utils";

interface TimelineProps {
  events: TimelineEvent[];
}

const severityDot: Record<TimelineEvent["severity"], string> = {
  info: "bg-teal-500",
  warning: "bg-amber-500",
  critical: "bg-danger-500"
};

export default function Timeline({ events }: TimelineProps) {
  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="relative border-l border-ink-300 pl-4 dark:border-ink-700">
          <span className={cx("absolute -left-[5px] top-[7px] h-2.5 w-2.5 rounded-full", severityDot[event.severity])} />
          <p className="text-xs font-mono text-ink-500">{event.time}</p>
          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{event.action}</p>
          <p className="text-xs text-ink-600 dark:text-ink-300">{event.actor}</p>
          <p className="text-xs text-ink-500">{event.impact}</p>
        </li>
      ))}
    </ol>
  );
}
