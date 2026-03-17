import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../lib/api";
import { ActionRequest, TestingMode } from "../types/domain";

export const useSummary = () => useQuery({ queryKey: ["summary"], queryFn: Api.getSummary });
export const useTrafficSplit = () => useQuery({ queryKey: ["traffic-split"], queryFn: Api.getTrafficSplit });
export const useModeDistribution = () => useQuery({ queryKey: ["mode-dist"], queryFn: Api.getModeDistribution });
export const useTrend = () => useQuery({ queryKey: ["trend"], queryFn: Api.getTrend });
export const useLegacyEndpoints = () => useQuery({ queryKey: ["endpoints", "legacy"], queryFn: Api.getLegacyEndpoints });
export const useKongEndpoints = () => useQuery({ queryKey: ["endpoints", "kong"], queryFn: Api.getKongEndpoints });
export const useCompareResults = () => useQuery({ queryKey: ["compare-results"], queryFn: Api.getCompareResults, refetchInterval: 8000 });
export const useLogs = (mode?: TestingMode | "all") =>
  useQuery({ queryKey: ["logs", mode], queryFn: () => Api.getLogs(mode && mode !== "all" ? mode : undefined), refetchInterval: 6000 });
export const useApprovals = () => useQuery({ queryKey: ["approvals"], queryFn: Api.getApprovals, refetchInterval: 5000 });

export const useExecuteAction = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActionRequest) => Api.postAction(payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["summary"] });
      client.invalidateQueries({ queryKey: ["logs"] });
      client.invalidateQueries({ queryKey: ["approvals"] });
    }
  });
};

export const useRunSimulation = () => useMutation({ mutationFn: (payload: unknown) => Api.postSimulation(payload) });
export const useApproveDecision = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => Api.postApprovalDecision(payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["approvals"] });
      client.invalidateQueries({ queryKey: ["logs"] });
    }
  });
};
