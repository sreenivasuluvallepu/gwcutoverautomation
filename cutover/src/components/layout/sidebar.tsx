import { NavLink } from "react-router-dom";
import { cn } from "../../lib/cn";
import { useGatewayName } from "../../hooks/useGatewayName";

const items = [
  { to: "/", label: "Dashboard" },
  { to: "/topology", label: "Topology" },
  { to: "/workspace", label: "Migration Workspace" },
  { to: "/strategy", label: "Traffic Strategy" },
  { to: "/comparison", label: "Comparison" },
  { to: "/actions", label: "Cutover Actions" },
  { to: "/logs", label: "Logs" },
  { to: "/simulation", label: "Simulation" },
  { to: "/governance", label: "Governance" }
];

export function Sidebar() {
  const gatewayName = useGatewayName();
  return (
    <aside className="hidden w-72 shrink-0 border-r border-border bg-card/85 p-4 lg:block">
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 p-4 text-white">
        <p className="text-xs uppercase tracking-wide">Migration Control Plane</p>
        <h1 className="mt-1 text-xl font-bold">{gatewayName} → Kong</h1>
      </div>
      <nav className="mt-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
