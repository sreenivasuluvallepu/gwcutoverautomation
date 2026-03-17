import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Card, CardTitle } from "../../components/ui/card";
import { PageHeader } from "../../components/ui/page-header";
import { useModeDistribution, useSummary, useTrafficSplit, useTrend } from "../../hooks/useData";
import { modeLabel } from "../../lib/mode";
import { useGatewayName } from "../../hooks/useGatewayName";

const pieColors = ["#64748B", "#8B5CF6", "#EAB308", "#EF4444", "#3B82F6", "#10B981"];

export function DashboardPage() {
  const gatewayName = useGatewayName();
  const { data: summary } = useSummary();
  const { data: split = [] } = useTrafficSplit();
  const { data: modes = [] } = useModeDistribution();
  const { data: trend = [] } = useTrend();

  return (
    <div className="space-y-4">
      <PageHeader title="Executive Control Panel" subtitle={`Live migration status, validation mode posture, and traffic movement from ${gatewayName} to Kong Gateway.`} />

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          ["Total Endpoints", summary?.totalEndpoints ?? 0],
          ["Migrated", summary?.migrated ?? 0],
          ["Pending", summary?.pending ?? 0],
          ["Failed", summary?.failed ?? 0],
          ["Migration %", `${summary?.migrationPercent ?? 0}%`],
          ["Active Mode", modeLabel[summary?.activeMode ?? "none"]]
        ].map(([label, value], index) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
            <Card>
              <CardTitle>{label}</CardTitle>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-80">
          <CardTitle>{`Traffic Split (${gatewayName} vs Kong)`}</CardTitle>
          <div className="h-[250px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={split}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="legacy" stroke="#64748B" strokeWidth={2} />
                <Line type="monotone" dataKey="kong" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="h-80">
          <CardTitle>Testing Mode Distribution</CardTitle>
          <div className="h-[250px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modes} dataKey="count" nameKey="mode" outerRadius={90} label={(entry) => modeLabel[entry.mode]}>
                  {modes.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-80">
          <CardTitle>Migration Trend</CardTitle>
          <div className="h-[250px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="kong" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="h-80">
          <CardTitle>Error Comparison</CardTitle>
          <div className="pt-4 text-sm">
            <div className="mb-2 flex justify-between">
              <span>{`${gatewayName} Error Rate`}</span>
              <strong>1.9%</strong>
            </div>
            <div className="mb-2 flex justify-between">
              <span>Kong Error Rate</span>
              <strong>1.2%</strong>
            </div>
            <div className="mb-2 flex justify-between">
              <span>Latency Delta (p95)</span>
              <strong>-43ms</strong>
            </div>
            <div className="mt-3 rounded-lg bg-muted p-3 text-muted-foreground">
              Platform recommendation: continue canary expansion for low-risk payment read endpoints.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
