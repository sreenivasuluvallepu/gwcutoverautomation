import { useState } from "react";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Modal from "../components/common/Modal";
import PageHeader from "../components/common/PageHeader";
import Table from "../components/common/Table";
import { useAppStore } from "../store/appStore";

const history = [
  {
    time: "2026-03-15 09:19:42",
    scope: "Route: payments-v2",
    operator: "sre.oncall@bankco",
    reason: "p95 latency threshold breach",
    impact: "2 services"
  },
  {
    time: "2026-03-14 18:03:10",
    scope: "Path: /v3/consent/*",
    operator: "platform.eng@bankco",
    reason: "Header mismatch",
    impact: "1 service"
  }
];

export default function RollbackPage() {
  const pushToast = useAppStore((state) => state.pushToast);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <PageHeader title="Rollback Center" subtitle="Instant and scoped rollback controls with approval, audit trail, and impact visibility." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Immediate Rollback" subtitle="Production-protected action">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Default scope</span><span className="font-semibold">Application-level</span></div>
            <div className="flex justify-between"><span>Last snapshot</span><span className="font-semibold">09:16:02</span></div>
            <div className="flex justify-between"><span>Approval</span><Badge tone="warning">Required</Badge></div>
          </div>
          <Button tone="danger" className="mt-4 w-full" onClick={() => setOpen(true)}>
            One-Click Rollback
          </Button>
        </Card>

        <Card title="Targeted Scope" subtitle="Granular rollback">
          <select className="mb-2 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900">
            <option>Global</option>
            <option>Environment</option>
            <option>Application</option>
            <option>API</option>
            <option>Service</option>
            <option>Route</option>
            <option>Path</option>
          </select>
          <input
            className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900"
            placeholder="Select service/route/path id..."
          />
        </Card>

        <Card title="Dependency Impact Summary" subtitle="Pre-rollback blast radius">
          <ul className="space-y-2 text-sm">
            <li>1. Affected upstream services: 3</li>
            <li>2. Consumer apps impacted: 5</li>
            <li>3. Critical APIs affected: 1 (Payments API)</li>
            <li>4. Estimated traffic rerouted: 2.1k RPS</li>
          </ul>
        </Card>
      </div>

      <Card title="Rollback History">
        <Table
          rows={history}
          columns={[
            { key: "time", header: "Time", render: (row) => row.time },
            { key: "scope", header: "Scope", render: (row) => row.scope },
            { key: "operator", header: "Operator", render: (row) => row.operator },
            { key: "reason", header: "Reason", render: (row) => row.reason },
            { key: "impact", header: "Impact", render: (row) => row.impact }
          ]}
        />
      </Card>

      <Modal
        open={open}
        title="Confirm Production Rollback"
        body={
          <div className="space-y-2">
            <p>This will redirect traffic back to legacy gateway for selected scope and restore last known-good config.</p>
            <p>Approval chain: Platform Lead + Release Manager.</p>
          </div>
        }
        tone="danger"
        confirmLabel="Request Rollback Approval"
        onClose={() => setOpen(false)}
        onConfirm={() => {
          pushToast({ type: "warning", message: "Rollback request submitted for approval." });
          setOpen(false);
        }}
      />
    </div>
  );
}
