import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";
import {
  CreateRuleCommand,
  DescribeRulesCommand,
  ElasticLoadBalancingV2Client,
  ModifyRuleCommand
} from "@aws-sdk/client-elastic-load-balancing-v2";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const now = () => new Date().toISOString();

const MODE_WEIGHT = {
  none: 1,
  mirror: 2,
  shadow: 3,
  parallel: 4,
  canary: 5,
  cutover: 6
};

const modeOptions = ["none", "mirror", "shadow", "parallel", "canary", "cutover"];

const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
const SOURCE_KEY_BY_NAME = {
  "SDP(Onestream)": "sdp_onestream",
  EASE: "ease",
  "UK Partner": "uk_partner"
};
const ACTION_PRIORITY_OFFSET = {
  "parallel-start": 1,
  "mirror-enable": 2,
  "shadow-enable": 3,
  "canary-start": 4,
  "progressive-shift": 5,
  "full-cutover": 6,
  rollback: 7
};
const ENV_PRIORITY_OFFSET = { dev: 0, qa: 50, uat: 100, stage: 150, prod: 200 };
const SOURCE_PRIORITY_OFFSET = { sdp_onestream: 0, ease: 10, uk_partner: 20 };
const ALB_RULE_PRIORITY_BASE = Number(process.env.ALB_RULE_PRIORITY_BASE ?? 1000);

const albConfig = {
  listenerArn: process.env.ALB_LISTENER_ARN || "",
  kongTargetGroupArn: process.env.ALB_TG_KONG_ARN || "",
  sourceTargetGroups: {
    sdp_onestream: process.env.ALB_TG_SDP_ONESTREAM_ARN || "",
    ease: process.env.ALB_TG_EASE_ARN || "",
    uk_partner: process.env.ALB_TG_UK_PARTNER_ARN || ""
  }
};

const normalizeSourceKey = (sourceGatewayName) => SOURCE_KEY_BY_NAME[sourceGatewayName] || "sdp_onestream";

const resolveRoutingPercent = (action, body) => {
  if (action === "canary-start") return Number(body.canaryPercent ?? body.trafficPercent ?? 5);
  if (action === "progressive-shift") return Number(body.targetPercent ?? body.trafficPercent ?? 25);
  if (action === "full-cutover") return 100;
  if (action === "rollback") return 0;
  return 0;
};

const toPathPattern = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed;
  return `/${trimmed}`;
};

const getEndpointPathsFromIds = (endpointIds) => {
  const lookup = new Map([...state.legacy, ...state.kong].map((endpoint) => [endpoint.id, endpoint.path]));
  return [...new Set((endpointIds ?? []).map((id) => lookup.get(id)).filter(Boolean).map(toPathPattern).filter(Boolean))];
};

const getAlbPriority = ({ action, environment, sourceKey }) =>
  ALB_RULE_PRIORITY_BASE +
  (ENV_PRIORITY_OFFSET[environment] ?? ENV_PRIORITY_OFFSET.prod) +
  (SOURCE_PRIORITY_OFFSET[sourceKey] ?? SOURCE_PRIORITY_OFFSET.sdp_onestream) +
  (ACTION_PRIORITY_OFFSET[action] ?? 0);

const getAlbClient = () => new ElasticLoadBalancingV2Client({ region: AWS_REGION });

const buildAlbForwardAction = ({ legacyTargetGroupArn, kongTargetGroupArn, kongWeight }) => {
  const clampedKong = Math.max(0, Math.min(100, Math.round(Number(kongWeight) || 0)));
  return [
    {
      Type: "forward",
      ForwardConfig: {
        TargetGroups: [
          { TargetGroupArn: legacyTargetGroupArn, Weight: 100 - clampedKong },
          { TargetGroupArn: kongTargetGroupArn, Weight: clampedKong }
        ]
      }
    }
  ];
};

const maybeApplyAlbRouting = async ({ action, body, mode }) => {
  if (!body.applyToAlb) {
    return {
      applied: false,
      skipped: true,
      reason: "applyToAlb flag is false"
    };
  }
  return applyAlbRouting({ action, body, mode });
};

