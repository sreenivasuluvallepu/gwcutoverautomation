import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import Badge from "../components/common/Badge";
import { dashboardKpis, errorRateSeries, latencySeries, timelineEvents } from "../data/mock";
import BarChart from "../components/common/BarChart";
import Timeline from "../components/common/Timeline";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Executive Dashboard"
        subtitle="Real-time migration and cutover health across environments, services, routes, and paths."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {dashboardKpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-300">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-ink-900 dark:text-ink-50">{kpi.value}</p>
            <p className="mt-1 text-xs text-ink-600 dark:text-ink-300">{kpi.delta}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Rollout Health" subtitle="Error-rate trend during active production execution" className="xl:col-span-1">
          <BarChart data={errorRateSeries} unit="%" />
        </Card>

        <Card title="Latency Watch" subtitle="p95 latency trend (ms)" className="xl:col-span-1">
          <BarChart data={latencySeries} unit="ms" />
        </Card>

        <Card title="Cutover Activity Timeline" subtitle="Latest execution and policy events" className="xl:col-span-1">
          <Timeline events={timelineEvents} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Environment Health Summary" subtitle="Operational status by environment">
          <div className="grid gap-2 sm:grid-cols-3">
            {["Dev", "QA", "UAT", "Performance", "Stage", "Prod"].map((env) => (
              <div key={env} className="rounded-lg border border-ink-200 p-3 dark:border-ink-800">
                <p className="text-sm font-semibold">{env}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge tone={env === "Prod" ? "warning" : "success"}>{env === "Prod" ? "Degraded" : "Healthy"}</Badge>
                  <span className="text-xs text-ink-600 dark:text-ink-300">{env === "Prod" ? "Canary under watch" : "No active incidents"}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Migration State Distribution" subtitle="Portfolio-level migration coverage">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Fully Migrated</span>
              <span className="font-semibold">40.4%</span>
            </div>
            <div className="flex justify-between">
              <span>Progressive Shift</span>
              <span className="font-semibold">18.6%</span>
            </div>
            <div className="flex justify-between">
              <span>Canary Live</span>
              <span className="font-semibold">11.8%</span>
            </div>
            <div className="flex justify-between">
              <span>Parallel Tested</span>
              <span className="font-semibold">14.0%</span>
            </div>
            <div className="flex justify-between">
              <span>Blocked / In Review</span>
              <span className="font-semibold text-danger-500">15.2%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
