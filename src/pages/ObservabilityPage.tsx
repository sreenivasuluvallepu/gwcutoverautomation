import { useEffect, useMemo, useState } from "react";
import Badge from "../components/common/Badge";
import BarChart from "../components/common/BarChart";
import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import { errorRateSeries, latencySeries, logEvents } from "../data/mock";
import { LogEvent } from "../types";

export default function ObservabilityPage() {
  const [stream, setStream] = useState<LogEvent[]>(logEvents);

  useEffect(() => {
    const timer = setInterval(() => {
      setStream((previous) => {
        const next = {
          ts: new Date().toISOString(),
          level: Math.random() > 0.85 ? "ERROR" : Math.random() > 0.6 ? "WARN" : "INFO",
          correlationId: `cor-${Math.floor(900000 + Math.random() * 99999)}`,
          service: ["cutover-orchestrator", "kong-adapter", "alb-router-controller"][Math.floor(Math.random() * 3)],
          message: ["Stage health check completed.", "Policy threshold evaluation running.", "ALB target group sync completed."][
            Math.floor(Math.random() * 3)
          ]
        } as LogEvent;
        return [next, ...previous].slice(0, 14);
      });
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const successRate = useMemo(() => {
    const latestError = errorRateSeries[errorRateSeries.length - 1]?.value ?? 0;
    return Math.max(0, 100 - latestError).toFixed(2);
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="Logs and Metrics Observability" subtitle="Streaming execution telemetry, route/path metrics, traces, and rollout health signals." />

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Success Rate">
          <p className="text-3xl font-bold">{successRate}%</p>
          <p className="text-xs text-ink-600 dark:text-ink-300">Environment-wide success over active window</p>
        </Card>
        <Card title="Target Group Health">
          <p className="text-3xl font-bold">92%</p>
          <p className="text-xs text-ink-600 dark:text-ink-300">ALB target instances in healthy state</p>
        </Card>
        <Card title="Plugin Failure Rate">
          <p className="text-3xl font-bold">0.7%</p>
          <p className="text-xs text-ink-600 dark:text-ink-300">Kong plugin execution failures (15 min)</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Error Rate Trend" subtitle="Legacy/Kong rollout window">
          <BarChart data={errorRateSeries} unit="%" />
        </Card>
        <Card title="Latency p95 Trend" subtitle="Path-level latency watch">
          <BarChart data={latencySeries} unit="ms" />
        </Card>
      </div>

      <Card title="Streaming Logs" subtitle="Filtered by active cutover execution">
        <div className="max-h-[420px] overflow-auto rounded-lg border border-ink-200 dark:border-ink-800">
          <div className="grid grid-cols-[180px_90px_140px_1fr] gap-2 border-b border-ink-200 bg-ink-100/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide dark:border-ink-800 dark:bg-ink-800/70">
            <span>Timestamp</span>
            <span>Level</span>
            <span>Service</span>
            <span>Message</span>
          </div>
          {stream.map((event, index) => (
            <div key={`${event.correlationId}-${index}`} className="grid grid-cols-[180px_90px_140px_1fr] gap-2 border-b border-ink-100 px-3 py-2 text-xs dark:border-ink-900">
              <span className="font-mono text-ink-600 dark:text-ink-300">{event.ts.slice(11, 23)}Z</span>
              <span>
                <Badge tone={event.level === "ERROR" ? "danger" : event.level === "WARN" ? "warning" : "success"}>{event.level}</Badge>
              </span>
              <span className="font-mono text-ink-700 dark:text-ink-100">{event.service}</span>
              <span className="text-ink-700 dark:text-ink-200">
                {event.message}
                <span className="ml-2 font-mono text-[10px] text-ink-500">{event.correlationId}</span>
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
