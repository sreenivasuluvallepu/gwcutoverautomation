import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ToastRegion from "../common/ToastRegion";
import { useEffect } from "react";
import { useAppStore } from "../../store/appStore";

export default function AppShell() {
  const darkMode = useAppStore((state) => state.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <main className="mx-auto max-w-[1500px] p-4 md:p-5">
          <Outlet />
        </main>
      </div>
      <ToastRegion />
    </div>
  );
}
