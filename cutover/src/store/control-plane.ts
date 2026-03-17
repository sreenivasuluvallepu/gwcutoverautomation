import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ActionKey, Environment, Role, TestingMode } from "../types/domain";

export type SourceGatewayName = "SDP(Onestream)" | "EASE" | "UK Partner";

export interface ActionSelection {
  endpointIds: string[];
  trafficPercent: number;
  updatedAt: string;
}

export const getActionSelectionKey = (environment: Environment, sourceGatewayName: SourceGatewayName, action: ActionKey) =>
  `${environment}::${sourceGatewayName}::${action}`;

interface ControlPlaneState {
  environment: Environment;
  role: Role;
  sourceGatewayName: SourceGatewayName;
  darkMode: boolean;
  selectedLegacyIds: string[];
  selectedKongIds: string[];
  migrationTargetIds: string[];
  globalMode: TestingMode;
  globalTrafficPercent: number;
  canaryPercent: number;
  actionSelections: Record<string, ActionSelection>;
  setEnvironment: (value: Environment) => void;
  setRole: (value: Role) => void;
  setSourceGatewayName: (value: SourceGatewayName) => void;
  toggleDarkMode: () => void;
  setSelectedLegacyIds: (ids: string[]) => void;
  setSelectedKongIds: (ids: string[]) => void;
  setMigrationTargetIds: (ids: string[]) => void;
  setGlobalMode: (mode: TestingMode) => void;
  setGlobalTrafficPercent: (percent: number) => void;
  setCanaryPercent: (percent: number) => void;
  setActionSelection: (payload: {
    environment: Environment;
    sourceGatewayName: SourceGatewayName;
    action: ActionKey;
    endpointIds: string[];
    trafficPercent: number;
  }) => void;
  getActionSelection: (environment: Environment, sourceGatewayName: SourceGatewayName, action: ActionKey) => ActionSelection | undefined;
}

export const useControlPlaneStore = create<ControlPlaneState>()(
  persist(
    (set, get) => ({
      environment: "prod",
      role: "operator",
      sourceGatewayName: "SDP(Onestream)",
      darkMode: false,
      selectedLegacyIds: [],
      selectedKongIds: [],
      migrationTargetIds: [],
      globalMode: "none",
      globalTrafficPercent: 10,
      canaryPercent: 10,
      actionSelections: {},
      setEnvironment: (value) => set({ environment: value }),
      setRole: (value) => set({ role: value }),
      setSourceGatewayName: (value) => set({ sourceGatewayName: value }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setSelectedLegacyIds: (ids) => set({ selectedLegacyIds: ids }),
      setSelectedKongIds: (ids) => set({ selectedKongIds: ids }),
      setMigrationTargetIds: (ids) => set({ migrationTargetIds: ids }),
      setGlobalMode: (mode) => set({ globalMode: mode }),
      setGlobalTrafficPercent: (percent) => set({ globalTrafficPercent: percent }),
      setCanaryPercent: (percent) => set({ canaryPercent: percent }),
      setActionSelection: ({ environment, sourceGatewayName, action, endpointIds, trafficPercent }) =>
        set((state) => {
          const key = getActionSelectionKey(environment, sourceGatewayName, action);
          return {
            actionSelections: {
              ...state.actionSelections,
              [key]: {
                endpointIds,
                trafficPercent,
                updatedAt: new Date().toISOString()
              }
            }
          };
        }),
      getActionSelection: (environment, sourceGatewayName, action) => {
        const key = getActionSelectionKey(environment, sourceGatewayName, action);
        return get().actionSelections[key];
      }
    }),
    {
      name: "cutover-control-plane-store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
