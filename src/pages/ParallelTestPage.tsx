import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import Table from "../components/common/Table";
import { comparisonRows } from "../data/mock";
import { useAppStore } from "../store/appStore";

export default function ParallelTestPage() {
  const pushToast = useAppStore((state) => state.pushToast);

  const mismatches = comparisonRows.filter((row) => row.status === "mismatch").length;
  const confidence = Math.round(((comparisonRows.length - mismatches) / comparisonRows.length) * 100);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Parallel Test Console"
        subtitle="Mirror controlled traffic to Legacy and Kong, then compare behavior, headers, latency, and payload patterns."
        actions={<Button onClick={() => pushToast({ type: "success", message: "Parallel test execution started." })}>Run Instant Test</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Scope Selection" subtitle="API/route/path target">
          <div className="space-y-2 text-sm">
            <label className="block">
              <span className="mb-1 block text-xs text-ink-500">API</span>
              <select className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-900">
                <option>Payments API</option>
                <option>Accounts API</option>
                <option>Consent API</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-ink-500">Path</span>
              <input value="/v2/payments/transfer" readOnly className="w-full rounded-lg border border-ink-300 bg-ink-50 px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-800" />
            </label>
          </div>
        </Card>

        <Card title="Live Test Summary" subtitle="Automated comparison status">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Requests compared</span>
              <span className="font-semibold">1,250</span>
            </div>
            <div className="flex justify-between">
              <span>Mismatches</span>
              <span className="font-semibold text-danger-500">{mismatches}</span>
            </div>
            <div className="flex justify-between">
              <span>Confidence</span>
              <Badge tone={confidence >= 90 ? "success" : "warning"}>{confidence}%</Badge>
            </div>
            <div className="flex justify-between">
              <span>Recommendation</span>
              <span className="font-semibold">{confidence >= 90 ? "Go" : "Conditional Go"}</span>
            </div>
          </div>
        </Card>

        <Card title="Diff Categories" subtitle="Mismatch classification">
          <ul className="space-y-2 text-sm">
            <li>1. Header mismatch: 2</li>
            <li>2. Payload shape mismatch: 0</li>
            <li>3. Latency threshold breach: 1</li>
            <li>4. Status mismatch: 0</li>
          </ul>
        </Card>
      </div>

      <Card title="Legacy vs Kong Comparison">
        <Table
          rows={comparisonRows}
          columns={[
            { key: "field", header: "Field", render: (row) => row.field },
            { key: "legacy", header: "Legacy", render: (row) => row.legacy },
            { key: "kong", header: "Kong", render: (row) => row.kong },
            {
              key: "status",
              header: "Result",
              render: (row) => <Badge tone={row.status === "match" ? "success" : "danger"}>{row.status}</Badge>
            }
          ]}
        />
      </Card>
    </div>
  );
}
