import Button from "../components/common/Button";
import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import Stepper from "../components/common/Stepper";
import Timeline from "../components/common/Timeline";
import { rolloutStages, timelineEvents } from "../data/mock";
import { useAppStore } from "../store/appStore";

export default function ProgressiveShiftPage() {
  const pushToast = useAppStore((state) => state.pushToast);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Progressive Shift Manager"
        subtitle="Execute staged traffic increases with readiness checks, pause/resume controls, and fallback policy."
        actions={
          <div className="flex gap-2">
            <Button tone="secondary" onClick={() => pushToast({ type: "warning", message: "Rollout paused at current stage." })}>
              Pause
            </Button>
            <Button onClick={() => pushToast({ type: "success", message: "Rollout resumed to next stage." })}>Resume</Button>
          </div>
        }
      />

      <Card title="Staged Rollout Plan" subtitle="Policy template: 5% -> 10% -> 25% -> 50% -> 100%">
        <Stepper stages={rolloutStages} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Execution Timeline" subtitle="Current shift execution events">
          <Timeline events={timelineEvents} />
        </Card>
        <Card title="Fallback and Exception Rules" subtitle="Legacy fallback controls">
          <ul className="space-y-2 text-sm">
            <li>1. Non-ready paths are pinned to legacy by default.</li>
            <li>2. Any threshold breach triggers scoped rollback to last stable stage.</li>
            <li>3. Blocked dependencies pause progression automatically.</li>
            <li>4. Manual override requires dual approval in production.</li>
            <li>5. Stage timeout escalates to SRE and Release Manager.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
