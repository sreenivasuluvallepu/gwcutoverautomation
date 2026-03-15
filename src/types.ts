export type Environment = "Dev" | "QA" | "UAT" | "Performance" | "Stage" | "Prod";

export type MigrationState =
  | "Not Started"
  | "Mapped"
  | "Parallel Tested"
  | "Canary Live"
  | "Progressive Shift"
  | "Fully Migrated"
  | "Rolled Back";

export type ReadinessState = "Blocked" | "In Review" | "Ready";

export interface Kpi {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "steady";
}

export interface ApiInventoryItem {
  id: string;
  application: string;
  apiName: string;
  service: string;
  route: string;
  path: string;
  owner: string;
  readiness: ReadinessState;
  migration: MigrationState;
  testStatus: "Pass" | "Fail" | "Pending";
  dependency: "Healthy" | "At Risk" | "Blocked";
  eligibility: "Eligible" | "Needs Review" | "Blocked";
}

export interface RolloutStage {
  label: string;
  target: number;
  status: "pending" | "running" | "complete" | "failed";
}

export interface TimelineEvent {
  id: string;
  time: string;
  actor: string;
  action: string;
  impact: string;
  severity: "info" | "warning" | "critical";
}

export interface LogEvent {
  ts: string;
  level: "INFO" | "WARN" | "ERROR";
  correlationId: string;
  service: string;
  message: string;
}

export interface MetricPoint {
  label: string;
  value: number;
}

export interface ComparisonRow {
  field: string;
  legacy: string;
  kong: string;
  status: "match" | "mismatch";
}
