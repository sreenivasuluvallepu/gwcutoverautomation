import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../../components/ui/page-header";
import { Card, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/modal";
import { Input } from "../../components/ui/input";
import { useControlPlaneStore } from "../../store/control-plane";
import { useExecuteAction, useLegacyEndpoints } from "../../hooks/useData";
import { Api } from "../../lib/api";
import { ActionKey } from "../../types/domain";

const actions = [
  { key: "parallel-start", label: "Parallel Test Start" },
  { key: "mirror-enable", label: "Enable Mirror Mode" },
  { key: "shadow-enable", label: "Enable Shadow Mode" },
  { key: "canary-start", label: "Start Canary" },
  { key: "progressive-shift", label: "Progressive Shift" },
  { key: "full-cutover", label: "Full Cutover" },
  { key: "rollback", label: "Rollback" }
] as const;

const defaultTrafficByAction = (action: ActionKey, canaryPercent: number) => {
  if (action === "rollback") return 0;
  if (action === "full-cutover") return 100;
  if (action === "canary-start" || action === "progressive-shift") return canaryPercent;
  if (action === "mirror-enable" || action === "shadow-enable") return 10;
  return 100;
};

const sanitizeTargetGroup = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildAlbConfiguration = (action: ActionKey, trafficPercent: number, sourceGatewayName: string, endpointCount: number) => {
  const legacyTargetGroup = `tg-${sanitizeTargetGroup(sourceGatewayName)}`;
  const kongTargetGroup = "tg-kong-gateway";
  const legacyWeight = Math.max(0, 100 - trafficPercent);
  const kongWeight = Math.min(100, trafficPercent);

  if (action === "full-cutover") {
    return {
      strategy: "Full Cutover",
      listenerAction: "forward",
      targetGroups: [
        { name: legacyTargetGroup, weight: 0 },
        { name: kongTargetGroup, weight: 100 }
      ],
      notes: ["All live traffic is routed to Kong Gateway.", "Rollback remains available through action controls."]
    };
  }

  if (action === "rollback") {
    return {
      strategy: "Rollback",
      listenerAction: "forward",
      targetGroups: [
        { name: legacyTargetGroup, weight: 100 },
        { name: kongTargetGroup, weight: 0 }
      ],
      notes: ["Traffic is restored to GWLite target group.", "Kong receives no live traffic after rollback."]
    };
  }

  if (action === "canary-start" || action === "progressive-shift") {
    return {
      strategy: action === "canary-start" ? "Canary" : "Progressive Shift",
      listenerAction: "forward",
      targetGroups: [
        { name: legacyTargetGroup, weight: legacyWeight },
        { name: kongTargetGroup, weight: kongWeight }
      ],
      notes: [`Weighted routing applied at ALB for ${endpointCount} selected endpoints.`, "Rule scope is API/path specific based on selected migration units."]
    };
  }

  if (action === "mirror-enable" || action === "shadow-enable" || action === "parallel-start") {
    return {
      strategy: action === "mirror-enable" ? "Mirror" : action === "shadow-enable" ? "Shadow" : "Parallel",
      listenerAction: "forward",
      targetGroups: [
        { name: legacyTargetGroup, weight: 100 },
        { name: kongTargetGroup, weight: 0 }
      ],
      notes: [
        "ALB keeps live routing on GWLite.",
        "Mirror/Shadow/Parallel execution requires gateway/plugin or service-mesh duplication/comparison path."
      ]
    };
  }

  return {
    strategy: "Default",
    listenerAction: "forward",
    targetGroups: [
      { name: legacyTargetGroup, weight: 100 },
      { name: kongTargetGroup, weight: 0 }
    ],
    notes: ["Default safe routing plan."]
  };
};

export function ActionsPage() {
  const { data: endpoints = [] } = useLegacyEndpoints();
  const queryClient = useQueryClient();
  const execute = useExecuteAction();
  const environment = useControlPlaneStore((s) => s.environment);
  const role = useControlPlaneStore((s) => s.role);
  const sourceGatewayName = useControlPlaneStore((s) => s.sourceGatewayName);
  const migrationTargetIds = useControlPlaneStore((s) => s.migrationTargetIds);
  const canaryPercent = useControlPlaneStore((s) => s.canaryPercent);
  const setActionSelection = useControlPlaneStore((s) => s.setActionSelection);
  const getActionSelection = useControlPlaneStore((s) => s.getActionSelection);
  const [selectedAction, setSelectedAction] = useState<ActionKey | null>(null);
  const [previewAction, setPreviewAction] = useState<ActionKey | null>(null);
  const [configAction, setConfigAction] = useState<ActionKey | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isPrivileged = role === "operator" || role === "admin" || role === "approver";
  const fallbackEndpointIds = endpoints.slice(0, 20).map((e) => e.id);
  const endpointLookup = useMemo(() => new Map(endpoints.map((endpoint) => [endpoint.id, `${endpoint.method} ${endpoint.path}`])), [endpoints]);

  const resolveActionSelection = (action: ActionKey) => {
    const saved = getActionSelection(environment, sourceGatewayName, action);
    return {
      endpointIds: saved?.endpointIds?.length ? saved.endpointIds : migrationTargetIds.length > 0 ? migrationTargetIds : fallbackEndpointIds,
      trafficPercent: saved?.trafficPercent ?? defaultTrafficByAction(action, canaryPercent)
    };
  };

  const updateTrafficPercent = (action: ActionKey, value: number) => {
    const resolved = resolveActionSelection(action);
    const nextPercent = Math.max(0, Math.min(100, Number.isFinite(value) ? value : resolved.trafficPercent));
    setActionSelection({
      environment,
      sourceGatewayName,
      action,
      endpointIds: resolved.endpointIds,
      trafficPercent: nextPercent
    });
  };

  const executeTrafficAction = useMutation({
    mutationFn: async ({ action, endpointIds, trafficPercent }: { action: ActionKey; endpointIds: string[]; trafficPercent: number }) => {
      const context = { environment, sourceGatewayName, applyToAlb: true };
      if (action === "parallel-start") return Api.postParallel({ endpointIds, rule: "schema", tolerance: 2, ...context });
      if (action === "mirror-enable") return Api.postMirror({ endpointIds, mirrorPercent: trafficPercent, sampling: "1 in 5", logResponses: true, ...context });
      if (action === "shadow-enable") return Api.postShadow({ endpointIds, shadowPercent: trafficPercent, anomalyDetect: true, storeResponses: true, ...context });
      if (action === "canary-start") return Api.postCanary({ endpointIds, canaryPercent: trafficPercent, schedule: [1, 5, 10, 25, 50, 100], ...context });
      if (action === "progressive-shift") return Api.postProgressive({ endpointIds, targetPercent: trafficPercent, schedule: [1, 5, 10, 25, 50, 100], ...context });
      if (action === "full-cutover") return Api.postCutover({ endpointIds, ...context });
      if (action === "rollback") return Api.postRollback({ endpointIds, ...context });
      return { ok: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      queryClient.invalidateQueries({ queryKey: ["endpoints"] });
      queryClient.invalidateQueries({ queryKey: ["compare-results"] });
    }
  });

  const risk = useMemo(() => {
    if (selectedAction === "rollback") return "Medium";
    if (selectedAction === "full-cutover") return "High";
    if (selectedAction === "progressive-shift") return "Medium";
    return "Low";
  }, [selectedAction]);

  const selectedActionDetails = selectedAction ? resolveActionSelection(selectedAction) : null;
  const previewActionDetails = previewAction ? resolveActionSelection(previewAction) : null;
  const configActionDetails = configAction ? resolveActionSelection(configAction) : null;
  const configPayload =
    configAction && configActionDetails
      ? buildAlbConfiguration(configAction, configActionDetails.trafficPercent, sourceGatewayName, configActionDetails.endpointIds.length)
      : null;

  return (
    <div className="space-y-4">
      <PageHeader title="Cutover Actions" subtitle="Run traffic actions with impact preview, risk scoring, and audit-safe confirmations." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {
          const details = resolveActionSelection(action.key);
          return (
          <Card key={action.key}>
            <CardTitle>{action.label}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">Impact preview available before execution.</p>
            <div className="mt-3 grid gap-2">
              <label className="text-xs text-muted-foreground">Traffic %</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={details.trafficPercent}
                onChange={(event) => updateTrafficPercent(action.key, Number(event.target.value))}
              />
              <p className="text-xs text-muted-foreground">Endpoints remembered: {details.endpointIds.length}</p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                onClick={() => setPreviewAction(action.key)}
              >
                View Selection
              </button>
              <button
                type="button"
                className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                onClick={() => setConfigAction(action.key)}
              >
                Configuration
              </button>
              <Button
                className="ml-auto"
                disabled={!isPrivileged}
                onClick={() => {
                  setSelectedAction(action.key);
                  setConfirmOpen(true);
                }}
              >
                Execute
              </Button>
            </div>
            <Button
              onClick={() => {
                setActionSelection({
                  environment,
                  sourceGatewayName,
                  action: action.key,
                  endpointIds: migrationTargetIds.length > 0 ? migrationTargetIds : details.endpointIds,
                  trafficPercent: details.trafficPercent
                });
              }}
              variant="ghost"
              className="mt-2 h-8 px-2 text-xs"
            >
              Refresh from Workspace
            </Button>
          </Card>
          );
        })}
      </div>

      <Modal
        open={confirmOpen}
        title="Confirm Cutover Action"
        body={
          <div className="space-y-2">
            <p>
              Action: <strong>{selectedAction}</strong>
            </p>
            <p>Environment: {environment.toUpperCase()}</p>
            <p>GWLite Name: {sourceGatewayName}</p>
            <p>Impacted endpoints: {selectedActionDetails?.endpointIds.length ?? 0}</p>
            <p>Traffic %: {selectedActionDetails?.trafficPercent ?? 0}%</p>
            <p>Risk score: {risk}</p>
            <p className="text-xs text-muted-foreground">
              Endpoint source: {migrationTargetIds.length > 0 ? "Migration Workspace (Selected for Migration / Testing)" : "Fallback: first 20 GWLite endpoints"}.
            </p>
            <p className="text-xs text-muted-foreground">This action generates audit events, approval artifacts, and rollback checkpoints.</p>
          </div>
        }
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (!selectedAction) return;
          const details = resolveActionSelection(selectedAction);
          setActionSelection({
            environment,
            sourceGatewayName,
            action: selectedAction,
            endpointIds: details.endpointIds,
            trafficPercent: details.trafficPercent
          });
          executeTrafficAction.mutate({ action: selectedAction, endpointIds: details.endpointIds, trafficPercent: details.trafficPercent });
          execute.mutate({
            action: selectedAction,
            endpointIds: details.endpointIds,
            environment
          });
          setConfirmOpen(false);
        }}
        confirmLabel="Confirm Execute"
      />

      <Modal
        open={!!previewAction}
        title={`Selected Endpoints - ${previewAction ?? ""}`}
        body={
          <div className="space-y-2">
            <p>Environment: {environment.toUpperCase()}</p>
            <p>GWLite Name: {sourceGatewayName}</p>
            <p>Traffic %: {previewActionDetails?.trafficPercent ?? 0}%</p>
            <p>Endpoint count: {previewActionDetails?.endpointIds.length ?? 0}</p>
            <div className="max-h-64 overflow-y-auto rounded-md border border-border bg-muted/30 p-2">
              {previewActionDetails?.endpointIds.length ? (
                <ul className="space-y-1 text-xs">
                  {previewActionDetails.endpointIds.map((id) => (
                    <li key={id} className="font-mono">
                      {endpointLookup.get(id) ?? id}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">No endpoints saved for this action yet.</p>
              )}
            </div>
          </div>
        }
        onClose={() => setPreviewAction(null)}
        widthClassName="max-w-lg"
      />

      <Modal
        open={!!configAction}
        title={`ALB Configuration - ${configAction ?? ""}`}
        body={
          <div className="space-y-2">
            <p>Environment: {environment.toUpperCase()}</p>
            <p>GWLite Name: {sourceGatewayName}</p>
            <p>Traffic %: {configActionDetails?.trafficPercent ?? 0}%</p>
            <p>Endpoint count: {configActionDetails?.endpointIds.length ?? 0}</p>
            <div className="max-h-80 overflow-y-auto rounded-md border border-border bg-muted/30 p-2">
              <pre className="whitespace-pre-wrap text-xs leading-5 text-foreground">{JSON.stringify(configPayload, null, 2)}</pre>
            </div>
            <p className="text-xs text-muted-foreground">This popup shows the ALB plan to be applied for the selected action.</p>
          </div>
        }
        onClose={() => setConfigAction(null)}
        widthClassName="max-w-2xl"
      />
    </div>
  );
}