const applyAlbRouting = async ({ action, body, mode }) => {
  const sourceGatewayName = body.sourceGatewayName || "SDP(Onestream)";
  const environment = (body.environment || "prod").toLowerCase();
  const sourceKey = normalizeSourceKey(sourceGatewayName);
  const legacyTargetGroupArn = albConfig.sourceTargetGroups[sourceKey];
  const kongTargetGroupArn = albConfig.kongTargetGroupArn;
  const listenerArn = albConfig.listenerArn;

  if (!listenerArn || !legacyTargetGroupArn || !kongTargetGroupArn) {
    return {
      applied: false,
      skipped: true,
      reason: "ALB config missing. Set ALB_LISTENER_ARN, ALB_TG_KONG_ARN, and source target group ARNs.",
      requiredEnv: [
        "ALB_LISTENER_ARN",
        "ALB_TG_KONG_ARN",
        "ALB_TG_SDP_ONESTREAM_ARN",
        "ALB_TG_EASE_ARN",
        "ALB_TG_UK_PARTNER_ARN"
      ]
    };
  }

  const kongWeight = resolveRoutingPercent(action, body);
  const endpointPaths = getEndpointPathsFromIds(body.endpointIds ?? []);
  const selectedPaths = endpointPaths.length > 0 ? endpointPaths.slice(0, 5) : ["/*"];
  const truncatedPathCount = Math.max(0, endpointPaths.length - selectedPaths.length);
  const priority = getAlbPriority({ action, environment, sourceKey });
  const conditions = [
    {
      Field: "path-pattern",
      PathPatternConfig: {
        Values: selectedPaths
      }
    }
  ];

  const client = getAlbClient();
  const describe = await client.send(new DescribeRulesCommand({ ListenerArn: listenerArn }));
  const rules = describe.Rules ?? [];
  const existing = rules.find((rule) => rule.Priority === String(priority));
  const actions = buildAlbForwardAction({ legacyTargetGroupArn, kongTargetGroupArn, kongWeight });

  let ruleArn = existing?.RuleArn;
  if (existing?.RuleArn) {
    await client.send(
      new ModifyRuleCommand({
        RuleArn: existing.RuleArn,
        Conditions: conditions,
        Actions: actions
      })
    );
  } else {
    const createResult = await client.send(
      new CreateRuleCommand({
        ListenerArn: listenerArn,
        Priority: priority,
        Conditions: conditions,
        Actions: actions
      })
    );
    ruleArn = createResult.Rules?.[0]?.RuleArn;
  }

  addLog({
    mode,
    message: `AWS ALB applied for ${action} (${environment}/${sourceGatewayName}) priority=${priority} kong=${kongWeight}% paths=${selectedPaths.length}`
  });

  return {
    applied: true,
    listenerArn,
    ruleArn,
    priority,
    sourceGatewayName,
    environment,
    strategy: action,
    weights: { legacy: 100 - kongWeight, kong: kongWeight },
    targetGroups: {
      legacyTargetGroupArn,
      kongTargetGroupArn
    },
    selectedPaths,
    truncatedPathCount
  };
};

const defaultLegacy = Array.from({ length: 50 }).map((_, index) => ({
  id: `legacy-${index + 1}`,
  service: index % 2 === 0 ? "gwlegacy-payments" : "gwlegacy-accounts",
  method: index % 3 === 0 ? "POST" : "GET",
  path: index % 2 === 0 ? `/v1/payments/${index + 1}` : `/v1/accounts/${index + 1}`,
  owner: index % 2 === 0 ? "Payments Team" : "Core Banking Team",
  status: "active",
  mode: index % 8 === 0 ? "parallel" : index % 6 === 0 ? "shadow" : index % 5 === 0 ? "mirror" : "canary",
  trafficPercent: index % 8 === 0 ? 100 : index % 5 === 0 ? 15 : 10,
  migrated: false,
  source: "legacy"
}));

