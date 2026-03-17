import { PageHeader } from "../../components/ui/page-header";
import { Card, CardTitle } from "../../components/ui/card";
import { Select } from "../../components/ui/select";
import { useState } from "react";
import { useLogs } from "../../hooks/useData";
import { TestingMode } from "../../types/domain";

export function LogsPage() {
  const [mode, setMode] = useState<TestingMode | "all">("all");
  const { data: logs = [] } = useLogs(mode);

  return (
    <div className="space-y-4">
      <PageHeader title="Logs & Observability" subtitle="Filter mirror/shadow/parallel/canary logs with endpoint-level diagnostics and rollout events." />
      <Card>
        <div className="flex items-center justify-between">
          <CardTitle>Log Stream</CardTitle>
          <Select value={mode} onChange={(e) => setMode(e.target.value as TestingMode | "all")} className="w-52">
            <option value="all">All Modes</option>
            <option value="mirror">Mirror</option>
            <option value="shadow">Shadow</option>
            <option value="parallel">Parallel</option>
            <option value="canary">Canary</option>
            <option value="cutover">Cutover</option>
          </Select>
        </div>
        <div className="mt-3 max-h-[540px] overflow-auto rounded-lg border border-border">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-muted">
              <tr>
                {["Timestamp", "Level", "Mode", "Endpoint", "Message"].map((header) => (
                  <th key={header} className="px-3 py-2 uppercase text-muted-foreground">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-border">
                  <td className="px-3 py-2 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="px-3 py-2">{log.level}</td>
                  <td className="px-3 py-2 capitalize">{log.mode}</td>
                  <td className="px-3 py-2 font-mono">{log.endpoint}</td>
                  <td className="px-3 py-2">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
