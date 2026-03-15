import { ApiInventoryItem, ComparisonRow, Kpi, LogEvent, MetricPoint, RolloutStage, TimelineEvent } from "../types";

export const environments = ["Dev", "QA", "UAT", "Performance", "Stage", "Prod"] as const;

export const dashboardKpis: Kpi[] = [
  { label: "Total APIs", value: "428", delta: "+12 this sprint", trend: "up" },
  { label: "Migrated APIs", value: "173", delta: "+9 today", trend: "up" },
  { label: "Ready for Cutover", value: "61", delta: "+6", trend: "up" },
  { label: "In-progress Cutovers", value: "7", delta: "2 paused", trend: "steady" },
  { label: "Canary Live", value: "14", delta: "All healthy", trend: "steady" },
  { label: "Rollback Alerts", value: "2", delta: "-1 from yesterday", trend: "down" }
];

export const inventory: ApiInventoryItem[] = [
  {
    id: "api-101",
    application: "Retail Banking",
    apiName: "Accounts API",
    service: "accounts-svc",
    route: "accounts-v1",
    path: "/v1/accounts/*",
    owner: "Core-Banking Team",
    readiness: "Ready",
    migration: "Canary Live",
    testStatus: "Pass",
    dependency: "Healthy",
    eligibility: "Eligible"
  },
  {
    id: "api-102",
    application: "Retail Banking",
    apiName: "Payments API",
    service: "payments-svc",
    route: "payments-v2",
    path: "/v2/payments/transfer",
    owner: "Payments Team",
    readiness: "In Review",
    migration: "Parallel Tested",
    testStatus: "Pass",
    dependency: "At Risk",
    eligibility: "Needs Review"
  },
  {
    id: "api-103",
    application: "Cards",
    apiName: "Card Lifecycle API",
    service: "cards-lifecycle-svc",
    route: "cards-v1",
    path: "/v1/cards/*",
    owner: "Cards Platform",
    readiness: "Blocked",
    migration: "Mapped",
    testStatus: "Pending",
    dependency: "Blocked",
    eligibility: "Blocked"
  },
  {
    id: "api-104",
    application: "Corporate Treasury",
    apiName: "Liquidity API",
    service: "liquidity-svc",
    route: "liquidity-v1",
    path: "/v1/treasury/liquidity",
    owner: "Treasury Team",
    readiness: "Ready",
    migration: "Progressive Shift",
    testStatus: "Pass",
    dependency: "Healthy",
    eligibility: "Eligible"
  },
  {
    id: "api-105",
    application: "Open Banking",
    apiName: "Consent API",
    service: "consent-svc",
    route: "consent-v3",
    path: "/v3/consent/*",
    owner: "Open-Banking Team",
    readiness: "Ready",
    migration: "Parallel Tested",
    testStatus: "Fail",
    dependency: "Healthy",
    eligibility: "Needs Review"
  },
  {
    id: "api-106",
    application: "Fraud",
    apiName: "Risk Scoring API",
    service: "risk-score-svc",
    route: "fraud-v1",
    path: "/v1/fraud/score",
    owner: "Fraud-Defense Team",
    readiness: "Ready",
    migration: "Fully Migrated",
    testStatus: "Pass",
    dependency: "Healthy",
    eligibility: "Eligible"
  }
];

export const rolloutStages: RolloutStage[] = [
  { label: "Stage 1", target: 5, status: "complete" },
  { label: "Stage 2", target: 10, status: "complete" },
  { label: "Stage 3", target: 25, status: "running" },
  { label: "Stage 4", target: 50, status: "pending" },
  { label: "Stage 5", target: 100, status: "pending" }
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "evt-1",
    time: "09:11:03",
    actor: "release.manager@bankco",
    action: "Approved Progressive Shift Plan",
    impact: "Payments API /v2/payments/transfer",
    severity: "info"
  },
  {
    id: "evt-2",
    time: "09:17:27",
    actor: "system.policy-engine",
    action: "Paused Stage 3 due to p95 breach",
    impact: "Latency p95 exceeded 450ms threshold",
    severity: "warning"
  },
  {
    id: "evt-3",
    time: "09:19:42",
    actor: "sre.oncall@bankco",
    action: "Executed scoped rollback",
    impact: "2 routes reverted to Legacy Gateway",
    severity: "critical"
  }
];

export const comparisonRows: ComparisonRow[] = [
  { field: "HTTP Status", legacy: "200", kong: "200", status: "match" },
  { field: "x-correlation-id", legacy: "present", kong: "present", status: "match" },
  { field: "x-partner-tier", legacy: "gold", kong: "silver", status: "mismatch" },
  { field: "Body Schema", legacy: "v2.4", kong: "v2.4", status: "match" },
  { field: "Latency p95", legacy: "278ms", kong: "344ms", status: "mismatch" }
];

export const logEvents: LogEvent[] = [
  {
    ts: "2026-03-15T09:20:14.110Z",
    level: "INFO",
    correlationId: "cor-991203",
    service: "cutover-orchestrator",
    message: "Progressive stage promoted to 25% for route payments-v2."
  },
  {
    ts: "2026-03-15T09:20:41.201Z",
    level: "WARN",
    correlationId: "cor-991220",
    service: "policy-engine",
    message: "Error rate nearing threshold on /v2/payments/transfer."
  },
  {
    ts: "2026-03-15T09:20:50.992Z",
    level: "ERROR",
    correlationId: "cor-991241",
    service: "alb-router-controller",
    message: "Target group tg-kong-prod unhealthy count exceeded limit."
  }
];

export const errorRateSeries: MetricPoint[] = [
  { label: "09:00", value: 0.2 },
  { label: "09:05", value: 0.3 },
  { label: "09:10", value: 0.4 },
  { label: "09:15", value: 0.9 },
  { label: "09:20", value: 1.8 },
  { label: "09:25", value: 0.7 }
];

export const latencySeries: MetricPoint[] = [
  { label: "09:00", value: 180 },
  { label: "09:05", value: 210 },
  { label: "09:10", value: 225 },
  { label: "09:15", value: 360 },
  { label: "09:20", value: 420 },
  { label: "09:25", value: 260 }
];