const defaultKong = Array.from({ length: 50 }).map((_, index) => ({
  id: `kong-${index + 1}`,
  service: index % 2 === 0 ? "kong-payments" : "kong-accounts",
  method: index % 3 === 0 ? "POST" : "GET",
  path: index % 2 === 0 ? `/v1/payments/${index + 1}` : `/v1/accounts/${index + 1}`,
  owner: index % 2 === 0 ? "Payments Team" : "Core Banking Team",
  status: "candidate",
  mode: index % 4 === 0 ? "canary" : "none",
  trafficPercent: index % 4 === 0 ? 5 : 0,
  migrated: index % 7 === 0,
  source: "kong"
}));

const state = {
  environmentRefs: {
    legacy: "gwlegacy",
    kong: "kong-api-gateway"
  },
  legacy: defaultLegacy,
  kong: defaultKong,
  compareResults: [],
  logs: [],
  approvals: [
    {
      id: "apr-1001",
      requestedBy: "operator@bank.local",
      action: "Start Canary 10%",
      status: "pending",
      createdAt: now()
    }
  ]
};

const tryPaths = [
  path.resolve(__dirname, "../data"),
  path.resolve(__dirname, "../../data")
];

const findExcel = (filename) => {
  for (const dir of tryPaths) {
    const full = path.join(dir, filename);
    if (fs.existsSync(full)) return full;
  }
  return null;
};

const toStr = (v) => (v === undefined || v === null ? "" : String(v));

const findField = (row, keys) => {
  const entries = Object.entries(row);
  for (const [name, value] of entries) {
    const keyLower = name.toLowerCase();
    if (keys.some((k) => keyLower.includes(k))) return toStr(value);
  }
  return "";
};

const normalizeRows = (rows, source) =>
  rows
    .map((row, idx) => {
      const method = findField(row, ["method", "http"]) || "GET";
      const p = findField(row, ["path", "route", "endpoint", "uri"]) || `/unknown/${idx + 1}`;
      const service = findField(row, ["service", "api", "app", "name"]) || `${source}-svc-${idx + 1}`;
      return {
        id: `${source}-${idx + 1}-${method}-${p}`.replace(/[^a-zA-Z0-9-_]/g, "_"),
        service,
        method: method.toUpperCase(),
        path: p,
        owner: findField(row, ["owner", "team"]) || "Platform Team",
        status: source === "legacy" ? "active" : "candidate",
        mode: "none",
        trafficPercent: 0,
        migrated: source === "kong",
        source
      };
    })
    .slice(0, 600);

const loadExcelData = () => {
  const legacyFile = findExcel("gwlite_endpoints.xlsx");
  const kongFile = findExcel("Kong_gateway.xlsx");
  if (!legacyFile || !kongFile) return;
  try {
    const legacyWb = XLSX.readFile(legacyFile);
    const kongWb = XLSX.readFile(kongFile);
    const legacySheet = legacyWb.Sheets[legacyWb.SheetNames[0]];
    const kongSheet = kongWb.Sheets[kongWb.SheetNames[0]];
    const legacyRows = XLSX.utils.sheet_to_json(legacySheet, { defval: "" });
    const kongRows = XLSX.utils.sheet_to_json(kongSheet, { defval: "" });
    const normLegacy = normalizeRows(legacyRows, "legacy");
    const normKong = normalizeRows(kongRows, "kong");
    if (normLegacy.length) state.legacy = normLegacy;
    if (normKong.length) state.kong = normKong;
    state.logs.push({
      id: cryptoId(),
      timestamp: now(),
      mode: "none",
      endpoint: "system",
      level: "INFO",
      message: `Excel data loaded: legacy=${normLegacy.length}, kong=${normKong.length}`
    });
  } catch (error) {
    state.logs.push({
      id: cryptoId(),
      timestamp: now(),
      mode: "none",
      endpoint: "system",
      level: "ERROR",
      message: `Excel parse failed: ${error.message}`
    });
  }
};

const cryptoId = () => `id-${Math.random().toString(16).slice(2)}-${Date.now()}`;

const addLog = ({ mode = "none", endpoint = "global", level = "INFO", message }) => {
  state.logs.unshift({
    id: cryptoId(),
    timestamp: now(),
    mode,
    endpoint,
    level,
    message
  });
  state.logs = state.logs.slice(0, 1000);
};

