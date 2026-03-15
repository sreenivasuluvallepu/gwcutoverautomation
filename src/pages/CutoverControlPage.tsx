import { useState } from "react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Modal from "../components/common/Modal";
import PageHeader from "../components/common/PageHeader";
import Stepper from "../components/common/Stepper";
import TrafficSlider from "../components/common/TrafficSlider";
import { rolloutStages } from "../data/mock";
import { useAppStore } from "../store/appStore";

const strategies = ["Parallel Test", "Canary", "Progressive Shift", "Full Cutover", "Rollback"] as const;

export default function CutoverControlPage() {
  const strategy = useAppStore((state) => state.selectedStrategy);
  const setStrategy = useAppStore((state) => state.setStrategy);
  const trafficPercent = useAppStore((state) => state.trafficPercent);
  const setTrafficPercent = useAppStore((state) => state.setTrafficPercent);
  const pushToast = useAppStore((state) => state.pushToast);
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Cutover Control Center"
        subtitle="Plan, validate, approve, and execute migration strategies with safety guardrails and ALB routing controls."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Cutover Strategy" subtitle="Choose execution mode" className="xl:col-span-1">
          <div className="space-y-2">
            {strategies.map((item) => (
              <label key={item} className="flex cursor-pointer items-center justify-between rounded-lg border border-ink-200 p-2 dark:border-ink-800">
                <span className="text-sm">{item}</span>
                <input
                  type="radio"
                  checked={strategy === item}
                  onChange={() => setStrategy(item)}
                  className="accent-teal-500"
                />
              </label>
            ))}
          </div>
        </Card>

        <Card title="Traffic Policy Controls" subtitle="Route/path level traffic and ALB target policy" className="xl:col-span-1">
          <TrafficSlider value={trafficPercent} onChange={setTrafficPercent} />
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Routing scope</span>
              <span className="font-semibold">Path-based + Weighted ALB</span>
            </div>
            <div className="flex justify-between">
              <span>Dry run</span>
              <span className="font-semibold text-teal-600">Enabled</span>
            </div>
            <div className="flex justify-between">
              <span>Risk score</span>
              <span className="font-semibold text-amber-600">42 / 100</span>
            </div>
          </div>
        </Card>

        <Card title="Approval & Guardrails" subtitle="Production policy checks" className="xl:col-span-1">
          <ul className="space-y-2 text-sm text-ink-700 dark:text-ink-200">
            <li>1. Freeze window check: Passed</li>
            <li>2. Dependency impact: Medium (3 services)</li>
            <li>3. Rollback readiness: Snapshot verified</li>
            <li>4. Approval chain: Release Manager + Platform Lead</li>
          </ul>
          <Button className="mt-4 w-full" onClick={() => setOpenModal(true)}>
            Execute with Approval
          </Button>
        </Card>
      </div>

      <Card title="Progression Plan" subtitle="Stage execution preview">
        <Stepper stages={rolloutStages} />
      </Card>

      <Modal
        open={openModal}
        title="Confirm Cutover Execution"
        body={
          <div className="space-y-2">
            <p>This action will execute <strong>{strategy}</strong> in the selected environment.</p>
            <p>Scope: 4 APIs, 9 routes, 21 paths. Default non-ready paths remain on legacy gateway.</p>
          </div>
        }
        confirmLabel="Submit for Approval"
        onClose={() => setOpenModal(false)}
        onConfirm={() => {
          pushToast({ type: "success", message: "Execution submitted to approval workflow." });
          setOpenModal(false);
        }}
      />
    </div>
  );
}
