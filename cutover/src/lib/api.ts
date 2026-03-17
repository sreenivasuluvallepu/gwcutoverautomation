import axios from "axios";
import {
  ActionRequest,
  ApprovalRecord,
  ComparisonResult,
  DiffResult,
  EndpointRecord,
  KpiSummary,
  LogEvent,
  ModeDistribution,
  SimulationResult,
  TrafficStat
} from "../types/domain";

const api = axios.create({
  baseURL: "/api"
});

export const Api = {
  getSummary: async () => (await api.get<KpiSummary>("/dashboard/summary")).data,
  getTrafficSplit: async () => (await api.get<TrafficStat[]>("/dashboard/traffic-split")).data,
  getModeDistribution: async () => (await api.get<ModeDistribution[]>("/dashboard/mode-distribution")).data,
  getTrend: async () => (await api.get<TrafficStat[]>("/dashboard/migration-trend")).data,
  getLegacyEndpoints: async () => (await api.get<EndpointRecord[]>("/endpoints/legacy")).data,
  getKongEndpoints: async () => (await api.get<EndpointRecord[]>("/endpoints/kong")).data,
  getCompareResults: async () => (await api.get<ComparisonResult[]>("/compare/results")).data,
  getDiff: async (endpointId: string) => (await api.get<DiffResult>(`/compare/diff?endpointId=${endpointId}`)).data,
  getLogs: async (mode?: string) => (await api.get<LogEvent[]>(`/logs${mode ? `?mode=${mode}` : ""}`)).data,
  getApprovals: async () => (await api.get<ApprovalRecord[]>("/approvals")).data,
  postMirror: async (payload: unknown) => (await api.post("/traffic/mirror", payload)).data,
  postShadow: async (payload: unknown) => (await api.post("/traffic/shadow", payload)).data,
  postParallel: async (payload: unknown) => (await api.post("/traffic/parallel", payload)).data,
  postCanary: async (payload: unknown) => (await api.post("/traffic/canary", payload)).data,
  postProgressive: async (payload: unknown) => (await api.post("/traffic/progressive", payload)).data,
  postCutover: async (payload: unknown) => (await api.post("/traffic/cutover", payload)).data,
  postRollback: async (payload: unknown) => (await api.post("/traffic/rollback", payload)).data,
  postAction: async (payload: ActionRequest) => (await api.post("/actions/execute", payload)).data,
  postSimulation: async (payload: unknown) => (await api.post<SimulationResult>("/simulate", payload)).data,
  postApprovalRequest: async (payload: unknown) => (await api.post("/approvals/request", payload)).data,
  postApprovalDecision: async (payload: unknown) => (await api.post("/approvals/decide", payload)).data
};
