import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PageHeader } from "../../components/ui/page-header";
import { Card, CardTitle } from "../../components/ui/card";
import { Switch } from "../../components/ui/switch";
import { Select } from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Api } from "../../lib/api";
import { modeColor, modeLabel, resolveModePriority } from "../../lib/mode";
import { TestingMode } from "../../types/domain";
import { useControlPlaneStore } from "../../store/control-plane";

export function StrategyPage() {
  const [mirrorEnabled, setMirrorEnabled] = useState(true);
  const [mirrorPercent, setMirrorPercent] = useState(20);
  const [sampling, setSampling] = useState("1 in 5");

  const [shadowEnabled, setShadowEnabled] = useState(true);
  const [shadowPercent, setShadowPercent] = useState(15);
  const [anomalyDetect, setAnomalyDetect] = useState(true);

  const [parallelEnabled, setParallelEnabled] = useState(true);
  const [rule, setRule] = useState("schema");
  const [tolerance, setTolerance] = useState(2);

  const [canaryEnabled, setCanaryEnabled] = useState(true);
  const canaryPercent = useControlPlaneStore((s) => s.canaryPercent);
  const setCanaryPercent = useControlPlaneStore((s) => s.setCanaryPercent);
  const migrationTargetIds = useControlPlaneStore((s) => s.migrationTargetIds);

  const activeModes = useMemo<TestingMode[]>(() => {
    const list: TestingMode[] = [];
    if (mirrorEnabled) list.push("mirror");
    if (shadowEnabled) list.push("shadow");
    if (parallelEnabled) list.push("parallel");
    if (canaryEnabled) list.push("canary");
    return list;
  }, [canaryEnabled, mirrorEnabled, parallelEnabled, shadowEnabled]);

  const resolved = resolveModePriority(activeModes);

  const mirrorMutation = useMutation({ mutationFn: Api.postMirror });
  const shadowMutation = useMutation({ mutationFn: Api.postShadow });
  const parallelMutation = useMutation({ mutationFn: Api.postParallel });
  const canaryMutation = useMutation({ mutationFn: Api.postCanary });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Traffic Strategy & Testing Configuration"
        subtitle="Configure mirror, shadow, parallel, and canary modes with route-level controls and policy-aware priority resolution."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Mirror Testing (Traffic Duplication)</CardTitle>
            <Switch checked={mirrorEnabled} onChange={setMirrorEnabled} />
          </div>
          <div className="mt-3 grid gap-2">
            <label className="text-xs text-muted-foreground">Mirror %</label>
            <Input type="number" min={1} max={100} value={mirrorPercent} onChange={(e) => setMirrorPercent(Number(e.target.value))} />
            <label className="text-xs text-muted-foreground">Sampling</label>
            <Select value={sampling} onChange={(e) => setSampling(e.target.value)}>
              <option>1 in 1</option>
              <option>1 in 5</option>
              <option>1 in 10</option>
              <option>1 in 20</option>
            </Select>
            <Button
              onClick={() => mirrorMutation.mutate({ enabled: mirrorEnabled, mirrorPercent, sampling, logResponses: true })}
              className="mt-2"
            >
              Save Mirror Policy
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Shadow Traffic (Silent Validation)</CardTitle>
            <Switch checked={shadowEnabled} onChange={setShadowEnabled} />
          </div>
          <div className="mt-3 grid gap-2">
            <label className="text-xs text-muted-foreground">Shadow %</label>
            <Input type="number" min={1} max={100} value={shadowPercent} onChange={(e) => setShadowPercent(Number(e.target.value))} />
            <label className="text-xs text-muted-foreground">Anomaly Detection</label>
            <Switch checked={anomalyDetect} onChange={setAnomalyDetect} />
            <Button onClick={() => shadowMutation.mutate({ enabled: shadowEnabled, shadowPercent, anomalyDetect, storeResponses: true })} className="mt-2">
              Save Shadow Policy
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Parallel Testing (Side-by-Side)</CardTitle>
            <Switch checked={parallelEnabled} onChange={setParallelEnabled} />
          </div>
          <div className="mt-3 grid gap-2">
            <label className="text-xs text-muted-foreground">Comparison Rule</label>
            <Select value={rule} onChange={(e) => setRule(e.target.value)}>
              <option value="exact">Exact Match</option>
              <option value="schema">Schema Match</option>
              <option value="tolerance">Tolerance Threshold</option>
            </Select>
            <label className="text-xs text-muted-foreground">Mismatch tolerance %</label>
            <Input type="number" min={0} max={100} value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} />
            <Button onClick={() => parallelMutation.mutate({ enabled: parallelEnabled, rule, tolerance })} className="mt-2">
              Save Parallel Policy
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Canary Deployment</CardTitle>
            <Switch checked={canaryEnabled} onChange={setCanaryEnabled} />
          </div>
          <div className="mt-3 grid gap-2">
            <label className="text-xs text-muted-foreground">Canary %</label>
            <Input type="number" min={1} max={100} value={canaryPercent} onChange={(e) => setCanaryPercent(Number(e.target.value))} />
            <div className="flex flex-wrap gap-2">
              {[1, 5, 10, 25, 50, 100].map((preset) => (
                <Button key={preset} variant="ghost" onClick={() => setCanaryPercent(preset)}>
                  {preset}%
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Used by Cutover Actions → Start Canary / Progressive Shift.</p>
            <Button
              onClick={() =>
                canaryMutation.mutate({
                  enabled: canaryEnabled,
                  canaryPercent,
                  endpointIds: migrationTargetIds,
                  schedule: [1, 5, 10, 25, 50, 100]
                })
              }
              className="mt-2"
            >
              Save Canary Policy
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>Mode Priority Resolution</CardTitle>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {activeModes.length === 0 && <Badge className={modeColor.none}>None</Badge>}
          {activeModes.map((mode) => (
            <Badge key={mode} className={modeColor[mode]}>
              {modeLabel[mode]}
            </Badge>
          ))}
          <span className="mx-1 text-sm text-muted-foreground">→ Effective Mode:</span>
          <Badge className={modeColor[resolved]}>{modeLabel[resolved]}</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Priority logic: Full Cutover &gt; Canary &gt; Parallel &gt; Shadow &gt; Mirror &gt; None. Canary overrides mirror for live routing while mirror/shadow can still collect passive validation.
        </p>
      </Card>
    </div>
  );
}