const fakeComparison = () => {
  state.compareResults = state.legacy.slice(0, 80).map((endpoint, idx) => {
    const mismatch = (idx * 7) % 17;
    return {
      endpointId: endpoint.id,
      endpoint: endpoint.path,
      method: endpoint.method,
      statusMatch: mismatch < 13,
      schemaMatch: mismatch < 10,
      latencyDeltaMs: (idx % 9) * 12 - 24,
      mismatchPercent: Number((mismatch * 0.7).toFixed(2)),
      passRate: Number((98 - mismatch * 0.8).toFixed(2))
    };
  });
};

const getSummary = () => {
  const all = [...state.legacy, ...state.kong];
  const total = all.length;
  const migrated = all.filter((x) => x.migrated).length;
  const pending = total - migrated;
  const failed = state.compareResults.filter((x) => x.passRate < 90).length;
  const activeMode = all
    .map((x) => x.mode)
    .sort((a, b) => MODE_WEIGHT[b] - MODE_WEIGHT[a])[0] ?? "none";
  return {
    totalEndpoints: total,
    migrated,
    pending,
    failed,
    migrationPercent: Number(((migrated / Math.max(1, total)) * 100).toFixed(2)),
    activeMode
  };
};

const getTrafficSplit = () =>
  Array.from({ length: 8 }).map((_, i) => ({
    label: `T-${7 - i}`,
    legacy: Math.max(0, 90 - i * 8),
    kong: Math.min(100, 10 + i * 8)
  }));

const getModeDistribution = () => {
  const count = { none: 0, mirror: 0, shadow: 0, parallel: 0, canary: 0, cutover: 0 };
  [...state.legacy, ...state.kong].forEach((e) => {
    count[e.mode] += 1;
  });
  return modeOptions.map((mode) => ({ mode, count: count[mode] }));
};

const getTrend = () =>
  Array.from({ length: 8 }).map((_, i) => ({
    label: `W${i + 1}`,
    legacy: 100 - i * 10,
    kong: 12 + i * 11
  }));

loadExcelData();
fakeComparison();

app.get("/api/health", (_, res) => res.json({ status: "ok", time: now(), refs: state.environmentRefs }));
app.get("/api/dashboard/summary", (_, res) => res.json(getSummary()));
app.get("/api/dashboard/traffic-split", (_, res) => res.json(getTrafficSplit()));
app.get("/api/dashboard/mode-distribution", (_, res) => res.json(getModeDistribution()));
app.get("/api/dashboard/migration-trend", (_, res) => res.json(getTrend()));

app.get("/api/endpoints/legacy", (_, res) => res.json(state.legacy));
app.get("/api/endpoints/kong", (_, res) => res.json(state.kong));
app.get("/api/endpoints/mapping", (_, res) => {
  const mapped = state.legacy.map((legacy) => {
    const kong = state.kong.find((k) => k.path === legacy.path && k.method === legacy.method);
    return { legacy, kong: kong ?? null };
  });
  res.json(mapped);
});

app.post("/api/migration/plan", (req, res) => {
  addLog({ message: `Migration plan updated for ${req.body.endpointIds?.length ?? 0} endpoints` });
  res.json({ ok: true, planId: cryptoId() });
});

const applyMode = (mode, body) => {
  const endpointIds = body.endpointIds ?? [];
  state.legacy = state.legacy.map((endpoint) =>
    endpointIds.includes(endpoint.id)
      ? { ...endpoint, mode, trafficPercent: body.trafficPercent ?? endpoint.trafficPercent, migrated: mode === "cutover" ? true : endpoint.migrated }
      : endpoint
  );
  addLog({ mode, message: `${mode.toUpperCase()} applied to ${endpointIds.length} endpoints at ${body.trafficPercent ?? 0}%` });
  fakeComparison();
};

