import { TestingMode } from "../types/domain";

export const modeColor: Record<TestingMode, string> = {
  none: "text-slate-500 bg-slate-200/70",
  mirror: "text-violet-700 bg-violet-100",
  shadow: "text-yellow-700 bg-yellow-100",
  parallel: "text-red-700 bg-red-100",
  canary: "text-blue-700 bg-blue-100",
  cutover: "text-emerald-700 bg-emerald-100"
};

export const modeStroke: Record<TestingMode, string> = {
  none: "#64748B",
  mirror: "#8B5CF6",
  shadow: "#EAB308",
  parallel: "#EF4444",
  canary: "#3B82F6",
  cutover: "#10B981"
};

export const modeLabel: Record<TestingMode, string> = {
  none: "None",
  mirror: "Mirror",
  shadow: "Shadow",
  parallel: "Parallel",
  canary: "Canary",
  cutover: "Full Cutover"
};

export const resolveModePriority = (modes: TestingMode[]) => {
  if (modes.includes("cutover")) return "cutover";
  if (modes.includes("canary")) return "canary";
  if (modes.includes("parallel")) return "parallel";
  if (modes.includes("shadow")) return "shadow";
  if (modes.includes("mirror")) return "mirror";
  return "none";
};
