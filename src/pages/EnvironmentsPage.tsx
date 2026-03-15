import Badge from "../components/common/Badge";
import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import Table from "../components/common/Table";

const rows = [
  { env: "Dev", drift: "Low", policy: "Relaxed", deployment: "2026-03-15 07:41", status: "Healthy" },
  { env: "QA", drift: "Low", policy: "Standard", deployment: "2026-03-15 08:02", status: "Healthy" },
  { env: "UAT", drift: "Medium", policy: "Standard", deployment: "2026-03-15 08:33", status: "Healthy" },
  { env: "Performance", drift: "Medium", policy: "Perf-Strict", deployment: "2026-03-15 08:55", status: "Healthy" },
  { env: "Stage", drift: "High", policy: "Pre-Prod", deployment: "2026-03-15 09:04", status: "Warning" },
  { env: "Prod", drift: "Low", policy: "Prod-Strict-v3", deployment: "2026-03-15 09:16", status: "Degraded" }
];

export default function EnvironmentsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Environment Manager"
        subtitle="Compare configs, detect drift, inspect deployment history, and enforce environment-aware migration policies."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Promotion Workflow" subtitle="Environment progression">
          <p className="text-sm">Dev -&gt; QA -&gt; UAT -&gt; Stage -&gt; Prod</p>
          <p className="mt-2 text-xs text-ink-600 dark:text-ink-300">Promotion gates require readiness evidence and approval records.</p>
        </Card>
        <Card title="Config Drift Alert" subtitle="Cross-environment parity">
          <p className="text-sm">Stage has 3 route-level drifts compared with Prod baseline.</p>
          <p className="mt-2 text-xs text-danger-500">Action required before production promotion.</p>
        </Card>
        <Card title="Change Freeze" subtitle="Operational guardrails">
          <p className="text-sm">Prod freeze enabled for 22:00-06:00 CT, except emergency rollback.</p>
        </Card>
      </div>

      <Card title="Environment Comparison">
        <Table
          rows={rows}
          columns={[
            { key: "env", header: "Environment", render: (row) => row.env },
            { key: "drift", header: "Config Drift", render: (row) => row.drift },
            { key: "policy", header: "Policy Profile", render: (row) => row.policy },
            { key: "deployment", header: "Last Deployment", render: (row) => row.deployment },
            {
              key: "status",
              header: "Health",
              render: (row) => (
                <Badge tone={row.status === "Healthy" ? "success" : row.status === "Warning" ? "warning" : "danger"}>{row.status}</Badge>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
}