app.post("/api/traffic/mirror", async (req, res) => {
  try {
    const body = req.body ?? {};
    applyMode("mirror", body);
    const albApplied = await maybeApplyAlbRouting({ action: "mirror-enable", body, mode: "mirror" });
    res.json({
      ok: true,
      strategy: "mirror",
      albPlan: { duplication: "enabled", percent: body.mirrorPercent ?? 10 },
      albApplied
    });
  } catch (error) {
    addLog({ mode: "mirror", level: "ERROR", message: `ALB apply failed for mirror: ${error.message}` });
    res.status(500).json({ ok: false, strategy: "mirror", error: error.message });
  }
});

app.post("/api/traffic/shadow", async (req, res) => {
  try {
    const body = req.body ?? {};
    applyMode("shadow", body);
    const albApplied = await maybeApplyAlbRouting({ action: "shadow-enable", body, mode: "shadow" });
    res.json({
      ok: true,
      strategy: "shadow",
      albPlan: { asyncRouting: true, percent: body.shadowPercent ?? 10 },
      albApplied
    });
  } catch (error) {
    addLog({ mode: "shadow", level: "ERROR", message: `ALB apply failed for shadow: ${error.message}` });
    res.status(500).json({ ok: false, strategy: "shadow", error: error.message });
  }
});

app.post("/api/traffic/parallel", async (req, res) => {
  try {
    const body = req.body ?? {};
    applyMode("parallel", body);
    const albApplied = await maybeApplyAlbRouting({ action: "parallel-start", body, mode: "parallel" });
    res.json({
      ok: true,
      strategy: "parallel",
      comparePolicy: { rule: body.rule ?? "schema", tolerance: body.tolerance ?? 2 },
      albApplied
    });
  } catch (error) {
    addLog({ mode: "parallel", level: "ERROR", message: `ALB apply failed for parallel: ${error.message}` });
    res.status(500).json({ ok: false, strategy: "parallel", error: error.message });
  }
});

app.post("/api/traffic/canary", async (req, res) => {
  try {
    const body = req.body ?? {};
    applyMode("canary", { ...body, trafficPercent: body.canaryPercent ?? body.trafficPercent ?? 5 });
    const albApplied = await maybeApplyAlbRouting({ action: "canary-start", body, mode: "canary" });
    res.json({
      ok: true,
      strategy: "canary",
      albPlan: { weightedTargetGroups: [100 - (body.canaryPercent ?? 10), body.canaryPercent ?? 10] },
      albApplied
    });
  } catch (error) {
    addLog({ mode: "canary", level: "ERROR", message: `ALB apply failed for canary: ${error.message}` });
    res.status(500).json({ ok: false, strategy: "canary", error: error.message });
  }
});

app.post("/api/traffic/progressive", async (req, res) => {
  try {
    const body = req.body ?? {};
    applyMode("canary", { ...body, trafficPercent: body.targetPercent ?? 25 });
    const albApplied = await maybeApplyAlbRouting({ action: "progressive-shift", body, mode: "canary" });
    res.json({
      ok: true,
      strategy: "progressive",
      schedule: body.schedule ?? [1, 5, 10, 25, 50, 100],
      albApplied
    });
  } catch (error) {
    addLog({ mode: "canary", level: "ERROR", message: `ALB apply failed for progressive: ${error.message}` });
    res.status(500).json({ ok: false, strategy: "progressive", error: error.message });
  }
});

app.post("/api/traffic/cutover", async (req, res) => {
  try {
    const body = req.body ?? {};
    applyMode("cutover", { ...body, trafficPercent: 100 });
    const albApplied = await maybeApplyAlbRouting({ action: "full-cutover", body, mode: "cutover" });
    res.json({
      ok: true,
      strategy: "full-cutover",
      albPlan: { legacyWeight: 0, kongWeight: 100 },
      albApplied
    });
  } catch (error) {
    addLog({ mode: "cutover", level: "ERROR", message: `ALB apply failed for cutover: ${error.message}` });
    res.status(500).json({ ok: false, strategy: "full-cutover", error: error.message });
  }
});

