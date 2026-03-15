import { RolloutStage } from "../../types";
import { cx } from "../../lib/utils";

interface StepperProps {
  stages: RolloutStage[];
}

export default function Stepper({ stages }: StepperProps) {
  return (
    <ol className="grid gap-3 md:grid-cols-5">
      {stages.map((stage) => (
        <li
          key={stage.label}
          className={cx(
            "rounded-lg border px-3 py-2",
            stage.status === "complete" && "border-teal-500/40 bg-teal-500/10",
            stage.status === "running" && "border-amber-500/45 bg-amber-500/15",
            stage.status === "pending" && "border-ink-300 bg-ink-100/70 dark:border-ink-700 dark:bg-ink-800/50",
            stage.status === "failed" && "border-danger-500/40 bg-danger-500/15"
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-wide">{stage.label}</p>
          <p className="text-lg font-bold">{stage.target}%</p>
          <p className="text-xs capitalize text-ink-600 dark:text-ink-200">{stage.status}</p>
        </li>
      ))}
    </ol>
  );
}
