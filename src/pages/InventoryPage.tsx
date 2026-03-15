import { useMemo, useState } from "react";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import Table from "../components/common/Table";
import { inventory } from "../data/mock";
import { ApiInventoryItem } from "../types";

const readinessTone: Record<ApiInventoryItem["readiness"], "success" | "warning" | "danger"> = {
  Ready: "success",
  "In Review": "warning",
  Blocked: "danger"
};

const eligibilityTone: Record<ApiInventoryItem["eligibility"], "success" | "warning" | "danger"> = {
  Eligible: "success",
  "Needs Review": "warning",
  Blocked: "danger"
};

export default function InventoryPage() {
  const [query, setQuery] = useState("");
  const [readiness, setReadiness] = useState("All");

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const textMatch =
        query.length === 0 ||
        [item.application, item.apiName, item.path, item.owner, item.service]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());

      const readinessMatch = readiness === "All" || item.readiness === readiness;
      return textMatch && readinessMatch;
    });
  }, [query, readiness]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Migration Inventory / Service Catalog"
        subtitle="Track API/service/route/path readiness, mapping parity, dependency health, and cutover eligibility."
        actions={
          <div className="flex gap-2">
            <Button tone="secondary">Bulk Tag</Button>
            <Button>Export Inventory</Button>
          </div>
        }
      />

      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900"
            placeholder="Search API, service, path, owner..."
          />
          <select
            value={readiness}
            onChange={(event) => setReadiness(event.target.value)}
            className="rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900"
          >
            <option>All</option>
            <option>Ready</option>
            <option>In Review</option>
            <option>Blocked</option>
          </select>
          <div className="flex items-center text-xs text-ink-600 dark:text-ink-300">Showing {filtered.length} migration units</div>
        </div>
      </Card>

      <Card>
        <Table
          rows={filtered}
          columns={[
            { key: "app", header: "Application / API", render: (row) => `${row.application} - ${row.apiName}` },
            { key: "service", header: "Service / Route", render: (row) => `${row.service} / ${row.route}` },
            { key: "path", header: "Path", render: (row) => <code className="text-xs">{row.path}</code> },
            { key: "owner", header: "Owner Team", render: (row) => row.owner },
            { key: "readiness", header: "Readiness", render: (row) => <Badge tone={readinessTone[row.readiness]}>{row.readiness}</Badge> },
            { key: "migration", header: "Migration State", render: (row) => row.migration },
            { key: "test", header: "Test", render: (row) => row.testStatus },
            { key: "dependency", header: "Dependency", render: (row) => row.dependency },
            { key: "eligibility", header: "Eligibility", render: (row) => <Badge tone={eligibilityTone[row.eligibility]}>{row.eligibility}</Badge> }
          ]}
        />
      </Card>
    </div>
  );
}
