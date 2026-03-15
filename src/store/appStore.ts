import { create } from "zustand";
import { Environment } from "../types";

type Strategy = "Parallel Test" | "Canary" | "Progressive Shift" | "Full Cutover" | "Rollback";

interface Toast {
  id: number;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

interface AppState {
  environment: Environment;
  darkMode: boolean;
  selectedStrategy: Strategy;
  trafficPercent: number;
  toasts: Toast[];
  setEnvironment: (environment: Environment) => void;
  toggleDarkMode: () => void;
  setStrategy: (strategy: Strategy) => void;
  setTrafficPercent: (value: number) => void;
  pushToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: number) => void;
}

let toastId = 1;

export const useAppStore = create<AppState>((set) => ({
  environment: "Prod",
  darkMode: false,
  selectedStrategy: "Progressive Shift",
  trafficPercent: 25,
  toasts: [],
  setEnvironment: (environment) =>
    set((state) => ({
      environment,
      toasts: [
        ...state.toasts,
        {
          id: toastId++,
          type: "info",
          message: `Environment switched to ${environment}`
        }
      ]
    })),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setStrategy: (strategy) => set(() => ({ selectedStrategy: strategy })),
  setTrafficPercent: (value) => set(() => ({ trafficPercent: value })),
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: toastId++ }]
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
}));
