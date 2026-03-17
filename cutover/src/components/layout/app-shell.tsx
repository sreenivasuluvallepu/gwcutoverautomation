import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useControlPlaneStore } from "../../store/control-plane";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell() {
  const darkMode = useControlPlaneStore((s) => s.darkMode);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <main className="mx-auto max-w-[1700px] p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
