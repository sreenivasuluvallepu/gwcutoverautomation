import { useState } from "react";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Modal from "../components/common/Modal";
import PageHeader from "../components/common/PageHeader";
import Table from "../components/common/Table";

const auditRows = [
  {
    time: "2026-03-15 09:11:03",
    actor: "release.manager@bankco",
    action: "Approved plan cp-789",
    target: "Payments API / Progressive Shift",
    result: "Approved"
  },
  {
    time: "2026-03-15 09:17:27",
    actor: "system.policy-engine",
    action: "Paused stage at 25%",
    target: "execution ex-921",
    result: "Guardrail Triggered"
  },
  {
    time: "2026-03-15 09:19:42",
    actor: "sre.oncall@bankco",
    action: "Executed route rollback",
    target: "payments-v2",
    result: "Rollback Completed"
  }
];

export default function AuditPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Audit and Governance"
        subtitle="Immutable operational trail of approvals, changes, policy outcomes, and rollback evidence."
        actions={
          <Button tone="secondary" onClick={() => setOpen(true)}>
            Download Evidence Pack
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Change Governance">
          <ul className="space-y-2 text-sm">
            <li>1. Production execution requires dual approval.</li>
            <li>2. Change freeze windows enforced by policy.</li>
            <li>3. Dry-run evidence required before apply.</li>
          </ul>
        </Card>
        <Card title="Policy Compliance">
          <p className="text-2xl font-bold">98.7%</p>
          <p className="text-xs text-ink-600 dark:text-ink-300">Executed changes passing all governance checks.</p>
        </Card>
        <Card title="Rollback Readiness">
          <p className="text-2xl font-bold">100%</p>
          <p className="text-xs text-ink-600 dark:text-ink-300">All active cutovers have validated restore snapshots.</p>
        </Card>
      </div>

      <Card title="Audit Ledger">
        <Table
          rows={auditRows}
          columns={[
            { key: "time", header: "Time", render: (row) => row.time },
            { key: "actor", header: "Actor", render: (row) => row.actor },
            { key: "action", header: "Action", render: (row) => row.action },
            { key: "target", header: "Target", render: (row) => row.target },
            {
              key: "result",
              header: "Outcome",
              render: (row) => (
                <Badge tone={row.result.includes("Approved") || row.result.includes("Completed") ? "success" : "warning"}>{row.result}</Badge>
              )
            }
          ]}
        />
      </Card>

      <Modal
        open={open}
        title="Generate Governance Evidence Pack"
        body={
          <div className="space-y-2">
            <p>Generate downloadable report including approvals, policy checks, change diffs, rollback records, and telemetry snapshots.</p>
            <p>Format: PDF + JSON evidence bundle.</p>
          </div>
        }
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        confirmLabel="Generate"
      />
    </div>
  );
}
