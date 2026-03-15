import { useState } from "react";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import TrafficSlider from "../components/common/TrafficSlider";
import { useAppStore } from "../store/appStore";

export default function CanaryPage() {
  const [percent, setPercent] = useState(5);
  const [autoPromote, setAutoPromote] = useState(true);
  const pushToast = useAppStore((state) => state.pushToast);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Canary Management"
        subtitle="Launch controlled canaries for selected APIs/routes/paths and promote safely with policy thresholds."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Canary Configuration" subtitle="Scope and initial percentage">
          <TrafficSlider value={percent} onChange={setPercent} />
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Scope</span>
              <span className="font-semibold">Payments API: /v2/payments/transfer</span>
            </div>
            <div className="flex justify-between">
              <span>Policy</span>
              <span className="font-semibold">Prod-Strict-v3</span>
            </div>
          </div>
        </Card>

        <Card title="Health Thresholds" subtitle="Auto rollback triggers">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Error rate</span><span className="font-semibold">&lt; 1.5%</span></li>
            <li className="flex justify-between"><span>p95 latency</span><span className="font-semibold">&lt; 450ms</span></li>
            <li className="flex justify-between"><span>5xx spikes</span><span className="font-semibold">No sustained spikes</span></li>
            <li className="flex justify-between"><span>Target group health</span><span className="font-semibold">Min 90%</span></li>
          </ul>
        </Card>

        <Card title="Promotion Mode" subtitle="Manual or policy-driven">
          <label className="flex items-center justify-between rounded-lg border border-ink-200 p-3 dark:border-ink-800">
            <span className="text-sm font-semibold">Auto Promotion</span>
            <input type="checkbox" checked={autoPromote} onChange={(e) => setAutoPromote(e.target.checked)} className="accent-teal-500" />
          </label>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Current health</span><Badge tone="success">Healthy</Badge></div>
            <div className="flex justify-between"><span>Next stage</span><span className="font-semibold">10%</span></div>
            <div className="flex justify-between"><span>Hold time</span><span className="font-semibold">20 mins</span></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button tone="secondary" onClick={() => pushToast({ type: "warning", message: "Canary paused for manual review." })}>Pause</Button>
            <Button onClick={() => pushToast({ type: "success", message: "Canary promotion initiated." })}>Promote</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
