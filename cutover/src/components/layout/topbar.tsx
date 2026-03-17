import { Moon, ShieldCheck, Sun } from "lucide-react";
import { Select } from "../ui/select";
import { useControlPlaneStore } from "../../store/control-plane";

export function Topbar() {
  const environment = useControlPlaneStore((s) => s.environment);
  const role = useControlPlaneStore((s) => s.role);
  const sourceGatewayName = useControlPlaneStore((s) => s.sourceGatewayName);
  const darkMode = useControlPlaneStore((s) => s.darkMode);
  const setEnvironment = useControlPlaneStore((s) => s.setEnvironment);
  const setRole = useControlPlaneStore((s) => s.setRole);
  const setSourceGatewayName = useControlPlaneStore((s) => s.setSourceGatewayName);
  const toggleDarkMode = useControlPlaneStore((s) => s.toggleDarkMode);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold">Enterprise Change Window: Active</span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={environment} onChange={(e) => setEnvironment(e.target.value as typeof environment)}>
            <option value="dev">Dev</option>
            <option value="qa">QA</option>
            <option value="uat">UAT</option>
            <option value="stage">Stage</option>
            <option value="prod">Prod</option>
          </Select>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-muted-foreground">GWLite Name</span>
            <Select value={sourceGatewayName} onChange={(e) => setSourceGatewayName(e.target.value as typeof sourceGatewayName)} className="min-w-[170px]">
              <option value="SDP(Onestream)">SDP(Onestream)</option>
              <option value="EASE">EASE</option>
              <option value="UK Partner">UK Partner</option>
            </Select>
          </div>
          <Select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
            <option value="viewer">Viewer</option>
            <option value="operator">Operator</option>
            <option value="approver">Approver</option>
            <option value="admin">Admin</option>
          </Select>
          <button className="rounded-lg border border-border p-2" onClick={toggleDarkMode} aria-label="theme">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
