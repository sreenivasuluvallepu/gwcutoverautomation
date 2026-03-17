export type TestingMode = "none" | "mirror" | "shadow" | "parallel" | "canary" | "cutover";
export type Role = "viewer" | "operator" | "approver" | "admin";
export type Environment = "dev" | "qa" | "uat" | "stage" | "prod";
export type ActionKey =
  | "parallel-start"
  | "mirror-enable"
  | "shadow-enable"
  | "canary-start"
  | "progressive-shift"
  | "full-cutover"
  | "rollback";

export interface EndpointRecord {
  id: string;
  service: string;
  method: string;
  path: string;
  owner: string;
  status: "active" | "deprecated" | "candidate";
  mode: TestingMode;
  trafficPercent: number;
  batch?: string;
  migrated: boolean;
  source: "legacy" | "kong";
}

export interface KpiSummary {
  totalEndpoints: number;
  migrated: number;
  pending: number;
  failed: number;
  migrationPercent: number;
  activeMode: TestingMode;
}

export interface TrafficStat {
  label: string;
  legacy: number;
  kong: number;
}

export interface ModeDistribution {
  mode: TestingMode;
  count: number;
}

export interface ComparisonResult {
  endpointId: string;
  endpoint: string;
  method: string;
  statusMatch: boolean;
  schemaMatch: boolean;
  latencyDeltaMs: number;
  mismatchPercent: number;
  passRate: number;
}

export interface DiffResult {
  endpointId: string;
  legacyResponse: Record<string, unknown>;
  kongResponse: Record<string, unknown>;
  diffSummary: string[];
}

export interface LogEvent {
  id: string;
  timestamp: string;
  mode: TestingMode;
  endpoint: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
}

export interface ActionRequest {
  action: ActionKey;
  endpointIds: string[];
  environment: Environment;
}

export interface SimulationResult {
  predictedFailureRate: number;
  riskScore: number;
  recommendation: string;
}

export interface ApprovalRecord {
  id: string;
  requestedBy: string;
  action: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
