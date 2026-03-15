import { NavLink } from "react-router-dom";
import { cx } from "../../lib/utils";

const navItems = [
  { to: "/", label: "Executive Dashboard" },
  { to: "/inventory", label: "Migration Inventory" },
  { to: "/cutover", label: "Cutover Control Center" },
  { to: "/parallel-test", label: "Parallel Test Console" },
  { to: "/canary", label: "Canary Management" },
  { to: "/progressive-shift", label: "Progressive Shift Manager" },
  { to: "/rollback", label: "Rollback Center" },
  { to: "/environments", label: "Environment Manager" },
  { to: "/observability", label: "Logs and Metrics" },
  { to: "/audit", label: "Audit and Governance" }
];

export default function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-ink-200/70 bg-white/85 p-4 backdrop-blur md:block dark:border-ink-800 dark:bg-ink-950/75">
      <div className="rounded-xl bg-gradient-to-r from-ink-900 to-ink-700 p-4 text-white dark:from-teal-600 dark:to-ink-800">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-100">Gateway Migration</p>
        <h1 className="mt-1 text-lg font-bold leading-tight">Control Center</h1>
        <p className="mt-2 text-xs text-ink-100/90">UI-driven cutover automation for Legacy to Kong migrations.</p>
      </div>

      <nav className="mt-5 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cx(
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-ink-900 text-white dark:bg-teal-500 dark:text-ink-950"
                  : "text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-800"
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
