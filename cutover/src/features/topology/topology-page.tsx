import { useMemo, useState } from "react";
import ReactFlow, { Background, Controls, Edge, Node, NodeMouseHandler } from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardTitle } from "../../components/ui/card";
import { PageHeader } from "../../components/ui/page-header";
import { Badge } from "../../components/ui/badge";
import { useLegacyEndpoints } from "../../hooks/useData";
import { modeLabel, modeStroke } from "../../lib/mode";
import { TestingMode } from "../../types/domain";
import { useGatewayName } from "../../hooks/useGatewayName";

type EdgeMeta = { mode: TestingMode; traffic: number };

const baseNodes: Node[] = [
  { id: "legacy", position: { x: 50, y: 120 }, data: { label: "Source Gateway" }, type: "input" },
  { id: "alb", position: { x: 320, y: 120 }, data: { label: "ALB Routing Layer" } },
  { id: "kong", position: { x: 600, y: 120 }, data: { label: "Kong Gateway Enterprise" }, type: "output" }
];

export function TopologyPage() {
  const gatewayName = useGatewayName();
  const { data: endpoints = [] } = useLegacyEndpoints();
  const [selectedEdge, setSelectedEdge] = useState<Edge<EdgeMeta> | null>(null);
  const nodes = useMemo(
    () =>
      baseNodes.map((node) =>
        node.id === "legacy" ? { ...node, data: { ...(node.data as Record<string, unknown>), label: gatewayName } } : node
      ),
    [gatewayName]
  );

  const edgeMode: TestingMode = endpoints[0]?.mode ?? "canary";
  const edges = useMemo<Edge<EdgeMeta>[]>(
    () => [
      {
        id: "e-legacy-alb",
        source: "legacy",
        target: "alb",
        label: "Ingress",
        data: { mode: "none", traffic: 100 },
        style: { stroke: modeStroke.none, strokeWidth: 3 }
      },
      {
        id: "e-alb-kong",
        source: "alb",
        target: "kong",
        label: `${modeLabel[edgeMode]} • ${Math.max(endpoints[0]?.trafficPercent ?? 10, 1)}%`,
        data: { mode: edgeMode, traffic: endpoints[0]?.trafficPercent ?? 10 },
        animated: true,
        className: "mode-line",
        style: { stroke: modeStroke[edgeMode], strokeWidth: 4 }
      }
    ],
    [edgeMode, endpoints]
  );

  const onNodeClick: NodeMouseHandler = (_, node) => {
    if (node.id === "alb") setSelectedEdge(edges[1]);
  };

  const edgeEndpoints = endpoints.filter((e) => e.mode === (selectedEdge?.data?.mode ?? "none")).slice(0, 7);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Topology Visualization"
        subtitle={`Interactive control flow from ${gatewayName} to ALB to Kong with mode-aware traffic edges and drilldown insights.`}
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="h-[560px]">
          <CardTitle>Gateway Flow Topology</CardTitle>
          <div className="mt-3 h-[500px] overflow-hidden rounded-lg border border-border">
            <ReactFlow nodes={nodes} edges={edges} onNodeClick={onNodeClick} onEdgeClick={(_, edge) => setSelectedEdge(edge as Edge<EdgeMeta>)}>
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </Card>
        <Card className="h-[560px] overflow-y-auto">
          <CardTitle>Edge Insight Panel</CardTitle>
          {selectedEdge ? (
            <div className="mt-3 space-y-3 text-sm">
              <div className="rounded-lg bg-muted p-3">
                <p className="font-semibold">{selectedEdge.label}</p>
                <p className="text-muted-foreground">Traffic: {selectedEdge.data?.traffic}%</p>
                <Badge className="mt-2">{modeLabel[selectedEdge.data?.mode ?? "none"]}</Badge>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Endpoints on this mode</p>
                <ul className="space-y-2">
                  {edgeEndpoints.length === 0 && <li className="text-muted-foreground">No endpoints mapped yet.</li>}
                  {edgeEndpoints.map((endpoint) => (
                    <li key={endpoint.id} className="rounded-lg border border-border p-2">
                      <p className="font-mono text-xs">
                        {endpoint.method} {endpoint.path}
                      </p>
                      <p className="text-xs text-muted-foreground">{endpoint.service}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="font-semibold">Comparison Snapshot</p>
                <p className="text-xs text-muted-foreground">Mismatch rate: 2.1%</p>
                <p className="text-xs text-muted-foreground">Latency delta: -38ms p95</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Click an edge or ALB node to inspect mode configuration and endpoint stats.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
