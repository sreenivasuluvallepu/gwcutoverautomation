import { useState } from "react";
import { PageHeader } from "../../components/ui/page-header";
import { Card, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { useRunSimulation } from "../../hooks/useData";

export function SimulationPage() {
  const [mode, setMode] = useState("canary");
  const [percent, setPercent] = useState(10);
  const [endpointCount, setEndpointCount] = useState(25);
  const simulation = useRunSimulation();

  return (
    <div className="space-y-4">
      <PageHeader title="Simulation Mode" subtitle="Run dry-run projections for canary, parallel, or shadow strategies before live ALB routing changes." />
      <Card>
        <CardTitle>Simulation Inputs</CardTitle>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Simulation Mode</p>
            <Select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="canary">Canary</option>
              <option value="parallel">Parallel</option>
              <option value="shadow">Shadow</option>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Traffic Percentage (%)</p>
            <Input
              type="number"
              min={1}
              max={100}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Endpoint Count</p>
            <Input
              type="number"
              min={1}
              max={300}
              value={endpointCount}
              onChange={(e) => setEndpointCount(Number(e.target.value))}
            />
          </div>
        </div>
        <Button className="mt-3" onClick={() => simulation.mutate({ mode, percent, endpointCount })}>
          Run Simulation
        </Button>
      </Card>
      <Card>
        <CardTitle>Predicted Outcome</CardTitle>
        {simulation.data ? (
          <div className="mt-3 space-y-2 text-sm">
            <p>Predicted failure rate: {simulation.data.predictedFailureRate}%</p>
            <p>Risk score: {simulation.data.riskScore}</p>
            <p>Recommendation: {simulation.data.recommendation}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Run a simulation to get projected risk and rollback guidance.</p>
        )}
      </Card>
    </div>
  );
}
