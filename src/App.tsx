import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import CutoverControlPage from "./pages/CutoverControlPage";
import ParallelTestPage from "./pages/ParallelTestPage";
import CanaryPage from "./pages/CanaryPage";
import ProgressiveShiftPage from "./pages/ProgressiveShiftPage";
import RollbackPage from "./pages/RollbackPage";
import EnvironmentsPage from "./pages/EnvironmentsPage";
import ObservabilityPage from "./pages/ObservabilityPage";
import AuditPage from "./pages/AuditPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/cutover" element={<CutoverControlPage />} />
        <Route path="/parallel-test" element={<ParallelTestPage />} />
        <Route path="/canary" element={<CanaryPage />} />
        <Route path="/progressive-shift" element={<ProgressiveShiftPage />} />
        <Route path="/rollback" element={<RollbackPage />} />
        <Route path="/environments" element={<EnvironmentsPage />} />
        <Route path="/observability" element={<ObservabilityPage />} />
        <Route path="/audit" element={<AuditPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