app.post("/api/traffic/rollback", async (req, res) => {
  try {
    const body = req.body ?? {};
    const endpointIds = body.endpointIds ?? [];
    state.legacy = state.legacy.map((endpoint) =>
      endpointIds.includes(endpoint.id) ? { ...endpoint, mode: "none", trafficPercent: 0, migrated: false } : endpoint
    );
    addLog({ mode: "cutover", level: "WARN", message: `Rollback executed for ${endpointIds.length} endpoints` });
    const albApplied = await maybeApplyAlbRouting({ action: "rollback", body, mode: "cutover" });
    res.json({
      ok: true,
      strategy: "rollback",
      albPlan: { legacyWeight: 100, kongWeight: 0 },
      albApplied
    });
  } catch (error) {
    addLog({ mode: "cutover", level: "ERROR", message: `ALB apply failed for rollback: ${error.message}` });
    res.status(500).json({ ok: false, strategy: "rollback", error: error.message });
  }
});

app.post("/api/actions/execute", (req, res) => {
  const { action, endpointIds = [] } = req.body ?? {};
  addLog({ mode: "none", message: `Action ${action} requested for ${endpointIds.length} endpoints` });
  if (["full-cutover", "progressive-shift", "canary-start"].includes(action)) {
    state.approvals.unshift({
      id: `apr-${Math.floor(Math.random() * 9000 + 1000)}`,
      requestedBy: "operator@bank.local",
      action,
      status: "pending",
      createdAt: now()
    });
  }
  res.json({ ok: true, action, risk: action === "full-cutover" ? "high" : "medium" });
});

app.get("/api/compare/results", (_, res) => res.json(state.compareResults));
app.get("/api/compare/diff", (req, res) => {
  const endpointId = req.query.endpointId;
  const found = state.compareResults.find((x) => x.endpointId === endpointId) ?? state.compareResults[0];
  res.json({
    endpointId: found?.endpointId ?? "unknown",
    legacyResponse: {
      status: 200,
      body: { message: "legacy-ok", timestamp: now(), account: "masked", nested: { trace: "legacy-trace", flags: ["a", "b"] } }
    },
    kongResponse: {
      status: found?.statusMatch ? 200 : 500,
      body: { message: found?.statusMatch ? "legacy-ok" : "kong-mismatch", timestamp: now(), account: "masked", nested: { trace: "kong-trace", flags: ["a"] } }
    },
    diffSummary: found?.schemaMatch
      ? ["No schema drift detected", `Latency delta: ${found.latencyDeltaMs}ms`]
      : ["Field nested.trace differs", "Flags array length mismatch", "Potential plugin transformation mismatch"]
  });
});

app.get("/api/logs", (req, res) => {
  const mode = req.query.mode;
  if (!mode) return res.json(state.logs);
  res.json(state.logs.filter((log) => log.mode === mode));
});

app.get("/api/approvals", (_, res) => res.json(state.approvals));
app.post("/api/approvals/request", (req, res) => {
  const record = {
    id: `apr-${Math.floor(Math.random() * 9000 + 1000)}`,
    requestedBy: req.body.requestedBy ?? "operator@bank.local",
    action: req.body.action ?? "Unknown",
    status: "pending",
    createdAt: now()
  };
  state.approvals.unshift(record);
  addLog({ message: `Approval requested for ${record.action}` });
  res.json(record);
});

app.post("/api/approvals/decide", (req, res) => {
  const { id, decision } = req.body ?? {};
  state.approvals = state.approvals.map((entry) => (entry.id === id ? { ...entry, status: decision } : entry));
  addLog({ message: `Approval ${id} marked as ${decision}` });
  res.json({ ok: true });
});

app.post("/api/simulate", (req, res) => {
  const percent = Number(req.body.percent ?? 10);
  const endpointCount = Number(req.body.endpointCount ?? 25);
  const predictedFailureRate = Number((Math.max(0.1, (percent * endpointCount) / 2500)).toFixed(2));
  const riskScore = Math.min(100, Math.round(predictedFailureRate * 25 + endpointCount * 0.8));
  res.json({
    predictedFailureRate,
    riskScore,
    recommendation:
      riskScore > 70
        ? "Use shadow + parallel before canary expansion. Keep rollback pre-armed."
        : "Safe to proceed with incremental canary and progressive shift."
  });
});

const distPath = path.resolve(__dirname, "../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`Cutover API running at http://localhost:${port}`);
});
