import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/app-shell";
import { DashboardPage } from "./features/dashboard/dashboard-page";
import { TopologyPage } from "./features/topology/topology-page";
import { WorkspacePage } from "./features/workspace/workspace-page";
import { StrategyPage } from "./features/strategy/strategy-page";
import { ComparisonPage } from "./features/comparison/comparison-page";
import { ActionsPage } from "./features/actions/actions-page";
import { LogsPage } from "./features/logs/logs-page";
import { SimulationPage } from "./features/simulation/simulation-page";
import { GovernancePage } from "./features/governance/governance-page";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/topology" element={<TopologyPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/strategy" element={<StrategyPage />} />
        <Route path="/comparison" element={<ComparisonPage />} />
        <Route path="/actions" element={<ActionsPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/governance" element={<GovernancePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
