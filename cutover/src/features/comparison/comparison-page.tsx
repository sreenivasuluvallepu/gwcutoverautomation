import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/ui/page-header";
import { Card, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Api } from "../../lib/api";
import { useCompareResults } from "../../hooks/useData";

function pretty(input: unknown) {
  return JSON.stringify(input, null, 2);
}

export function ComparisonPage() {
  const { data: rows = [] } = useCompareResults();
  const [selected, setSelected] = useState<string | null>(rows[0]?.endpointId ?? null);
  const diffQuery = useQuery({
    queryKey: ["diff", selected],
    queryFn: () => Api.getDiff(selected ?? ""),
    enabled: Boolean(selected)
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Comparison & Validation Dashboard" subtitle="Analyze legacy vs Kong behavior with response diffing, mismatch trends, and pass/fail confidence." />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardTitle>Parallel / Shadow Result Matrix</CardTitle>
          <div className="mt-3 overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  {["Endpoint", "Pass Rate", "Mismatch %", "Latency Δ", "Status", "Actions"].map((header) => (
                    <th key={header} className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.endpointId} className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-xs">
                      {row.method} {row.endpoint}
                    </td>
                    <td className="px-3 py-2">{row.passRate}%</td>
                    <td className="px-3 py-2">{row.mismatchPercent}%</td>
                    <td className="px-3 py-2">{row.latencyDeltaMs} ms</td>
                    <td className="px-3 py-2">
                      <Badge className={row.statusMatch && row.schemaMatch ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                        {row.statusMatch && row.schemaMatch ? "PASS" : "FAIL"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Button variant="ghost" onClick={() => setSelected(row.endpointId)}>
                        View Diff
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardTitle>Inline JSON Diff Viewer</CardTitle>
          <div className="mt-3 grid gap-3">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Legacy Response</p>
              <pre className="max-h-44 overflow-auto rounded-lg bg-slate-950 p-2 text-xs text-slate-100">{pretty(diffQuery.data?.legacyResponse ?? {})}</pre>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Kong Response</p>
              <pre className="max-h-44 overflow-auto rounded-lg bg-slate-950 p-2 text-xs text-slate-100">{pretty(diffQuery.data?.kongResponse ?? {})}</pre>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Diff Summary</p>
              <ul className="space-y-1 text-sm">
                {(diffQuery.data?.diffSummary ?? ["Select an endpoint to inspect response diffs."]).map((item) => (
                  <li key={item} className="rounded bg-muted px-2 py-1">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
